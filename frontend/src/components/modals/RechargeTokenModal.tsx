import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { metersService } from '@/services/meters';
import { rechargesService } from '@/services/recharges';
import { Meter as MeterType } from '@/types/models';
import { Loader2, Zap, CheckCircle } from "lucide-react";

interface RechargeTokenModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RechargeTokenModal = ({ open, onOpenChange }: RechargeTokenModalProps) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const pollingRef = useRef<number | null>(null);
  const [formData, setFormData] = useState({
    token: "",
    meterNumber: ""
  });
  const { toast } = useToast();

  const [meters, setMeters] = useState<{ id: string; name?: string; meterNumber?: string }[]>([]);

  useEffect(() => {
    let isMounted = true;
    metersService.getMeters({ page_size: 200 }).then((res) => {
      const list: MeterType[] = Array.isArray(res) ? res : (res.results || []);
      if (!isMounted) return;
      setMeters(list.map((m: MeterType) => ({ 
        id: String(m.id), 
        name: (m.nickname || m.name), 
        meterNumber: m.meter_number 
      })));
    }).catch((err) => { console.debug('failed to load meters for recharge modal', err); });
    return () => { isMounted = false; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await metersService.rechargeToken(formData.meterNumber, formData.token);
      // if res indicates success, show success UI
      if (res && res.status === 'success') {
        setSuccess(true);
        toast({ title: 'Token Recharged', description: 'Your electricity has been recharged.' });
        // notify listeners to refresh recent recharges
        try { window.dispatchEvent(new CustomEvent('recharge:updated', { detail: { id: res.id || null, status: 'success' } })); } catch (e) { console.debug('ev dispatch failed', e); }
      } else if (res && (res.status === 'pending' || res.status === 'scheduled' || res.status === 202)) {
        // backend will return pending with an id for ManualRecharge; start polling
        const id = res.id || res.detail || null;
          if (id) {
          setPendingId(Number(id));
          toast({ title: 'Verification scheduled', description: 'We are verifying your token. This may take a few seconds.' });
          // notify UI that a pending recharge exists so it can refresh immediately
            try { window.dispatchEvent(new CustomEvent('recharge:updated', { detail: { id: Number(id), status: 'pending' } })); } catch (e) { console.debug('ev dispatch failed', e); }
          // start polling
          pollManualRecharge(Number(id));
        } else {
          toast({ title: 'Recharge Pending', description: 'Verification scheduled (no id returned).' });
        }
      } else {
        // backend may return failure details in the success-path payload
        setSuccess(false);
        const msg = res && (res.message || res.detail) ? (res.message || res.detail) : 'Could not recharge token.';
        toast({ title: 'Recharge Failed', description: String(msg), variant: 'destructive' });
      }
    } catch (err: unknown) {
      // Axios throws on non-2xx; pull message from the response where possible
      let msg = 'Could not recharge token.';
      try {
        const e = err as Record<string, unknown>;
        const resp = e.response as Record<string, unknown> | undefined;
        const data = resp?.data;
        if (typeof data === 'string') msg = data;
        else if (data && typeof data === 'object') {
          const dd = data as Record<string, unknown>;
          msg = (dd['message'] as string) || (dd['detail'] as string) || JSON.stringify(data);
        }
        else if (typeof e.message === 'string') msg = e.message;
      } catch (ex) {
        console.debug('error extracting error message', ex);
      }
      setSuccess(false);
      toast({ title: 'Recharge Failed', description: String(msg), variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const stopPolling = () => {
    if (pollingRef.current) {
      window.clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    setPendingId(null);
  };

  const pollManualRecharge = (id: number) => {
    // poll every 2s up to 10 times
    let attempts = 0;
    pollingRef.current = window.setInterval(async () => {
      attempts += 1;
      try {
      const data = await rechargesService.get(String(id));
      if (!data) return;
      const status = (data as unknown as Record<string, unknown>).status as string | undefined;
          if (status && status !== 'pending') {
          stopPolling();
          if (status === 'success') {
            setSuccess(true);
            toast({ title: 'Token Recharged', description: 'Your electricity has been recharged.' });
            try { window.dispatchEvent(new CustomEvent('recharge:updated', { detail: { id: Number(id), status: 'success' } })); } catch (e) { console.debug('ev dispatch failed', e); }
          } else if (status === 'rejected') {
            {
              const d = data as Record<string, unknown> | null;
              const msg = d && typeof d === 'object' ? (d['message'] as string) || (d['detail'] as string) || 'Token rejected' : 'Token rejected';
              toast({ title: 'Recharge Rejected', description: msg, variant: 'destructive' });
            }
            try { window.dispatchEvent(new CustomEvent('recharge:updated', { detail: { id: Number(id), status: 'rejected' } })); } catch (e) { console.debug('ev dispatch failed', e); }
          } else {
            {
              const d = data as Record<string, unknown> | null;
              const msg = d && typeof d === 'object' ? (d['message'] as string) || (d['detail'] as string) || 'Failed to apply token' : 'Failed to apply token';
              toast({ title: 'Recharge Failed', description: msg, variant: 'destructive' });
            }
            try { window.dispatchEvent(new CustomEvent('recharge:updated', { detail: { id: Number(id), status: 'failed' } })); } catch (e) { console.debug('ev dispatch failed', e); }
          }
        } else if (attempts >= 10) {
          stopPolling();
          toast({ title: 'Verification timed out', description: 'We could not verify the token in time. Please try again later.', variant: 'destructive' });
        }
      } catch (e) {
        console.debug('polling manual recharge failed', e);
      }
    }, 2000);
  };

  const handleClose = () => {
    onOpenChange(false);
    setSuccess(false);
    setFormData({ token: "", meterNumber: "" });
  };

  if (success) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md text-center">
          <div className="flex flex-col items-center space-y-4 py-6">
            <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-secondary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Recharge Successful!</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Your electricity meter has been recharged with the token.
              </p>
            </div>
            <Button onClick={handleClose} className="w-full">
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-primary" />
            <span>Recharge with Token</span>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="meterNumber">Select Meter</Label>
            <Select value={formData.meterNumber} onValueChange={(value) => setFormData({ ...formData, meterNumber: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Choose meter to recharge" />
              </SelectTrigger>
              <SelectContent>
                {meters.map((meter) => (
                  <SelectItem key={meter.id} value={meter.id}>
                    {meter.name && <span className="font-medium">{meter.name} • </span>}
                    <span className="text-muted-foreground">{meter.meterNumber || `ID: ${meter.id}`}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="token">20-Digit Token</Label>
            <Input
              id="token"
              placeholder="Enter your 20-digit electricity token"
              value={formData.token}
              onChange={(e) => setFormData({ ...formData, token: e.target.value.replace(/\D/g, '') })}
              maxLength={20}
              required
            />
            <p className="text-xs text-muted-foreground">
              Enter the 20-digit token you received via SMS, email, or WhatsApp
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.meterNumber || formData.token.length !== 20}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Recharge Now
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RechargeTokenModal;