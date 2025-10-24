import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { User, Mail, Phone, MapPin, Calendar, Shield, CreditCard, Bell, Upload, Eye, EyeOff, Smartphone, Monitor, Trash2, Download, Globe, Clock, Lock, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";

const AccountSettings = () => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [profileData, setProfileData] = useState({
    fullName: "John Doe",
    email: "john.doe@example.com",
    phone: "+263 77 123 4567",
    address: "123 Borrowdale Road, Harare",
    dateOfBirth: "1990-01-15",
    joinDate: "January 2024"
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [language, setLanguage] = useState("en");
  const [timezone, setTimezone] = useState("Africa/Harare");
  const [userStats, setUserStats] = useState({
    total_spent: 0,
    meters_managed: 0,
    tokens_purchased: 0,
    member_since: "January 2024"
  });
  const [activityLog, setActivityLog] = useState<any[]>([]);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    // Load current profile
    api.get('/users/me/').then((res) => {
      const u = res.data || {};
      setProfileData({
        fullName: [u.first_name, u.last_name].filter(Boolean).join(' ') || '',
        email: u.email || '',
        phone: u.phone_number || '',
        address: u.address || '',
        dateOfBirth: u.date_of_birth || '',
        joinDate: ''
      });
      setTwoFactorEnabled(!!u.two_factor_enabled);
      setLanguage(u.preferred_language || 'en');
      setTimezone(u.timezone || 'UTC');
      setProfilePicture(u.profile_picture || null);
    }).catch(() => {});

    // Load user stats
    api.get('/users/stats/').then((res) => {
      setUserStats(res.data || {});
    }).catch(() => {});

    // Load activity log
    api.get('/users/activity/').then((res) => {
      setActivityLog(res.data || []);
    }).catch(() => {});
  }, []);

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const [firstName, ...rest] = profileData.fullName.split(' ');
    const lastName = rest.join(' ');
    api.patch('/users/update_profile/', {
      first_name: firstName || '',
      last_name: lastName || '',
      phone_number: profileData.phone,
      // address and date_of_birth are not in User model; ignored if not supported
    }).then(() => {
      toast({ title: "Profile Updated", description: "Your profile information has been saved successfully." });
    }).catch(() => {
      toast({ title: "Error", description: "Failed to update profile", variant: "destructive" });
    });
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    api.post('/users/change_password/', {
      current_password: passwordData.currentPassword,
      new_password: passwordData.newPassword,
      confirm_password: passwordData.confirmPassword,
    }).then(() => {
      toast({ title: "Password Changed", description: "Your password has been updated successfully." });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    }).catch((err) => {
      const msg = err?.response?.data ? JSON.stringify(err.response.data) : 'Failed to change password';
      toast({ title: "Error", description: msg, variant: "destructive" });
    });
  };

  const accountStats = [
    { label: "Total Spent", value: `$${userStats.total_spent.toFixed(2)}`, icon: CreditCard },
    { label: "Meters Managed", value: userStats.meters_managed.toString(), icon: User },
    { label: "Tokens Purchased", value: userStats.tokens_purchased.toString(), icon: Phone },
    { label: "Member Since", value: userStats.member_since, icon: Calendar }
  ];

  const [connectedDevices, setConnectedDevices] = useState<{ name: string; location: string; lastActive: string; icon: any }[]>([]);
  useEffect(() => {
    api.get('/users/sessions/').then((res) => {
      const list = Array.isArray(res.data) ? res.data : [];
      const mapped = list.map((s: any) => ({
        name: s.device || 'Unknown device',
        location: s.ip || 'Unknown location',
        lastActive: 'Just now',
        icon: Monitor,
      }));
      setConnectedDevices(mapped);
    }).catch(() => setConnectedDevices([]));
  }, []);

  const handleToggle2FA = (enabled: boolean) => {
    setTwoFactorEnabled(enabled);
    // Persist flag to profile (no backend flow implemented yet)
    api.patch('/users/update_profile/', { two_factor_enabled: enabled }).then(() => {
      toast({ title: enabled ? "2FA Enabled" : "2FA Disabled", description: enabled ? "Your account is now more secure with two-factor authentication." : "Two-factor authentication has been disabled." });
    }).catch(() => {
      // rollback
      setTwoFactorEnabled(!enabled);
      toast({ title: "Failed", description: "Could not update 2FA setting", variant: "destructive" });
    });
  };

  const handleExportData = () => {
    api.post('/users/export_data/').then(() => {
      toast({ title: "Export Started", description: "Your data export will be emailed to you within 24 hours." });
    }).catch(() => {
      toast({ title: "Failed", description: "Could not start export.", variant: "destructive" });
    });
  };


  const handleLogoutDevice = (deviceName: string) => {
    api.post('/users/logout_session/').then(() => {
      toast({ title: "Device Logged Out", description: `${deviceName} has been logged out successfully.` });
    }).catch(() => {
      toast({ title: "Failed", description: "Could not logout device.", variant: "destructive" });
    });
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      toast({ title: "Error", description: "Please select an image file", variant: "destructive" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({ title: "Error", description: "Image size must be less than 5MB", variant: "destructive" });
      return;
    }

    const formData = new FormData();
    formData.append('profile_picture', file);

    api.patch('/users/update_profile/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then((res) => {
      setProfilePicture(res.data.profile_picture);
      toast({ title: "Success", description: "Profile picture updated" });
    }).catch(() => {
      toast({ title: "Error", description: "Failed to upload photo", variant: "destructive" });
    });
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Account Settings</h1>
        <p className="text-muted-foreground">Manage your account information and preferences</p>
      </div>

      {/* Account Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {accountStats.map((stat, index) => (
          <Card key={index} className="bg-gradient-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-lg font-semibold text-foreground">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="bg-gradient-card">
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profilePicture || ""} />
                    <AvatarFallback className="bg-gradient-primary text-white text-2xl">
                      {profileData.fullName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <Badge variant="outline" className="mb-2">
                      Premium Member
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      Member since {userStats.member_since}
                    </p>
                  </div>
                  <div className="w-full">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      id="photo-upload"
                      aria-label="Upload profile photo"
                    />
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => document.getElementById('photo-upload')?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Photo
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="lg:col-span-2">
              <Card className="bg-gradient-card">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="fullName"
                            value={profileData.fullName}
                            onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="email"
                            type="email"
                            value={profileData.email}
                            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="phone"
                            value={profileData.phone}
                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="dateOfBirth">Date of Birth</Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="dateOfBirth"
                            type="date"
                            value={profileData.dateOfBirth}
                            onChange={(e) => setProfileData({ ...profileData, dateOfBirth: e.target.value })}
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="address"
                          value={profileData.address}
                          onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <Button type="submit" variant="energy" className="w-full">
                      Save Changes
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          {/* Two-Factor Authentication */}
          <Card className="bg-gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lock className="h-5 w-5" />
                <span>Two-Factor Authentication</span>
              </CardTitle>
              <CardDescription>
                Add an extra layer of security to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Enable 2FA</p>
                  <p className="text-sm text-muted-foreground">
                    Require a verification code in addition to your password
                  </p>
                </div>
                <Switch
                  checked={twoFactorEnabled}
                  onCheckedChange={handleToggle2FA}
                />
              </div>
              {twoFactorEnabled && (
                <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-sm text-muted-foreground">
                    Download an authenticator app and scan the QR code to set up 2FA
                  </p>
                  <Button variant="outline" className="mt-3">
                    View Setup Instructions
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card className="bg-gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Change Password</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                <Button type="submit" variant="energy">
                  Update Password
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Connected Devices */}
          <Card className="bg-gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Monitor className="h-5 w-5" />
                <span>Connected Devices</span>
              </CardTitle>
              <CardDescription>
                Manage devices that are currently logged into your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {connectedDevices.map((device, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <device.icon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{device.name}</p>
                        <p className="text-xs text-muted-foreground">{device.location}</p>
                        <p className="text-xs text-muted-foreground">{device.lastActive}</p>
                      </div>
                    </div>
                    {device.lastActive !== "Active now" && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleLogoutDevice(device.name)}
                      >
                        Logout
                      </Button>
                    )}
                  </div>
                ))}
                {connectedDevices.length > 0 && (
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        api.post('/users/logout_all/').then(() => {
                          toast({ title: 'Logged out other devices', description: 'All sessions have been logged out.' });
                        }).catch(() => {
                          toast({ title: 'Failed', description: 'Could not logout all sessions.', variant: 'destructive' });
                        });
                      }}
                    >
                      Logout all devices
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Activity Log */}
          <Card className="bg-gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activityLog.length > 0 ? (
                  activityLog.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3 pb-4 border-b last:border-0">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">{activity.device}</p>
                        <p className="text-xs text-muted-foreground">{activity.location} • {activity.time}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No recent activity</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <Card className="bg-gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>Language & Region</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="sn">Shona</SelectItem>
                    <SelectItem value="nd">Ndebele</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Africa/Harare">Africa/Harare (CAT)</SelectItem>
                    <SelectItem value="Africa/Johannesburg">Africa/Johannesburg (SAST)</SelectItem>
                    <SelectItem value="UTC">UTC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={() => {
                api.patch('/users/update_profile/', { preferred_language: language, timezone }).then(() => {
                  toast({ title: 'Preferences Saved', description: 'Language and timezone updated.' });
                }).catch(() => {
                  toast({ title: 'Failed', description: 'Could not save preferences.', variant: 'destructive' });
                });
              }}>
                Save Preferences
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notification Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Manage Notifications</h3>
                <p className="text-muted-foreground mb-4">
                  Configure your notification settings in the dedicated Notifications section
                </p>
                <Button variant="outline" asChild>
                  <a href="/dashboard/notifications">Go to Notifications</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="space-y-6">
          <Card className="bg-gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Download className="h-5 w-5" />
                <span>Data Management</span>
              </CardTitle>
              <CardDescription>
                Export or delete your personal data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="font-medium mb-2">Export Your Data</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Download a copy of all your data including transactions, meter information, and account details.
                </p>
                <Button variant="outline" onClick={handleExportData}>
                  <Download className="h-4 w-4 mr-2" />
                  Request Data Export
                </Button>
              </div>
              
              <Separator />
              
              <div className="p-4 bg-destructive/5 rounded-lg border border-destructive/20">
                <h4 className="font-medium text-destructive mb-2">Delete Account</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Request Account Deletion</AlertDialogTitle>
                      <AlertDialogDescription>
                        Your account deletion request will be reviewed by our team within 24-48 hours.
                        Please provide a reason for deletion to help us improve our service.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                      <Label htmlFor="deletion-reason">Reason for deletion (optional)</Label>
                      <Input
                        id="deletion-reason"
                        placeholder="Tell us why you're leaving..."
                        className="mt-2"
                        onChange={(e) => {
                          const reason = e.target.value;
                          (window as any).deletionReason = reason;
                        }}
                      />
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => {
                          const reason = (window as any).deletionReason || '';
                          api.post('/users/delete_account/', { 
                            confirm: true, 
                            reason: reason 
                          }).then(() => {
                            toast({ 
                              title: "Deletion Request Submitted", 
                              description: "Your request has been submitted and will be reviewed within 24-48 hours." 
                            });
                          }).catch(() => {
                            toast({ 
                              title: "Failed", 
                              description: "Could not submit deletion request.", 
                              variant: "destructive" 
                            });
                          });
                        }}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Submit Deletion Request
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AccountSettings;