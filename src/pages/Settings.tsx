
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Separator } from "@/components/ui/separator";
import { Settings as SettingsIcon, Bell, Shield, Users, Mail, Database, Globe } from "lucide-react";

const Settings = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [systemNotifications, setSystemNotifications] = useState(true);

  // Only admin users can access this page
  if (currentUser?.role !== "admin") {
    return (
      <div className="p-6 max-w-6xl mx-auto text-center">
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="text-muted-foreground mt-2">
          Settings are only available for administrators.
        </p>
      </div>
    );
  }

  const handleSaveSettings = (section: string) => {
    toast({
      title: "Settings saved",
      description: `Your ${section} settings have been saved successfully.`,
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center mb-6">
        <SettingsIcon className="h-6 w-6 mr-2 text-architect" />
        <h2 className="text-2xl font-bold tracking-tight">System Settings</h2>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Platform Settings</CardTitle>
              <CardDescription>
                Configure general platform settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input id="companyName" defaultValue="ArchiConnect" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteUrl">Site URL</Label>
                <Input id="siteUrl" defaultValue="https://architech.co.za" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input id="contactEmail" type="email" defaultValue="admin@architech.co.za" />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="maintenance" />
                <Label htmlFor="maintenance">Maintenance Mode</Label>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSaveSettings('general')}>Save Changes</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Regional Settings</CardTitle>
              <CardDescription>
                Configure timezone and regional preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="timezone">Default Timezone</Label>
                <select
                  id="timezone"
                  className="w-full p-2 border rounded-md"
                  defaultValue="Africa/Johannesburg"
                >
                  <option value="Africa/Johannesburg">Africa/Johannesburg</option>
                  <option value="Europe/London">Europe/London</option>
                  <option value="America/New_York">America/New York</option>
                  <option value="Asia/Tokyo">Asia/Tokyo</option>
                  <option value="Australia/Sydney">Australia/Sydney</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateFormat">Date Format</Label>
                <select
                  id="dateFormat"
                  className="w-full p-2 border rounded-md"
                  defaultValue="DD/MM/YYYY"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSaveSettings('regional')}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Bell className="h-5 w-5 mr-2 text-architect" />
                <CardTitle>Email Notifications</CardTitle>
              </div>
              <CardDescription>
                Configure which email notifications are sent
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-new-user">New User Registration</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive an email when a new user registers
                  </p>
                </div>
                <Switch
                  id="email-new-user"
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-new-job">New Job Creation</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive an email when a new job is created
                  </p>
                </div>
                <Switch id="email-new-job" />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-job-status">Job Status Changes</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive an email when a job status changes
                  </p>
                </div>
                <Switch id="email-job-status" defaultChecked />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSaveSettings('email notifications')}>Save Changes</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Bell className="h-5 w-5 mr-2 text-architect" />
                <CardTitle>System Notifications</CardTitle>
              </div>
              <CardDescription>
                Configure which in-app notifications are shown
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notify-messages">New Messages</Label>
                  <p className="text-sm text-muted-foreground">
                    Show notification when new messages are received
                  </p>
                </div>
                <Switch
                  id="notify-messages"
                  checked={systemNotifications}
                  onCheckedChange={setSystemNotifications}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notify-job-updates">Job Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Show notification for job status updates
                  </p>
                </div>
                <Switch id="notify-job-updates" defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notify-system">System Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Show notification for system alerts and important notices
                  </p>
                </div>
                <Switch id="notify-system" defaultChecked />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSaveSettings('system notifications')}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Shield className="h-5 w-5 mr-2 text-architect" />
                <CardTitle>Security Settings</CardTitle>
              </div>
              <CardDescription>
                Configure security settings for the platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="2fa">Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Require 2FA for all admin users
                  </p>
                </div>
                <Switch id="2fa" />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="password-policy">Strong Password Policy</Label>
                  <p className="text-sm text-muted-foreground">
                    Enforce strong password requirements
                  </p>
                </div>
                <Switch id="password-policy" defaultChecked />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                <Input id="session-timeout" type="number" defaultValue="60" />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSaveSettings('security')}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* User Management Settings */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-architect" />
                <CardTitle>User Management Settings</CardTitle>
              </div>
              <CardDescription>
                Configure user registration and management settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="open-registration">Open Registration</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow users to register without approval
                  </p>
                </div>
                <Switch id="open-registration" />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="architect-approval">Architect Approval</Label>
                  <p className="text-sm text-muted-foreground">
                    Require admin approval for architect registrations
                  </p>
                </div>
                <Switch id="architect-approval" defaultChecked />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="max-failed-logins">Max Failed Login Attempts</Label>
                <Input id="max-failed-logins" type="number" defaultValue="5" />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSaveSettings('user management')}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Integration Settings */}
        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-architect" />
                <CardTitle>Email Integration</CardTitle>
              </div>
              <CardDescription>
                Configure email service provider settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="smtp-host">SMTP Host</Label>
                <Input id="smtp-host" defaultValue="smtp.example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp-port">SMTP Port</Label>
                <Input id="smtp-port" type="number" defaultValue="587" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp-username">SMTP Username</Label>
                <Input id="smtp-username" defaultValue="notifications@architech.co.za" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp-password">SMTP Password</Label>
                <Input id="smtp-password" type="password" defaultValue="••••••••••••" />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSaveSettings('email integration')}>Save Changes</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Database className="h-5 w-5 mr-2 text-architect" />
                <CardTitle>API Settings</CardTitle>
              </div>
              <CardDescription>
                Configure API access and rate limits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="api-enabled">Enable API Access</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow external applications to access the API
                  </p>
                </div>
                <Switch id="api-enabled" defaultChecked />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="rate-limit">Rate Limit (requests per minute)</Label>
                <Input id="rate-limit" type="number" defaultValue="60" />
              </div>
              <div className="p-4 bg-secondary rounded-md">
                <h4 className="font-medium mb-2">API Key</h4>
                <div className="flex items-center">
                  <Input readOnly defaultValue="sk_test_51NIdO2GjkPoEkJ..." />
                  <Button variant="outline" className="ml-2">
                    Regenerate
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => handleSaveSettings('API settings')}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
