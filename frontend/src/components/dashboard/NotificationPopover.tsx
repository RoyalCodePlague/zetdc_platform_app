import { useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle, AlertCircle, Info, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { notificationsService } from '@/services/notifications';

const NotificationPopover = () => {
  const { toast } = useToast();
  type ApiNotification = { id: number; notification_type?: string; title?: string; message?: string; is_read?: boolean; created_at?: string };
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);

  useEffect(() => {
    notificationsService.getNotifications().then((res) => {
      const list: ApiNotification[] = Array.isArray(res) ? res : (res.results || []);
      setNotifications(list.slice(0, 10));
    }).catch(() => setNotifications([]));
  }, []);

  const unreadCount = notifications.filter(n => !(n.is_read === true)).length;

  const markAsRead = (id: number) => {
    const before = notifications;
    setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    notificationsService.markAsRead(String(id)).catch(() => setNotifications(before));
  };

  const markAllAsRead = () => {
    const before = notifications;
    setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    notificationsService.markAllAsRead().then(() => {
      toast({ title: "All notifications marked as read" });
    }).catch(() => {
      setNotifications(before);
      toast({ title: "Failed", description: "Could not mark all as read." });
    });
  };

  const deleteNotification = (id: number) => {
    const before = notifications;
    setNotifications(notifications.filter(n => n.id !== id));
    notificationsService.deleteNotification(String(id)).then(() => {
      toast({ title: "Notification deleted" });
    }).catch(() => {
      setNotifications(before);
      toast({ title: "Failed", description: "Could not delete notification." });
    });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "payment":
      case "purchase":
        return <CheckCircle className="h-4 w-4 text-secondary" />;
      case "alert":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case "system":
      default:
        return <Info className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-destructive">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="text-xs" onClick={markAllAsRead}>
              Mark all read
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-96">
          <div className="p-2">
            {notifications.map((notification, index) => (
              <div key={notification.id}>
                <div 
                  className={`p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors ${
                    !(notification.is_read === true) ? 'bg-primary/5' : ''
                  }`}
                  onClick={() => !(notification.is_read === true) && markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getIcon((notification.notification_type || 'info'))}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <p className="text-sm font-medium text-foreground">
                          {notification.title}
                        </p>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 -mr-2 hover:bg-destructive/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {notification.created_at}
                      </p>
                    </div>
                    {!(notification.is_read === true) && (
                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
                    )}
                  </div>
                </div>
                {index < notifications.length - 1 && <Separator className="my-1" />}
              </div>
            ))}
          </div>
        </ScrollArea>
        
        <div className="p-3 border-t">
          <Button variant="ghost" className="w-full text-sm">
            View All Notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationPopover;