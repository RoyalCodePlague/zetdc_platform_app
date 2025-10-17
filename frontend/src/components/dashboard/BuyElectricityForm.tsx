import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap, CreditCard, Smartphone, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { metersService } from '@/services/meters';
import { transactionsService } from '@/services/transactions';
import { Transaction, Meter, Paginated } from '@/types/models';

type LocalMeter = Meter & { nickname?: string; meter_number?: string; number?: string };

interface BuyElectricityFormProps {
  onAddPaymentMethod?: (type?: string) => void;
  onSuccess?: () => void; // called after purchase completes to allow parent to refresh data
}

const BuyElectricityForm = ({ onAddPaymentMethod, onSuccess }: BuyElectricityFormProps) => {
  const [selectedMeter, setSelectedMeter] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [metersList, setMetersList] = useState<Meter[]>([]);
  const [loadingMeters, setLoadingMeters] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [fee, setFee] = useState<number>(0);
  const { toast } = useToast();

  const paymentMethods = [
    { id: "card", name: "Credit/Debit Card", icon: CreditCard },
    { id: "mobile", name: "Mobile Money", icon: Smartphone },
    { id: "bank", name: "Bank Transfer", icon: Mail }
  ];

  const quickAmounts = [5, 10, 20, 50, 100];

  useEffect(() => {
    let mounted = true;
    setLoadingMeters(true);
    (async () => {
      try {
        const res = await metersService.getMeters({ page_size: 100 });
  const list = Array.isArray(res) ? res : ((res as Paginated<LocalMeter>).results || []);
        if (!mounted) return;
  const typed = (list as unknown) as LocalMeter[];
  setMetersList(typed);
  if (typed.length > 0 && typed[0].id !== undefined) setSelectedMeter(String(typed[0].id));
      } catch (e) {
        console.debug('failed to load meters', e);
      } finally {
        if (mounted) setLoadingMeters(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    // simple fee calc: 1.5% + $0.30
    const amt = parseFloat(amount) || 0;
    setFee(amt > 0 ? +(amt * 0.015 + 0.3) : 0);
  }, [amount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // More specific validation messages
    if (!selectedMeter) {
      toast({
        title: "Error",
        description: "Please select a meter",
        variant: "destructive"
      });
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Error", 
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }
    
    if (!paymentMethod) {
      toast({
        title: "Error",
        description: "Please select a payment method",
        variant: "destructive"
      });
      return;
    }

    // Show processing toast
    toast({ title: 'Processing Payment', description: 'Processing your purchase...' });

    // Call backend purchase endpoint and poll via transactionsService
    (async () => {
      try {
        const res = await metersService.purchaseElectricity(selectedMeter, parseFloat(amount));
        if (res.status === 'pending') {
          toast({ title: 'Payment Pending', description: 'Waiting for confirmation...' });

          const poll = async () => {
            let attempts = 0;
            while (attempts < 30) {
              attempts += 1;
              try {
                const txRes = await transactionsService.getTransactions({ transaction_id: res.transaction_id });
                const results: Transaction[] = Array.isArray(txRes) ? txRes : (txRes as Paginated<Transaction>).results || [];
                const tx = Array.isArray(results) ? results.find((t) => t.transaction_id === res.transaction_id) : null;
                if (tx && tx.status === 'completed') {
                  toast({ title: 'Payment Confirmed', description: `Token allocated` });
                  if (onSuccess) onSuccess();
                  return;
                }
              } catch (e) {
                console.debug('poll error', e);
              }
              await new Promise((r) => setTimeout(r, 1500));
            }
            toast({ title: 'Timeout', description: 'Payment confirmation timed out', variant: 'destructive' });
          };
          poll();
        } else {
          toast({ title: 'Payment Successful', description: `Token delivered` });
          if (onSuccess) onSuccess();
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        toast({ title: 'Error', description: message || 'Purchase failed', variant: 'destructive' });
      }
    })();
  };

  return (
    <Card className="bg-gradient-card shadow-medium">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-xl">
          <Zap className="h-6 w-6 text-primary" />
          <span>Buy Electricity</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Meter Selection */}
          <div className="space-y-2">
            <Label htmlFor="meter">Select Meter *</Label>
            <Select value={selectedMeter} onValueChange={setSelectedMeter}>
              <SelectTrigger className={!selectedMeter ? "border-destructive" : ""}>
                  <SelectValue placeholder="Choose a saved meter" />
                </SelectTrigger>
              <SelectContent>
                {metersList.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No meters found. Add a meter first.
                  </SelectItem>
                ) : (
                  metersList.map((meter) => (
                  <SelectItem key={String(meter.id)} value={String(meter.id)}>
                    <div>
                      <div className="font-medium">{(meter as LocalMeter).nickname || (meter as LocalMeter).name || `Meter ${meter.id}`}</div>
                        {/* Showing human-friendly meter name only (hide long meter number) */}
                    </div>
                  </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Amount Selection */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (USD) *</Label>
            <div className="space-y-3">
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="5"
                max="500"
                className={!amount || parseFloat(amount) <= 0 ? "border-destructive" : ""}
              />
              <div className="flex flex-wrap gap-2">
                {quickAmounts.map((quickAmount) => (
                  <Button
                    key={quickAmount}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount(quickAmount.toString())}
                    className="hover:bg-primary hover:text-white"
                  >
                    ${quickAmount}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label>Payment Method *</Label>
            <div className="grid grid-cols-1 gap-3">
              {paymentMethods.map((method) => (
                <Button
                  key={method.id}
                  type="button"
                  variant={paymentMethod === method.id ? "default" : "outline"}
                  className="h-auto p-3 md:p-4 flex items-center justify-start space-x-3 text-left"
                  onClick={() => setPaymentMethod(method.id)}
                >
                  <method.icon className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{method.name}</span>
                </Button>
              ))}
            </div>
            {!paymentMethod && (
              <p className="text-sm text-destructive">Please select a payment method</p>
            )}
          </div>

          {/* Estimated kWh */}
          {amount && (
            <div className="p-3 md:p-4 bg-muted rounded-lg">
              <div className="flex flex-col sm:flex-row justify-between text-sm gap-1">
                <span>Estimated kWh:</span>
                <span className="font-medium">{(parseFloat(amount) * 4.2).toFixed(1)} kWh</span>
              </div>
            </div>
          )}

          <Button 
            type="submit" 
            variant="energy" 
            size="lg" 
            className="w-full"
          >
            Purchase Electricity
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default BuyElectricityForm;