import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Download, Calendar, DollarSign, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";

const Billing = () => {
  const { toast } = useToast();
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [billingHistory, setBillingHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    setLoading(true);
    try {
      const [methodsRes, historyRes] = await Promise.all([
        api.get('/payment-methods/'),
        api.get('/transactions/?page_size=20')
      ]);
      setPaymentMethods(methodsRes.data.results || methodsRes.data || []);
      setBillingHistory(historyRes.data.results || historyRes.data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load billing information",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = (transactionId: string) => {
    api.get(`/transactions/${transactionId}/invoice/`, { responseType: 'blob' })
      .then(response => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `invoice-${transactionId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      })
      .catch(() => {
        toast({
          title: "Error",
          description: "Failed to download invoice",
          variant: "destructive"
        });
      });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'success':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Billing & Payment</h1>
        <p className="text-muted-foreground">Manage your payment methods and billing history</p>
      </div>

      {/* Payment Methods */}
      <Card className="bg-gradient-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Payment Methods</span>
              </CardTitle>
              <CardDescription>Manage your saved payment methods</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              Add New Method
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading payment methods...</div>
          ) : paymentMethods.length > 0 ? (
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-8 bg-gradient-primary rounded flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">{method.payment_type || 'Payment Method'}</p>
                      <p className="text-sm text-muted-foreground">
                        {method.details || 'No details available'}
                      </p>
                    </div>
                  </div>
                  {method.is_default && (
                    <Badge variant="outline">Default</Badge>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No payment methods saved yet</p>
              <Button variant="outline">Add Payment Method</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card className="bg-gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Billing History</span>
          </CardTitle>
          <CardDescription>View your past transactions and download invoices</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading billing history...</div>
          ) : billingHistory.length > 0 ? (
            <div className="space-y-4">
              {billingHistory.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">
                        ${typeof transaction.amount === 'string' ? parseFloat(transaction.amount).toFixed(2) : transaction.amount?.toFixed(2) || '0.00'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.date ? new Date(transaction.date).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={`flex items-center space-x-1 ${getStatusColor(transaction.status)}`}>
                      {getStatusIcon(transaction.status)}
                      <span className="ml-1">{transaction.status || 'Pending'}</span>
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownloadInvoice(transaction.id)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No billing history yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Billing Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold">
                  ${billingHistory.reduce((sum, t) => sum + (typeof t.amount === 'string' ? parseFloat(t.amount) : t.amount || 0), 0).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">
                  ${billingHistory.filter(t => {
                    const date = t.date ? new Date(t.date) : null;
                    return date && date.getMonth() === new Date().getMonth();
                  }).reduce((sum, t) => sum + (typeof t.amount === 'string' ? parseFloat(t.amount) : t.amount || 0), 0).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Methods</p>
                <p className="text-2xl font-bold">{paymentMethods.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Billing;
