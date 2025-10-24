import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Mail, MessageCircle, Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { Transaction, Meter as MeterType } from "@/types/models";
import { format } from 'date-fns';

type LastToken = {
  token?: string;
  amount?: number | string;
  kwh?: number | string;
  date?: string;
  meter?: string;
};

const LastTokenCard: React.FC<{ lastToken?: LastToken | Transaction | null; loading?: boolean; meters?: MeterType[] }> = ({ lastToken = null, loading = false, meters = [] }) => {
  const { toast } = useToast();

  const isTransaction = (obj: unknown): obj is Transaction => !!obj && typeof obj === 'object' && ('transaction_id' in (obj as object));
  const getToken = (obj?: LastToken | Transaction | null): string | undefined => {
    if (!obj) return undefined;
    if (isTransaction(obj)) {
      // token may be on the transaction or encoded in the description
      if (obj.token) return String(obj.token);
      if (obj.description && String(obj.description).includes('Allocated token')) {
        const parts = String(obj.description).split('Allocated token ');
        return parts[1] ? parts[1].trim() : undefined;
      }
      // Check for token_code field
      if ((obj as any).token_code) return String((obj as any).token_code);
      return undefined;
    }
    // LastToken shape
    return obj.token ? String(obj.token) : undefined;
  };

  const getAmount = (obj?: LastToken | Transaction | null): number | string | undefined => {
    if (!obj) return undefined;
    if (isTransaction(obj)) return obj.amount;
    return obj.amount;
  };

  const getKwh = (obj?: LastToken | Transaction | null): string | undefined => {
    if (!obj) return undefined;
    if (isTransaction(obj)) {
      if (obj.kwh) return String(obj.kwh);
      const maybe = obj as unknown as Record<string, unknown>;
      if (maybe['units']) return String(maybe['units']);
      // If units not provided, try to compute from amount (assume amount is in USD)
      if (obj.amount !== undefined && obj.amount !== null) {
        const amtNum = typeof obj.amount === 'number' ? obj.amount : parseFloat(String(obj.amount));
        if (!Number.isNaN(amtNum) && amtNum > 0) {
          const computed = computeKwhFromUsd(amtNum);
          return computed !== undefined ? String(computed) : undefined;
        }
      }
      return undefined;
    }
    return obj.kwh ? String(obj.kwh) : undefined;
  };

  // Conversion and tiered pricing data
  const USD_TO_ZWG = 9.23; // based on provided rates: $1 = 9.23 ZWG

  // cumulative pricing tiers: {thresholdUnits: cumulativeCostZWG}
  const TIERS: Array<{ units: number; cumulativeCost: number }> = [
    { units: 50, cumulativeCost: 107.00 },
    { units: 100, cumulativeCost: 227.50 },
    { units: 150, cumulativeCost: 441.50 },
    { units: 200, cumulativeCost: 655.50 },
    { units: 250, cumulativeCost: 963.00 },
    { units: 300, cumulativeCost: 1270.50 },
    { units: 350, cumulativeCost: 1605.00 },
    { units: 400, cumulativeCost: 1939.50 },
    { units: 450, cumulativeCost: 2432.98 },
    { units: 500, cumulativeCost: 2802.66 },
    { units: 600, cumulativeCost: 3542.02 },
    { units: 700, cumulativeCost: 4281.38 },
    { units: 800, cumulativeCost: 5020.74 },
    { units: 900, cumulativeCost: 5760.11 },
  ];

  const computeKwhFromUsd = (usd: number): number | undefined => {
    if (usd <= 0) return undefined;
    const budget = usd * USD_TO_ZWG;
    // iterate tiers
    let prevUnits = 0;
    let prevCost = 0;
    for (const tier of TIERS) {
      if (budget >= tier.cumulativeCost) {
        prevUnits = tier.units;
        prevCost = tier.cumulativeCost;
        continue;
      }
      // budget falls within this tier
      const unitsInTier = tier.units - prevUnits;
      const costInTier = tier.cumulativeCost - prevCost;
      const perUnit = costInTier / unitsInTier;
      const remaining = budget - prevCost;
      const unitsAffordable = remaining / perUnit;
      const totalUnits = prevUnits + unitsAffordable;
      return Math.floor(totalUnits);
    }
    // If budget exceeds largest tier, estimate using last per-unit rate (from last tier increment)
    const last = TIERS[TIERS.length - 1];
    const secondLast = TIERS[TIERS.length - 2] || { units: 0, cumulativeCost: 0 };
    const perUnit = (last.cumulativeCost - secondLast.cumulativeCost) / (last.units - secondLast.units || 1);
    const remaining = budget - last.cumulativeCost;
    const extraUnits = remaining > 0 ? remaining / perUnit : 0;
    return Math.floor(last.units + extraUnits);
  };

  const getDate = (obj?: LastToken | Transaction | null): string | undefined => {
    if (!obj) return undefined;
    const raw = isTransaction(obj) ? (obj.created_at || obj.date) : obj.date;
    if (!raw) return undefined;
    try {
      const d = new Date(raw as string);
      // Format as 2024-01-15|14:30
      return format(d, 'yyyy-MM-dd|HH:mm');
    } catch {
      return String(raw);
    }
  };

  const getMeterString = (obj?: LastToken | Transaction | null): string | undefined => {
    if (!obj) return undefined;
    if (isTransaction(obj)) {
      const m = obj.meter as unknown;
      if (!m) return undefined;
      if (typeof m === 'string') return m;
      if (typeof m === 'number') {
        // resolve via provided meters list
        const found = meters.find(mt => mt.id === m);
  if (found) return found.nickname || found.name || undefined;
        return undefined;
      }
      if (typeof m === 'object' && m !== null) {
        const mo = m as Record<string, unknown>;
  // prefer nickname, then name; avoid showing raw meter numbers here
  return (mo['nickname'] as string) || (mo['name'] as string) || undefined;
      }
      return undefined;
    }
    // LastToken shape: prefer nickname/name if provided; if it's a long numeric meter number, try to resolve to a meter name
    if (!obj.meter) return undefined;
    const m = obj.meter;
    // If it's a string that looks like a meter number (mostly digits), try to resolve to provided meters
    if (typeof m === 'string') {
      const digitsOnly = /^\d{6,}$/.test(m);
      if (digitsOnly) {
        const found = meters.find(mt => mt.meter_number === m);
  if (found) return found.nickname || found.name || undefined;
        return undefined;
      }
      // otherwise assume it's already a friendly name
      return m;
    }
    return undefined;
  };

  const meterDisplay = getMeterString(lastToken);

  const copyToken = () => {
    const t = getToken(lastToken);
    if (!t) return;
    navigator.clipboard.writeText(String(t));
    toast({
      title: "Token Copied",
      description: "Token copied to clipboard",
    });
  };

  const resendToken = (method: string) => {
    toast({
      title: "Token Sent",
      description: `Token sent via ${method}`,
    });
  };

  return (
    <Card className="bg-gradient-card shadow-medium">
      <CardHeader>
        <CardTitle className="text-lg">Last Token Purchase</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="text-center p-4 bg-muted rounded-lg">
          <div className="text-2xl font-mono font-bold text-primary mb-2">
            {loading ? 'Loading...' : getToken(lastToken) || '—'}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={copyToken}
            className="text-muted-foreground hover:text-foreground"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Token
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Amount:</span>
            <div className="font-medium">{
              (() => {
                const a = getAmount(lastToken);
                if (a === undefined || a === null) return '—';
                return typeof a === 'number' ? `$${Number(a).toFixed(2)}` : String(a);
              })()
            }</div>
          </div>
          <div>
            <span className="text-muted-foreground">kWh:</span>
            <div className="font-medium">{getKwh(lastToken) ?? '—'}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Date:</span>
            <div className="font-medium">{getDate(lastToken) ?? '—'}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Meter:</span>
            <div className="font-medium">{meterDisplay ?? '—'}</div>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <div className="text-sm text-muted-foreground mb-3">Resend Token:</div>
          <div className="grid grid-cols-3 gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="w-full"
              onClick={() => resendToken('SMS')}
            >
              <Smartphone className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">SMS</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="w-full"
              onClick={() => resendToken('Email')}
            >
              <Mail className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Email</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="w-full"
              onClick={() => resendToken('WhatsApp')}
            >
              <MessageCircle className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">WhatsApp</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LastTokenCard;