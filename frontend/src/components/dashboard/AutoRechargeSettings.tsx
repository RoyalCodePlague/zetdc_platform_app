import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";

type RawMeter = {
  id?: number | string;
  user?: number | null;
  meter_number?: string;
  nickname?: string;
  address?: string;
  is_primary?: boolean;
  auto_recharge_enabled?: boolean;
  auto_recharge_threshold?: number | string | null;
  auto_recharge_amount?: number | string | null;
  current_balance?: number | string | null;
  last_top_up?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};
import { useToast } from "@/hooks/use-toast";
import { metersService } from '@/services/meters';
import { Zap, DollarSign, Clock, CreditCard } from "lucide-react";
import AllocationsModal from '@/components/modals/AllocationsModal';

const AutoRechargeSettings = () => {
  const [settings, setSettings] = useState({
    enabled: false,
    threshold: "10",
    amount: "50",
    paymentMethod: "",
    timeWindowStart: '',
    timeWindowEnd: '',
  });
  const [meters, setMeters] = useState<RawMeter[]>([]);
  const [meterLoading, setMeterLoading] = useState<Record<number, boolean>>({});
  const [meterSaveLoading, setMeterSaveLoading] = useState<Record<number, boolean>>({});
  const [saveLoading, setSaveLoading] = useState(false);
  const [runNowLoading, setRunNowLoading] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [allocModalOpen, setAllocModalOpen] = useState(false);
  const [allocations, setAllocations] = useState<any[]>([]);
  const { toast } = useToast();

  // load persisted settings from API on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const cfg = await metersService.getAutoRechargeConfig();
        if (!mounted) return;
        setSettings((s) => ({
          ...s,
          enabled: !!cfg.enabled,
          threshold: cfg.default_threshold ? String(cfg.default_threshold) : s.threshold,
          amount: cfg.default_amount ? String(cfg.default_amount) : s.amount,
          paymentMethod: cfg.default_payment_method || s.paymentMethod,
          timeWindowStart: cfg.time_window_start || s.timeWindowStart,
          timeWindowEnd: cfg.time_window_end || s.timeWindowEnd,
        }));
      } catch (err) {
        console.debug('Failed to load auto-recharge config', err);
        toast({ title: 'Error', description: 'Failed to load auto-recharge settings', variant: 'destructive' });
      }

      try {
        const mres = await metersService.getMeters({ page_size: 200 });
        const raw = Array.isArray(mres) ? mres : (((mres as unknown) as { results?: unknown[] }).results || []);
        // map API meter shape to the Meter type expected in UI
        const mapped: RawMeter[] = (raw as RawMeter[]).map((m) => {
          return {
            id: Number(m.id as number | string),
            user: (m.user as number) || undefined,
            meter_number: m.meter_number || '',
            nickname: m.nickname || '',
            address: m.address || '',
            is_primary: Boolean(m.is_primary),
            auto_recharge_enabled: Boolean(m.auto_recharge_enabled),
            auto_recharge_threshold: m.auto_recharge_threshold ?? null,
            auto_recharge_amount: m.auto_recharge_amount ?? null,
            current_balance: typeof m.current_balance === 'string' || typeof m.current_balance === 'number' ? Number(m.current_balance as number | string) : 0,
            last_top_up: m.last_top_up ?? null,
            created_at: m.created_at ?? null,
            updated_at: m.updated_at ?? null,
          } as RawMeter;
        });
        setMeters(mapped);
      } catch (err) {
        console.debug('failed to load meters', err);
      }

      // load recent autorecharge events
      try {
        const evs = await metersService.listAutoRechargeEvents();
        setEvents(Array.isArray(evs) ? evs : (evs.results || []));
      } catch (err) {
        const status = err?.response?.status;
        if (status === 401) {
          toast({ title: 'Not authenticated', description: 'Please log in to view auto-recharge events', variant: 'destructive' });
          setTimeout(() => { window.location.href = '/'; }, 1200);
        } else {
          console.debug('failed to load autorecharge events', err);
        }
      }
    })();
    return () => { mounted = false; };
  }, [toast]);

  const isValidSettings = () => {
    if (!settings.enabled) return true;
    const th = Number(settings.threshold);
    const am = Number(settings.amount);
    if (Number.isNaN(th) || th < 0) return false;
    if (Number.isNaN(am) || am <= 0) return false;
    // time window: either both empty (anytime) or both present
    if ((settings.timeWindowStart && !settings.timeWindowEnd) || (!settings.timeWindowStart && settings.timeWindowEnd)) return false;
    return true;
  };

  const handleSave = async () => {
    if (!isValidSettings()) {
      toast({ title: 'Invalid input', description: 'Please check threshold, amount and time window values', variant: 'destructive' });
      return;
    }
    setSaveLoading(true);
    try {
      const payload: Record<string, unknown> = {
        enabled: !!settings.enabled,
        default_payment_method: settings.paymentMethod || '',
      };
      if (settings.threshold) payload.default_threshold = Number(settings.threshold);
      if (settings.amount) payload.default_amount = Number(settings.amount);
      if (settings.timeWindowStart) payload.time_window_start = settings.timeWindowStart;
      if (settings.timeWindowEnd) payload.time_window_end = settings.timeWindowEnd;
      await metersService.saveAutoRechargeConfig(payload);
      toast({ title: 'Auto Recharge Settings Updated', description: 'Your automatic recharge preferences have been saved.' });
    } catch (err) {
      console.debug('failed to save auto recharge settings', err);
      toast({ title: 'Error', description: 'Failed to save auto-recharge settings', variant: 'destructive' });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleRunNow = async () => {
    setRunNowLoading(true);
    try {
      await metersService.runAutoRechargeNow();
      // refresh events after triggering
      const evs = await metersService.listAutoRechargeEvents();
      const current = Array.isArray(evs) ? evs : (evs.results || []);
      setEvents(current);
      toast({ title: 'Auto Recharge started', description: 'Auto recharge run started. Waiting for results...' });

      // Poll for newly created events to reach final status (completed/failed)
      const start = Date.now();
      const timeoutMs = 20_000; // 20s timeout
      const pollInterval = 1000;

      // note ids present before run
      const beforeIds = new Set((current || []).map((e) => e.id));

      const waitForCompletion = async () => {
        while (Date.now() - start < timeoutMs) {
          await new Promise((r) => setTimeout(r, pollInterval));
          try {
            const fresh = await metersService.listAutoRechargeEvents();
            const list = Array.isArray(fresh) ? fresh : (fresh.results || []);
            setEvents(list);

            // find any new event ids that were not present before
            const newEvents = (list || []).filter((e) => !beforeIds.has(e.id));
            // update allocations list from newEvents that contain token codes in message
            const newAlloc = newEvents.map((ev) => ({ id: ev.id, token: (ev.message || '').match(/token\s([A-Za-z0-9\-]+)/i)?.[1] || null, status: ev.status, amount: ev.amount, message: ev.message }));
            if (newAlloc.length > 0) {
              setAllocations((prev) => [...newAlloc, ...prev]);
              setAllocModalOpen(true);
            }
            // if there are new events and all are in a terminal state, finish
            if (newEvents.length > 0) {
              const allTerminal = newEvents.every((ev) => ev.status === 'completed' || ev.status === 'failed');
              if (allTerminal) {
                toast({ title: 'Auto Recharge finished', description: 'Auto recharge run finished. Events updated.' });
                return;
              }
            }
          } catch (err) {
            const status = err?.response?.status;
            if (status === 401) {
              toast({ title: 'Session expired', description: 'Please log in again to continue', variant: 'destructive' });
              setTimeout(() => { window.location.href = '/'; }, 1200);
              return;
            }
            console.debug('polling events failed', err);
          }
        }
        toast({ title: 'Auto Recharge finished', description: 'Auto recharge run finished' });
      };

      waitForCompletion();
    } catch (err) {
      console.debug('failed to trigger run-now', err);
      // if 401, show friendly message and redirect to login
      const status = err?.response?.status;
      if (status === 401) {
        toast({ title: 'Not authenticated', description: 'Please log in to start auto recharge', variant: 'destructive' });
        // give user a moment to read toast then redirect
        setTimeout(() => { window.location.href = '/'; }, 1200);
      } else {
        toast({ title: 'Error', description: 'Failed to start auto recharge run', variant: 'destructive' });
      }
    } finally {
      setRunNowLoading(false);
    }
  };

  // toggle per-meter auto recharge (optimistic UI) with loading state
  const toggleMeterAuto = async (meter: RawMeter) => {
    const id = meter.id;
    const original = meters.find((m) => m.id === id) as RawMeter | undefined;
    if (!original) return;
    // optimistic UI
    setMeters((prev) => prev.map((m) => m.id === id ? ({ ...m, auto_recharge_enabled: !m.auto_recharge_enabled } as RawMeter) : m));
    setMeterLoading((s) => ({ ...s, [Number(id ?? 0)]: true }));
    try {
      const res = await metersService.updateMeter(String(id), { auto_recharge_enabled: !original.auto_recharge_enabled } as Record<string, unknown>);
      setMeters((prev) => prev.map((m) => m.id === id ? (res as RawMeter) : m));
      toast({ title: 'Updated', description: 'Meter auto-recharge updated' });
    } catch (err) {
      // rollback
      setMeters((prev) => prev.map((m) => m.id === id ? original : m));
      console.debug('Failed to update meter auto-recharge', err);
      toast({ title: 'Error', description: 'Failed to toggle auto-recharge for meter', variant: 'destructive' });
    } finally {
      setMeterLoading((s) => {
        const copy = { ...s };
        delete copy[Number(id)];
        return copy;
      });
    }
  };

  return (
    <div className="space-y-6">
      <AllocationsModal open={allocModalOpen} onOpenChange={setAllocModalOpen} allocations={allocations} />
      <Card className="bg-gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Auto Recharge Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable Auto Recharge */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Enable Auto Recharge</div>
              <div className="text-sm text-muted-foreground">
                Automatically top up when balance is low
              </div>
            </div>
            <Switch
              checked={settings.enabled}
              onCheckedChange={(checked) => setSettings({ ...settings, enabled: checked })}
            />
          </div>

          {settings.enabled && (
            <>
              {/* Threshold Settings */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="threshold">Low Balance Threshold (kWh)</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="threshold"
                      value={settings.threshold}
                      onChange={(e) => setSettings({ ...settings, threshold: e.target.value })}
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground">kWh</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Trigger auto recharge when balance falls below this amount
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Recharge Amount (kWh)</Label>
                  <div className="flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="amount"
                      value={settings.amount}
                      onChange={(e) => setSettings({ ...settings, amount: e.target.value })}
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground">kWh</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select value={settings.paymentMethod} onValueChange={(value) => setSettings({ ...settings, paymentMethod: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="card1234">**** **** **** 1234 (Visa)</SelectItem>
                      <SelectItem value="ecocash">EcoCash - +263 77 123 4567</SelectItem>
                      <SelectItem value="onemoney">OneMoney - +263 71 987 6543</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Allowed Time Window</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="time"
                      id="timeStart"
                      value={settings.timeWindowStart}
                      onChange={(e) => setSettings({ ...settings, timeWindowStart: e.target.value })}
                      className="w-36"
                    />
                    <span className="text-sm">to</span>
                    <Input
                      type="time"
                      id="timeEnd"
                      value={settings.timeWindowEnd}
                      onChange={(e) => setSettings({ ...settings, timeWindowEnd: e.target.value })}
                      className="w-36"
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleSave} className="w-full" disabled={!isValidSettings() || saveLoading}>
                <CreditCard className="h-4 w-4 mr-2" />
                {saveLoading ? 'Saving...' : 'Save Auto Recharge Settings'}
              </Button>

              <div className="mt-3">
                <Button variant="secondary" onClick={handleRunNow} className="w-full" disabled={runNowLoading}>
                  {runNowLoading ? 'Starting...' : 'Run auto recharge now'}
                </Button>
              </div>

              {/* Recent events */}
              {events && events.length > 0 && (
                <div className="mt-4">
                  <Label>Recent Auto Recharge Events</Label>
                  <div className="mt-2 space-y-2">
                    {events.slice(0, 6).map((ev) => (
                      <div key={ev.id} className="p-2 border rounded">
                        <div className="flex justify-between">
                          <div className="text-sm font-medium">{ev.meter ? ev.meter.meter_number || `Meter ${ev.meter?.id}` : 'Account-wide'}</div>
                          <div className="text-xs text-muted-foreground">{new Date(ev.triggered_at).toLocaleString()}</div>
                        </div>
                        <div className="text-xs">Status: {ev.status}</div>
                        <div className="text-xs">Amount: {ev.amount}</div>
                        <div className="text-xs text-muted-foreground">{ev.message}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Meter Status section removed per request */}
    </div>
  );
};

export default AutoRechargeSettings;