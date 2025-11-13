import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, CheckCircle, AlertCircle, Info, Mail, MessageSquare, Smartphone, X, Settings, Search, Trash2, Filter } from "lucide-react";
import { formatDistanceToNow, format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { notificationsService } from '@/services/notifications';

const Notifications = () => {
  type ApiNotification = { id: number; notification_type?: string; title?: string; message?: string; is_read?: boolean; created_at?: string };
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    whatsappNotifications: false,
    lowBalanceAlerts: true,
    paymentConfirmations: true,
    promotionalOffers: false,
    systemUpdates: true
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const { toast } = useToast();

  const markAsRead = (id: number) => {
    // optimistic UI: mark locally then call API
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    notificationsService.markAsRead(String(id)).catch(() => {
      // rollback if API fails
      setNotifications(prev => prev.map(notification => notification.id === id ? { ...notification, is_read: false } : notification ));
    });
  };

  const markAllAsRead = () => {
    notificationsService.markAllAsRead().then(() => {
      setNotifications(prev => prev.map(notification => ({ ...notification, unread: false })));
      toast({ title: "All notifications marked as read", description: "Your notification list has been updated." });
    }).catch(() => {
      toast({ title: "Failed", description: "Could not mark all as read." });
    });
  };

  const deleteNotification = (id: number) => {
    // optimistic remove
    const before = notifications;
    setNotifications(prev => prev.filter(n => n.id !== id));
    notificationsService.deleteNotification(String(id)).then(() => {
      toast({ title: "Notification deleted", description: "The notification has been removed." });
    }).catch(() => {
      // rollback
      setNotifications(before);
      toast({ title: "Failed", description: "Could not delete notification." });
    });
  };

  const clearAllNotifications = () => {
    // call API to delete server-side and optimistic UI clear
    const before = notifications;
    setNotifications([]);
    notificationsService.deleteAll().then((res) => {
      toast({
        title: "All notifications cleared",
        description: `Deleted ${res.deleted || 0} notifications`,
      });
    }).catch(() => {
      setNotifications(before);
      toast({ title: "Failed", description: "Could not clear notifications." });
    });
  };

  const updateSetting = (key: string, value: boolean) => {
    const next = { ...settings, [key]: value } as typeof settings;
    setSettings(next);
    // persist to server
    notificationsService.saveSettings({
      email_notifications: next.emailNotifications,
      sms_notifications: next.smsNotifications,
      whatsapp_notifications: next.whatsappNotifications,
      low_balance_alerts: next.lowBalanceAlerts,
      payment_confirmations: next.paymentConfirmations,
      promotional_offers: next.promotionalOffers,
      system_updates: next.systemUpdates,
    }).then(() => {
      toast({ title: "Settings updated", description: "Your notification preferences have been saved." });
    }).catch(() => {
      toast({ title: "Failed", description: "Could not save settings." });
    });
  };

  useEffect(() => {
    setLoading(true);
    notificationsService.getNotifications().then((res) => {
      const list: ApiNotification[] = Array.isArray(res) ? res : (res.results || []);
      setNotifications(list);
    }).catch(() => setNotifications([])).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // load persisted settings
    notificationsService.getSettings().then((data) => {
      if (data) {
        setSettings({
          emailNotifications: !!data.email_notifications,
          smsNotifications: !!data.sms_notifications,
          whatsappNotifications: !!data.whatsapp_notifications,
          lowBalanceAlerts: !!data.low_balance_alerts,
          paymentConfirmations: !!data.payment_confirmations,
          promotionalOffers: !!data.promotional_offers,
          systemUpdates: !!data.system_updates,
        });
      }
    }).catch(() => {
      // ignore — keep defaults
    });
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case "payment":
      case "purchase":
        return <CheckCircle className="h-5 w-5 text-secondary" />;
      case "alert":
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      case "system":
      default:
        return <Info className="h-5 w-5 text-primary" />;
    }
  };

  const toUi = (n: ApiNotification) => ({
    id: n.id,
    type: (n.notification_type as string) || 'system',
    title: n.title || '',
    message: n.message || '',
    unread: !(n.is_read === true),
    time: n.created_at ? format(new Date(n.created_at), 'yyyy-MM-dd|HH:mm') : '',
  });

  const uiNotifications = notifications.map(toUi);
  const unreadCount = uiNotifications.filter(n => n.unread).length;

  const filteredNotifications = uiNotifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || notification.type === filterType;
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "unread" && notification.unread) ||
                         (filterStatus === "read" && !notification.unread);
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground">
            Manage your notifications and preferences
            {unreadCount > 0 && (
              <Badge className="ml-2 bg-destructive text-destructive-foreground">
                {unreadCount} unread
              </Badge>
            )}
          </p>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead} className="flex-1 sm:flex-none">
              Mark All as Read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button variant="outline" onClick={clearAllNotifications} className="flex-1 sm:flex-none">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="bg-gradient-card">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="payment">Payment</SelectItem>
                <SelectItem value="purchase">Purchase</SelectItem>
                <SelectItem value="alert">Alert</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notifications List */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Recent Notifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No notifications found</p>
                </div>
              ) : (
                filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    notification.unread 
                      ? 'bg-primary/5 border-primary/20' 
                      : 'bg-muted/30 border-border'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h4 className={`text-sm font-medium ${
                          notification.unread ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {notification.title}
                        </h4>
                        <div className="flex items-center space-x-1">
                          {notification.unread && (
                            <div className="w-2 h-2 bg-primary rounded-full" />
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-muted-foreground">
                          {notification.time}
                        </span>
                        {notification.unread ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs"
                            onClick={() => markAsRead(notification.id)}
                          >
                            Mark as read
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs"
                            onClick={() => {
                              // allow marking back to unread
                              notificationsService.markAsUnread(String(notification.id)).then(() => {
                                setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, is_read: false } : n));
                              }).catch(() => {});
                            }}
                          >
                            Mark as unread
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Notification Settings */}
        <div className="space-y-4">
          <Card className="bg-gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Notification Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Delivery Methods */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-foreground">Delivery Methods</h4>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Email</span>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Smartphone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">SMS</span>
                  </div>
                  <Switch
                    checked={settings.smsNotifications}
                    onCheckedChange={(checked) => updateSetting('smsNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">WhatsApp</span>
                  </div>
                  <Switch
                    checked={settings.whatsappNotifications}
                    onCheckedChange={(checked) => updateSetting('whatsappNotifications', checked)}
                  />
                </div>
              </div>

              <Separator />

              {/* Notification Types */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-foreground">Notification Types</h4>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm">Low Balance Alerts</div>
                    <div className="text-xs text-muted-foreground">When meter balance is low</div>
                  </div>
                  <Switch
                    checked={settings.lowBalanceAlerts}
                    onCheckedChange={(checked) => updateSetting('lowBalanceAlerts', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm">Payment Confirmations</div>
                    <div className="text-xs text-muted-foreground">Transaction receipts</div>
                  </div>
                  <Switch
                    checked={settings.paymentConfirmations}
                    onCheckedChange={(checked) => updateSetting('paymentConfirmations', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm">System Updates</div>
                    <div className="text-xs text-muted-foreground">Service announcements</div>
                  </div>
                  <Switch
                    checked={settings.systemUpdates}
                    onCheckedChange={(checked) => updateSetting('systemUpdates', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm">Promotional Offers</div>
                    <div className="text-xs text-muted-foreground">Special deals & discounts</div>
                  </div>
                  <Switch
                    checked={settings.promotionalOffers}
                    onCheckedChange={(checked) => updateSetting('promotionalOffers', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Notifications;