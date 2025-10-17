import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Search, Filter, Eye, Copy, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { transactionsService } from '@/services/transactions';
import { format } from 'date-fns';
import { Transaction as ApiTransaction, Paginated } from '@/types/models';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

type TransactionRow = {
  id: string;
  date: string;
  meter: string;
  meterNumber: string;
  amount: string;
  units: string;
  status: string;
  token: string;
  paymentMethod: string;
  reference: string;
};

const Transactions = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [meterFilter, setMeterFilter] = useState("all");
  const [metersList, setMetersList] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionRow | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  const { toast } = useToast();

  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-secondary text-secondary-foreground";
      case "processing":
        return "bg-primary text-primary-foreground";
      case "failed":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const copyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    toast({
      title: "Token Copied!",
      description: "Electricity token copied to clipboard",
    });
  };

  const exportTransactions = () => {
    const csv = [
      ['ID', 'Date', 'Meter', 'Amount', 'Units', 'Status', 'Token', 'Payment Method', 'Reference'],
      ...filteredTransactions.map(t => [
        t.id, t.date, t.meter, t.amount, t.units, t.status, t.token, t.paymentMethod, t.reference
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    toast({
      title: "Export Successful",
      description: "Transactions exported to CSV file",
    });
  };

  // Export after refreshing current filters to ensure latest data
  const exportWithRefresh = async () => {
    try {
      await loadTransactions();
      // small delay to ensure setState has applied (optional)
      await new Promise(r => setTimeout(r, 50));
      exportTransactions();
    } catch (e) {
      toast({ title: 'Export Failed', description: 'Could not refresh transactions before export', variant: 'destructive' });
    }
  };

  const refreshTransactions = async () => {
    try {
      const mapped = await loadTransactions();
      // refresh meters list for the meter filter
      try {
        const mres = await (await import('@/services/meters')).metersService.getMeters({ page_size: 200 });
        const mlist = Array.isArray(mres) ? mres : (mres.results || []);
        const names = mlist.map((m: unknown) => {
          const mm = m as Record<string, unknown>;
          return (mm.nickname as string) || (mm.name as string) || (mm.meter_number as string) || String(mm.id);
        });
        setMetersList(names);
      } catch (e) {
        console.debug('failed to refresh meters list', e);
      }

      toast({ title: 'Refreshed', description: `${mapped.length} transactions loaded` });
    } catch (e) {
      toast({ title: 'Refresh Failed', description: 'Could not refresh transactions', variant: 'destructive' });
    }
  };

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { ordering: '-created_at', page_size: 200 };
      if (statusFilter && statusFilter !== 'all') params['status'] = statusFilter;
      if (meterFilter && meterFilter !== 'all') params['meter'] = meterFilter;
      if (dateFrom) params['date_from'] = dateFrom;
      if (dateTo) params['date_to'] = dateTo;
      if (searchTerm) params['search'] = searchTerm;

      const res = await transactionsService.getTransactions(params);
      const list: ApiTransaction[] = Array.isArray(res) ? res : (res as Paginated<ApiTransaction>).results || [];
      const mapped: TransactionRow[] = list.map((tx: ApiTransaction) => {
        const meterField = tx.meter;
        const meterName = typeof meterField === 'string' ? meterField : (meterField?.nickname || meterField?.meter_number || meterField?.name || '');
        // format created_at/date into `yyyy-MM-dd HH:mm UTC` (force UTC)
        const rawDate = tx.created_at || tx.date || '';
        let formattedDate = '';
        if (rawDate) {
          try {
            // Use ISO -> slice to get yyyy-MM-ddTHH:mm, replace T, and append UTC
            const d = new Date(rawDate);
            formattedDate = d.toISOString().slice(0, 16).replace('T', ' ') + ' UTC';
          } catch (e) {
            formattedDate = String(rawDate);
          }
        }

        return {
          id: tx.transaction_id || String(tx.id || ''),
          date: formattedDate,
          meter: meterName,
          meterNumber: typeof meterField === 'string' ? '' : String(meterField?.meter_number || ''),
          amount: `$${String(tx.amount ?? '')}`,
          units: tx.kwh ? `${tx.kwh} kWh` : (tx.units ? `${tx.units} kWh` : ''),
          status: tx.status || '',
          token: (tx.description && String(tx.description).includes('Allocated token')) ? (String(tx.description).split('Allocated token ')[1] || 'N/A') : (tx.token || 'N/A'),
          paymentMethod: tx.payment_method || '',
          reference: tx.transaction_id || String(tx.id || '')
        } as TransactionRow;
      });
      setTransactions(mapped);
      return mapped;
    } catch (e) {
      console.debug('failed to load transactions', e);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, meterFilter, dateFrom, dateTo, searchTerm]);

  const viewTransactionDetails = (transaction: TransactionRow) => {
    setSelectedTransaction(transaction);
    setIsDetailsOpen(true);
  };

  useEffect(() => {
    loadTransactions();
    // load meters for filters
    (async () => {
      try {
        const mres = await (await import('@/services/meters')).metersService.getMeters({ page_size: 200 });
        const mlist = Array.isArray(mres) ? mres : (mres.results || []);
        const names = mlist.map((m: unknown) => {
          const mm = m as Record<string, unknown>;
          return (mm.nickname as string) || (mm.name as string) || (mm.meter_number as string) || String(mm.id);
        });
        setMetersList(names);
      } catch (e) {
        console.debug('failed to load meters for filter', e);
      }
    })();
  }, [loadTransactions]);

  const filteredTransactions: TransactionRow[] = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.meter.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.reference.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || transaction.status.toLowerCase() === statusFilter;
    const matchesMeter = meterFilter === "all" || transaction.meter === meterFilter;
    
    return matchesSearch && matchesStatus && matchesMeter;
  });

  const uniqueMeters = [...new Set(transactions.map(t => t.meter))];
  // prefer metersList if available
  const meterOptions = metersList.length ? metersList : uniqueMeters;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Transaction History</h1>
          <p className="text-muted-foreground">View and manage your electricity purchase history</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button variant="outline" className="w-full sm:w-auto" onClick={exportTransactions}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="energy" className="w-full sm:w-auto" onClick={refreshTransactions} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Meter</label>
              <Select value={meterFilter} onValueChange={setMeterFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Meters</SelectItem>
                    {meterOptions.filter(Boolean).map((meter) => (
                      <SelectItem key={String(meter)} value={String(meter)}>{String(meter)}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card className="bg-gradient-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Meter</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Units</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Token</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{transaction.id}</TableCell>
                    <TableCell className="text-sm">
                      <div>{transaction.date}</div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium text-sm">{transaction.meter}</div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {transaction.meterNumber}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{transaction.amount}</TableCell>
                    <TableCell>{transaction.units}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(transaction.status)}>
                        {transaction.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {transaction.token !== "N/A" ? (
                        <div className="flex items-center space-x-2">
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {transaction.token}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copyToken(transaction.token)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => viewTransactionDetails(transaction)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredTransactions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No transactions found matching your filters.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-sm text-muted-foreground">Transaction ID</span>
                  <span className="font-medium">{selectedTransaction.id}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-start">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge className={getStatusColor(selectedTransaction.status)}>
                    {selectedTransaction.status}
                  </Badge>
                </div>
                <Separator />
                <div className="flex justify-between items-start">
                  <span className="text-sm text-muted-foreground">Date & Time</span>
                  <span className="font-medium text-right">{selectedTransaction.date}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-start">
                  <span className="text-sm text-muted-foreground">Meter</span>
                  <span className="font-medium text-right">{selectedTransaction.meter}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-start">
                  <span className="text-sm text-muted-foreground">Meter Number</span>
                  <span className="font-mono text-xs text-right">{selectedTransaction.meterNumber}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-start">
                  <span className="text-sm text-muted-foreground">Amount</span>
                  <span className="font-bold text-lg">{selectedTransaction.amount}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-start">
                  <span className="text-sm text-muted-foreground">Units</span>
                  <span className="font-medium">{selectedTransaction.units}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-start">
                  <span className="text-sm text-muted-foreground">Payment Method</span>
                  <span className="font-medium">{selectedTransaction.paymentMethod}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-start">
                  <span className="text-sm text-muted-foreground">Reference</span>
                  <span className="font-medium">{selectedTransaction.reference}</span>
                </div>
                {selectedTransaction.token !== "N/A" && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <span className="text-sm text-muted-foreground">Token</span>
                      <div className="flex items-center justify-between bg-muted p-3 rounded-lg">
                        <code className="text-sm font-mono">{selectedTransaction.token}</code>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToken(selectedTransaction.token)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <Button 
                className="w-full" 
                onClick={() => setIsDetailsOpen(false)}
              >
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Transactions;