import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DollarSign, 
  Zap, 
  Activity, 
  Calendar,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard,
  Settings
} from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import BuyElectricityForm from "@/components/dashboard/BuyElectricityForm";
import LastTokenCard from "@/components/dashboard/LastTokenCard";
import MyMeters from "./dashboard/MyMeters";
import Transactions from "./dashboard/Transactions";
import Notifications from "./dashboard/Notifications";
import RecentRecharges from '@/components/dashboard/RecentRecharges';
import { rechargesService } from '@/services/recharges';
import AccountSettings from "./dashboard/AccountSettings";
import Billing from "./dashboard/Billing";
import Support from "./dashboard/Support";
import AddMeterModal from "@/components/modals/AddMeterModal";
import AddPaymentMethodModal from "@/components/modals/AddPaymentMethodModal";
import RechargeTokenModal from "@/components/modals/RechargeTokenModal";
import AutoRechargeSettings from "@/components/dashboard/AutoRechargeSettings";
import { authService } from "@/services/auth";
import { transactionsService } from "@/services/transactions";
import { metersService } from "@/services/meters";
import { User, Transaction, Meter as MeterType, Paginated } from "@/types/models";
import { format } from "date-fns";

const DynamicDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract active tab from URL path
  const getActiveTab = () => {
    const path = location.pathname.split('/dashboard/')[1];
    return path || 'dashboard';
  };
  
  const activeTab = getActiveTab();
  
  const setActiveTab = (tab: string) => {
    if (tab === 'dashboard') {
      navigate('/dashboard');
    } else {
      navigate(`/dashboard/${tab}`);
    }
  };
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState<boolean>(true);
  const [userError, setUserError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [meters, setMeters] = useState<MeterType[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [showAddMeterModal, setShowAddMeterModal] = useState(false);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [initialPaymentType, setInitialPaymentType] = useState<string | undefined>(undefined);
  const [showRechargeModal, setShowRechargeModal] = useState(false);

  // Compute stats from loaded data
  const totalSpent = transactions.reduce((sum, t) => {
    const amt = typeof t.amount === 'string' ? parseFloat(t.amount as string) || 0 : (t.amount as number | undefined) || 0;
    return sum + amt;
  }, 0);
  const tokensPurchased = transactions.length;
  const activeMeters = meters.length;
  // This month: sum of transactions in current month
  const now = new Date();
  const thisMonthSpent = transactions.reduce((sum, t) => {
    const d = t.date ? new Date(t.date) : null;
    if (!d) return sum;
    const amt = typeof t.amount === 'string' ? parseFloat(t.amount as string) || 0 : (t.amount as number | undefined) || 0;
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() ? sum + amt : sum;
  }, 0);

  const stats = [
    { title: 'Total Spent', value: `$${totalSpent.toFixed(2)}`, icon: DollarSign, change: '' },
    { title: 'Tokens Purchased', value: `${tokensPurchased}`, icon: Zap, change: '' },
    { title: 'Active Meters', value: `${activeMeters}`, icon: Activity, change: '' },
    { title: 'This Month', value: `$${thisMonthSpent.toFixed(2)}`, icon: Calendar, change: '' },
  ];

  useEffect(() => {
    let mounted = true;
    const loadUser = async () => {
      setLoadingUser(true);
      setUserError(null);
      try {
        const data = await authService.getCurrentUser();
        if (!mounted) return;
        setUser(data as User);
      } catch (err: unknown) {
        if (!mounted) return;
        const msg = err instanceof Error ? err.message : String(err);
        setUserError(msg || 'Failed to load user profile');
      } finally {
        if (mounted) setLoadingUser(false);
      }
    };

    loadUser();
    // fetch meters and transactions
    let isMounted = true;
    (async () => {
      await loadData();
    })();

    return () => {
      mounted = false;
      isMounted = false;
    };
  }, []);

  // move loadData outside effect so it can be called on demand after purchases
  async function loadData() {
    setLoadingData(true);
    setDataError(null);
    try {
      const [metersRes, txRes] = await Promise.all([
        metersService.getMeters({ page_size: 50 }),
        transactionsService.getTransactions({ ordering: '-created_at', page_size: 50 }),
      ]);

      const resolvedMeters: MeterType[] = Array.isArray(metersRes)
        ? metersRes
        : ((metersRes as Paginated<MeterType>).results || []);

      const resolvedTx: Transaction[] = Array.isArray(txRes)
        ? txRes
        : ((txRes as Paginated<Transaction>).results || []);

      setMeters(resolvedMeters);
      setTransactions(resolvedTx);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setDataError(msg || 'Failed to load dashboard data');
    } finally {
      setLoadingData(false);
    }
  }

  const renderDashboardContent = () => (
    <>
      <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            {/* Show a friendly greeting using available user data */}
            {loadingUser
              ? "Welcome back! 👋"
              : user
              ? `Welcome back, ${user.first_name || user.username || user.email.split('@')[0]}! 👋`
              : "Welcome back! 👋"}
          </h2>
          <p className="text-muted-foreground">
            {loadingUser
              ? "Loading your profile..."
              : userError
              ? userError
              : "Here's what's happening with your electricity accounts today."}
          </p>
        </div>

        {/* Brief user card on the right for quick info */}
        <div>
          {loadingUser ? (
            <div className="text-sm text-muted-foreground">Loading profile...</div>
          ) : user ? (
            <div className="bg-white/70 backdrop-blur-md rounded-lg p-3 shadow">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={user.profile_picture || ""} alt={user.first_name || user.username || "User"} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {user.first_name ? user.first_name.charAt(0).toUpperCase() : (user.username || user.email || "U").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{`${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username}</div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        {loadingData
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="bg-gradient-card shadow-soft animate-pulse">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="h-3 bg-gray-200 rounded w-24 mb-2"></div>
                      <div className="h-6 bg-gray-200 rounded w-28"></div>
                    </div>
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-200 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            ))
          : stats.map((stat, index) => (
              <Card key={index} className="bg-gradient-card shadow-soft">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs md:text-sm text-muted-foreground mb-1">
                        {stat.title}
                      </p>
                      <p className="text-lg md:text-2xl font-bold text-foreground">
                        {stat.value}
                      </p>
                    </div>
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                      <stat.icon className="h-4 w-4 md:h-5 md:w-5 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Add New Meter Button */}
      <div className="mb-6 md:mb-8">
        <Card className="bg-gradient-card border-2 border-dashed border-primary/30 hover:border-primary/50 transition-colors">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Add Your First Meter</h3>
            <p className="text-muted-foreground mb-4">
              Connect your electricity meters to start managing your power consumption
            </p>
            <Button className="w-full" size="lg" onClick={() => setShowAddMeterModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Meter
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
          <BuyElectricityForm onAddPaymentMethod={(type?: string) => { setInitialPaymentType(type); setShowAddPaymentModal(true); }} onSuccess={loadData} />
        </div>
        <div>
          <LastTokenCard lastToken={transactions[0]} loading={loadingData} meters={meters} />
        </div>
      </div>
    </>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "meters":
        return <MyMeters />;
      case "buy":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Buy Electricity</h2>
                <p className="text-muted-foreground">Purchase electricity tokens for your meters</p>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <BuyElectricityForm onAddPaymentMethod={(type?: string) => { setInitialPaymentType(type); setShowAddPaymentModal(true); }} onSuccess={loadData} />
              </div>
              <div>
                <LastTokenCard meters={meters} />
              </div>
            </div>
          </div>
        );
      case "transactions":
        return <Transactions />;
      case "notifications":
        return <Notifications />;
      case "settings":
        return <AccountSettings />;
      case "billing":
        return <Billing />;
      case "security":
        return <AccountSettings />;
      case "support":
        return <Support />;
      case "auto-recharge":
        return <AutoRechargeSettings />;
      case "recharge-token":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Recharge with Token</h2>
                <p className="text-muted-foreground">Enter your 20-digit token to recharge your meter</p>
              </div>
              <Button onClick={() => setShowRechargeModal(true)}>
                <Zap className="h-4 w-4 mr-2" />
                Enter Token
              </Button>
            </div>
            
            {/* Recent Token Recharges (from DB) */}
            <RecentRecharges />
          </div>
        );
      default:
        return renderDashboardContent();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        <DashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
          
          <main className="flex-1 overflow-y-auto bg-muted/30 p-4 md:p-6 lg:p-8">
            {renderContent()}
          </main>
        </div>
      </div>
      
      {/* Modals */}
      <AddMeterModal open={showAddMeterModal} onOpenChange={setShowAddMeterModal} onSuccess={loadData} />
  <AddPaymentMethodModal open={showAddPaymentModal} onOpenChange={(open) => { setShowAddPaymentModal(open); if (!open) setInitialPaymentType(undefined); }} initialPaymentType={initialPaymentType} />
      <RechargeTokenModal open={showRechargeModal} onOpenChange={setShowRechargeModal} />
    </div>
  );
};

export default DynamicDashboard;