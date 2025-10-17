import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, HelpCircle, LogOut, Shield } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const UserPopover = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const displayUser = {
    name: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || user.email.split('@')[0] : "User",
    email: user?.email || "user@example.com",
    avatar: user?.profile_picture || "",
    plan: "Premium",
    joinDate: "Member since Jan 2024"
  };

  const menuItems = [
    {
      icon: User,
      label: "Profile Settings",
      route: "/dashboard/settings"
    },
    {
      icon: Shield,
      label: "Security",
      route: "/dashboard/security"
    },
    {
      icon: HelpCircle,
      label: "Help & Support",
      route: "/dashboard/support"
    }
  ];
  
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="h-auto p-2 hover:bg-muted">
          <Avatar className="h-8 w-8">
            <AvatarImage src={displayUser.avatar} />
            <AvatarFallback className="bg-gradient-primary text-white">
              {displayUser.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="end">
        <div className="p-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={displayUser.avatar} />
              <AvatarFallback className="bg-gradient-primary text-white text-lg">
                {displayUser.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">
                {displayUser.name}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                {displayUser.email}
              </p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-secondary/10 text-secondary">
                  {displayUser.plan}
                </span>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            {displayUser.joinDate}
          </p>
        </div>

        <Separator />

        <div className="p-2">
          {menuItems.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              className="w-full justify-start h-auto p-3"
              onClick={() => navigate(item.route)}
            >
              <item.icon className="h-4 w-4 mr-3" />
              <span className="text-sm">{item.label}</span>
            </Button>
          ))}
        </div>

        <Separator />

        <div className="p-2">
          <Button
            variant="ghost"
            className="w-full justify-start h-auto p-3 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-3" />
            <span className="text-sm">Sign Out</span>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default UserPopover;