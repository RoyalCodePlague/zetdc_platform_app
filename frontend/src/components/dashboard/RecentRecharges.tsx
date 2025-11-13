import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import { rechargesService } from '@/services/recharges';
import { ManualRecharge } from '@/types/models';
import { format } from 'date-fns';
import { metersService } from '@/services/meters';
import { Button } from '@/components/ui/button';

type MeterRef = { id?: number | string; meter_number?: string; nickname?: string; name?: string } | string | number | null;

const RecentRecharges: React.FC = () => {
  const [items, setItems] = useState<ManualRecharge[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const res = await rechargesService.list({ page_size: 20 });
        const list = Array.isArray(res) ? res : (res.results || []);
        if (!mounted) return;
        setItems(list as ManualRecharge[]);
      } catch (err) {
        console.debug('failed to load recharges', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    // listener to refresh when a new recharge is created/updated
    const onUpdated = async (_ev: Event) => {
      try {
        const res = await rechargesService.list({ page_size: 20 });
        const list = Array.isArray(res) ? res : (res.results || []);
        if (!mounted) return;
        setItems(list as ManualRecharge[]);
      } catch (err) {
        console.debug('failed to refresh recharges', err);
      }
    };

  window.addEventListener('recharge:updated', onUpdated as EventListener);

  return () => { mounted = false; window.removeEventListener('recharge:updated', onUpdated as EventListener); };
  }, []);

  return (
    <Card className="bg-gradient-card">
      <CardHeader>
        <CardTitle>Recent Token Recharges</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : items.length === 0 ? (
            <div className="text-sm text-muted-foreground">No recent recharges</div>
          ) : items.map((r) => {
            const canRetry = r.status === 'failed' || r.status === 'rejected';
            // try to determine meter id from different shapes
            let meterId = '';
            if (r.meter) {
              const m = r.meter as MeterRef;
              meterId = typeof m === 'number' ? String(m) : (m && typeof m === 'string' ? m : String((m as Record<string, unknown>)?.id || (m as Record<string, unknown>)?.meter_number || ''));
            }
            if (!meterId) {
              const maybe = (r as unknown) as Record<string, unknown>;
              if (maybe?.meter_id) meterId = String(maybe.meter_id);
            }

            return (
              <div key={r.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${
                    r.status === 'success' ? 'bg-secondary' : r.status === 'pending' ? 'bg-warning' : (r.status === 'failed' || r.status === 'rejected') ? 'bg-destructive' : 'bg-muted'
                  }`} />
                  <div>
                    <div className="font-medium">{r.masked_token}</div>
                    <div className="text-sm text-muted-foreground">
                      { ((r as unknown) as Record<string, unknown>).meter_nickname || (r.meter ? (typeof r.meter === 'string' ? r.meter : (((r.meter as MeterRef)?.nickname) || ((r.meter as MeterRef)?.name) || ((r.meter as MeterRef)?.meter_number))) : '—') }
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{r.units != null ? `${Number(r.units).toFixed(2)} kWh` : '—'}</div>
                  <div className="text-sm text-muted-foreground">{r.created_at ? format(new Date(r.created_at), 'yyyy-MM-dd | HH:mm') : '—'}</div>
                  <div className="flex items-center space-x-2 justify-end">
                    <Badge variant={r.status === 'success' ? 'default' : r.status === 'pending' ? 'secondary' : 'destructive'}>
                      {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                    </Badge>
                    {canRetry && (
                      <Button size="sm" variant="outline" onClick={async () => {
                        try {
                          if (!meterId) throw new Error('Meter id missing');
                          // try apply_token with force=true so external tokens can be applied
                          await metersService.applyToken(meterId, String(r.token_code), undefined, true);
                          // refresh list
                          const res = await rechargesService.list({ page_size: 20 });
                          setItems(Array.isArray(res) ? res : (res.results || []));
                        } catch (e) {
                          console.debug('retry failed', e);
                          // refresh list anyway to pick up any status changes
                          try {
                            const res = await rechargesService.list({ page_size: 20 });
                            setItems(Array.isArray(res) ? res : (res.results || []));
                          } catch (_err) { console.debug('refresh after retry failed', _err); }
                        }
                      }}>Retry</Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentRecharges;
