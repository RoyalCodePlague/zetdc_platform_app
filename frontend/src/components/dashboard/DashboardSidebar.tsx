import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Home, 
  Zap, 
  CreditCard, 
  History, 
  Bell, 
  Settings,
  RefreshCw,
  Battery,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";

interface DashboardSidebarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const DashboardSidebar = ({ activeTab = "dashboard", onTabChange }: DashboardSidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const queryClient = useQueryClient();

  const navigation = [
    { name: "Dashboard", key: "dashboard", icon: Home },
    { name: "My Meters", key: "meters", icon: Zap },
    { name: "Recharge Token", key: "recharge-token", icon: Battery },
    { name: "Transactions", key: "transactions", icon: History },
    { name: "Notifications", key: "notifications", icon: Bell },
    { name: "Auto Recharge", key: "auto-recharge", icon: RefreshCw },
    { name: "Account Settings", key: "settings", icon: Settings },
  ];

  const handleTabClick = (key: string) => {
    if (onTabChange) {
      onTabChange(key);
    } else {
      // Use direct navigation
      if (key === 'dashboard') {
        navigate('/dashboard');
      } else {
        navigate(`/dashboard/${key}`);
      }
    }
    setIsOpen(false);
  };

  // ✅ Fully secure logout
  const handleLogout = () => {
    // 1️⃣ Clear stored tokens using AuthContext
    logout();

    // 2️⃣ Clear React Query cache (frontend state)
    queryClient.clear();

    // 3️⃣ Close mobile sidebar
    setIsOpen(false);

    // 4️⃣ Redirect to landing page
    navigate("/");
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden fixed top-4 left-4 z-50 bg-background shadow-medium"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full w-64 bg-background border-r border-border shadow-medium z-50 transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 md:z-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center space-x-2 p-4 md:p-6 border-b border-border">
            <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Zap className="h-3 w-3 md:h-5 md:w-5 text-white" />
            </div>
            <span className="text-base md:text-lg lg:text-xl font-bold text-primary">
              ZETDC Remote
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navigation.map((item) => (
                <li key={item.name}>
                  <button
                    onClick={() => handleTabClick(item.key)}
                    className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === item.key
                        ? 'bg-gradient-primary text-white shadow-soft'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <item.icon className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-border">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 md:h-5 md:w-5 mr-3 flex-shrink-0" />
              <span className="truncate">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardSidebar;
