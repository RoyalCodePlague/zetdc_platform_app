import { useEffect, useState } from "react";
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Zap, MapPin, Calendar, Edit2, Trash2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { metersService } from '@/services/meters';
import { transactionsService } from '@/services/transactions';
import { Paginated, Meter } from '@/types/models';

const MyMeters = () => {
  const [meters, setMeters] = useState<Meter[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMeter, setEditingMeter] = useState<Partial<Meter> | null>(null);
  const [newMeter, setNewMeter] = useState<Partial<Meter>>({
    nickname: "",
    meter_number: "",
    address: ""
  });
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpMeter, setTopUpMeter] = useState<Meter | null>(null);
  const [topUpAmount, setTopUpAmount] = useState<string>('');
  const [topUpPaymentMethod, setTopUpPaymentMethod] = useState<string>('card');
  const [topUpProcessing, setTopUpProcessing] = useState<boolean>(false);

  const { toast } = useToast();

  const handleAddMeter = (e: React.FormEvent) => {
    e.preventDefault();
    (async () => {
      try {
        const payload = {
          nickname: newMeter.nickname,
          meter_number: newMeter.meter_number,
          address: newMeter.address || '',
        } as Partial<Meter>;
        const created = await metersService.createMeter(payload);
        setMeters(prev => [...prev, (created as Meter)]);
        setNewMeter({ nickname: "", meter_number: "", address: "" });
        setShowAddModal(false);
        toast({ title: 'Meter Added Successfully!', description: 'Your new meter has been added to your account.' });
      } catch (e) {
        toast({ title: 'Error', description: 'Failed to add meter', variant: 'destructive' });
      }
    })();
  };

  const handleEditMeter = (meter: Meter) => {
    setEditingMeter({ ...meter });
    setShowEditModal(true);
  };

  const handleUpdateMeter = (e: React.FormEvent) => {
    e.preventDefault();
    (async () => {
      try {
        const payload = {
          nickname: editingMeter!.nickname,
          meter_number: editingMeter!.meter_number,
          address: editingMeter!.address || '',
        } as Partial<Meter>;
        const updated = await metersService.updateMeter(String(editingMeter!.id), payload);
        setMeters(prev => prev.map(m => m.id === (updated as Meter).id ? (updated as Meter) : m));
        setShowEditModal(false);
        setEditingMeter(null);
        toast({ title: 'Meter Updated Successfully!', description: 'Your meter information has been updated.' });
      } catch (e) {
        toast({ title: 'Error', description: 'Failed to update meter', variant: 'destructive' });
      }
    })();
    
  };

  const handleTopUp = (meter: Meter) => {
    // Open the top-up modal with this meter preselected
    setTopUpMeter(meter);
    setTopUpAmount('10');
    setTopUpPaymentMethod('card');
    setShowTopUpModal(true);
  };

  const handleDeleteMeter = (meterId: number) => {
    (async () => {
      try {
        await metersService.deleteMeter(String(meterId));
        setMeters(prev => prev.filter(m => m.id !== meterId));
        toast({ title: 'Meter Deleted', description: 'The meter has been removed from your account.', variant: 'destructive' });
      } catch (e) {
        toast({ title: 'Error', description: 'Failed to delete meter', variant: 'destructive' });
      }
    })();
  };

  // Extracted loader so it can be called after successful top-up
  async function loadMeters() {
    setLoading(true);
    try {
      const res = await metersService.getMeters({ page_size: 100 });
      const rawList = Array.isArray(res) ? res : (((res as unknown) as Paginated<Meter>).results || []);
      const resolved: Meter[] = (rawList as unknown) as Meter[];
      setMeters(resolved);
    } catch (e) {
      console.debug('failed to load meters', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!mounted) return;
      await loadMeters();
    })();
    return () => { mounted = false; };
  }, []);

  // Payment methods for top-up modal
  const paymentMethods = [
    { id: 'card', name: 'Credit/Debit Card' },
    { id: 'mobile', name: 'Mobile Money' },
    { id: 'bank', name: 'Bank Transfer' },
  ];

  const submitTopUp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topUpMeter || !topUpAmount) {
      toast({ title: 'Error', description: 'Select meter and amount', variant: 'destructive' });
      return;
    }
    const amt = parseFloat(topUpAmount);
    if (Number.isNaN(amt) || amt <= 0) {
      toast({ title: 'Error', description: 'Enter a valid amount', variant: 'destructive' });
      return;
    }
    setTopUpProcessing(true);
    toast({ title: 'Processing', description: 'Initiating top-up...' });
    try {
      const res = await metersService.purchaseElectricity(String((topUpMeter as Meter).id), amt);
      if (res.status === 'pending' && res.transaction_id) {
        // poll transaction
        let attempts = 0;
        while (attempts < 30) {
          attempts += 1;
          try {
            const txRes = await transactionsService.getTransactions({ transaction_id: res.transaction_id });
            const resultsRaw = Array.isArray(txRes) ? txRes : (txRes as Paginated<unknown>).results || [];
            const results = Array.isArray(resultsRaw) ? (resultsRaw as unknown[]) : [];
            const tx = results.find((t: unknown) => (t as Record<string, unknown>)['transaction_id'] === res.transaction_id) as (Record<string, unknown> & { status?: string }) | null;
            if (tx && tx.status === 'completed') {
              toast({ title: 'Top-up Confirmed', description: 'Your meter has been topped up' });
              setShowTopUpModal(false);
              await loadMeters();
              setTopUpProcessing(false);
              return;
            }
          } catch (err) {
            console.debug('poll error', err);
          }
          await new Promise(r => setTimeout(r, 1500));
        }
        toast({ title: 'Timeout', description: 'Top-up confirmation timed out', variant: 'destructive' });
      } else {
        // immediate success
        toast({ title: 'Top-up Successful', description: 'Your meter has been topped up' });
        setShowTopUpModal(false);
        await loadMeters();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast({ title: 'Error', description: message || 'Top-up failed', variant: 'destructive' });
    } finally {
      setTopUpProcessing(false);
    }
  };

  const getBalanceColor = (level: string) => {
    switch (level) {
      case "high": return "bg-secondary text-secondary-foreground";
      case "medium": return "bg-primary text-primary-foreground";
      case "low": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getBalanceIcon = (level: string) => {
    if (level === "low") return <AlertCircle className="h-4 w-4" />;
    return <Zap className="h-4 w-4" />;
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">My Meters</h1>
          <p className="text-muted-foreground">Manage your prepaid electricity meters</p>
        </div>
        
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogTrigger asChild>
            <Button variant="energy" className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add New Meter
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Meter</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddMeter} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nickname">Meter Nickname</Label>
                <Input
                  id="nickname"
                  placeholder="e.g., Home - Living Room"
                  value={newMeter.nickname}
                  onChange={(e) => setNewMeter({ ...newMeter, nickname: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="number">Meter Number</Label>
                <Input
                  id="number"
                  placeholder="20-digit meter number"
                  value={newMeter.meter_number}
                  onChange={(e) => setNewMeter({ ...newMeter, meter_number: e.target.value })}
                  maxLength={20}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Address (Optional)</Label>
                <Input
                  id="address"
                  placeholder="Property address"
                  value={newMeter.address}
                  onChange={(e) => setNewMeter({ ...newMeter, address: e.target.value })}
                />
              </div>
              
              <div className="flex space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" variant="energy" className="flex-1">
                  Add Meter
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        {/* Top Up Modal */}
        <Dialog open={showTopUpModal} onOpenChange={setShowTopUpModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Top Up Meter</DialogTitle>
            </DialogHeader>
            <form onSubmit={submitTopUp} className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground">Meter</div>
                <div className="font-medium">{topUpMeter ? (topUpMeter.nickname || topUpMeter.name || `Meter ${topUpMeter.id}`) : '—'}</div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="topup-amount">Amount (USD)</Label>
                <Input id="topup-amount" type="number" value={topUpAmount} onChange={(e) => setTopUpAmount(e.target.value)} min={1} step={0.01} required />
              </div>
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <div className="space-y-2">
                  {paymentMethods.map(pm => (
                    <Button key={pm.id} type="button" variant={topUpPaymentMethod === pm.id ? 'default' : 'outline'} className="w-full text-left" onClick={() => setTopUpPaymentMethod(pm.id)}>
                      {pm.name}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowTopUpModal(false)} className="flex-1">Cancel</Button>
                <Button type="submit" variant="energy" className="flex-1" disabled={topUpProcessing}>{topUpProcessing ? 'Processing...' : 'Top Up'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Meter Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Meter</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateMeter} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-nickname">Meter Nickname</Label>
              <Input
                id="edit-nickname"
                placeholder="e.g., Home - Living Room"
                value={editingMeter?.nickname || ""}
                onChange={(e) => setEditingMeter({ ...editingMeter, nickname: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-number">Meter Number</Label>
              <Input
                id="edit-number"
                placeholder="20-digit meter number"
                value={editingMeter?.meter_number || ""}
                onChange={(e) => setEditingMeter({ ...editingMeter, meter_number: e.target.value })}
                maxLength={20}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-address">Address (Optional)</Label>
              <Input
                id="edit-address"
                placeholder="Property address"
                value={editingMeter?.address || ""}
                onChange={(e) => setEditingMeter({ ...editingMeter, address: e.target.value })}
              />
            </div>
            
            <div className="flex space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowEditModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" variant="energy" className="flex-1">
                Update Meter
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {meters.map((meter) => (
          <Card key={meter.id} className="bg-gradient-card shadow-soft hover:shadow-medium transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-foreground">
                  {meter.nickname}
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  {meter.status || 'Active'}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Meter Number</div>
                <div className="font-mono text-sm bg-muted p-2 rounded">
                  {meter.meter_number}
                </div>
              </div>
              
              {meter.address && (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span className="truncate">{meter.address}</span>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Current Balance</div>
                <Badge className={`${getBalanceColor((meter.current_balance && Number(meter.current_balance) > 50) ? 'high' : (meter.current_balance && Number(meter.current_balance) >= 20) ? 'medium' : 'low')} flex items-center space-x-1`}>
                  {getBalanceIcon((meter.current_balance && Number(meter.current_balance) > 50) ? 'high' : (meter.current_balance && Number(meter.current_balance) >= 20) ? 'medium' : 'low')}
                  <span>{(meter.current_balance !== undefined && meter.current_balance !== null) ? `${Number(meter.current_balance).toFixed(2)} kWh` : '0.00 kWh'}</span>
                </Badge>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Last top-up: {meter.last_top_up ? format(new Date(String(meter.last_top_up)), 'yyyy-MM-dd | HH:mm') : 'Never'}</span>
              </div>
              
              <div className="flex space-x-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleEditMeter(meter)}
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleTopUp(meter)}
                >
                  <Zap className="h-4 w-4 mr-1" />
                  Top Up
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-10 p-0 text-destructive hover:text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Meter</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{meter.nickname}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteMeter(meter.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MyMeters;