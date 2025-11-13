import { Bell, Search, User, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/components/ThemeProvider";
import NotificationPopover from "@/components/dashboard/NotificationPopover";
import UserPopover from "@/components/dashboard/UserPopover";

const DashboardHeader = () => {
  const { theme, setTheme } = useTheme();

  return (
    <header className="bg-background/95 shadow-soft border-b border-border backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl md:text-2xl font-bold text-foreground">Dashboard</h1>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Search - Hidden on mobile */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                className="pl-10 w-48 lg:w-64"
              />
            </div>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="h-9 w-9"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Notifications */}
            <NotificationPopover />

            {/* User Profile */}
            <UserPopover />
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;