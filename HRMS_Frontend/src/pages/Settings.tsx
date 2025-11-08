import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Separator } from '@/components/ui/separator';
import { Bell, Lock, Palette, Globe, Mail, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { apiRequest } from '@/lib/api';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';

const preferencesSchema = z.object({
  language: z.string(),
  timezone: z.string(),
  dateFormat: z.string(),
  theme: z.string(),
});

const workSettingsSchema = z.object({
  workingHoursStart: z.string().min(1, 'Please select start time'),
  workingHoursEnd: z.string().min(1, 'Please select end time'),
  workingDays: z.string().min(1, 'Please select working days'),
  annualLeave: z.string().min(1, 'Please enter annual leave days'),
  sickLeave: z.string().min(1, 'Please enter sick leave days'),
});

const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean(),
  leaveRequestNotifications: z.boolean(),
  attendanceNotifications: z.boolean(),
  payrollNotifications: z.boolean(),
  performanceReviewNotifications: z.boolean(),
  desktopNotifications: z.boolean(),
});

type PreferencesFormValues = z.infer<typeof preferencesSchema>;
type WorkSettingsFormValues = z.infer<typeof workSettingsSchema>;
type NotificationSettingsFormValues = z.infer<typeof notificationSettingsSchema>;

export default function Settings() {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const preferencesForm = useForm<PreferencesFormValues>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      language: 'en',
      timezone: 'Asia/Kolkata',
      dateFormat: 'DD/MM/YYYY',
      theme: 'system',
    },
  });

  const workForm = useForm<WorkSettingsFormValues>({
    resolver: zodResolver(workSettingsSchema),
    defaultValues: {
      workingHoursStart: '09:00',
      workingHoursEnd: '17:00',
      workingDays: '5',
      annualLeave: '20',
      sickLeave: '10',
    },
  });

  const notificationForm = useForm<NotificationSettingsFormValues>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      emailNotifications: true,
      leaveRequestNotifications: true,
      attendanceNotifications: true,
      payrollNotifications: true,
      performanceReviewNotifications: false,
      desktopNotifications: false,
    },
  });

  const onPreferencesSubmit = (data: PreferencesFormValues) => {
    console.log('Preferences:', data);
    localStorage.setItem('userPreferences', JSON.stringify(data));
    toast({
      title: 'Preferences saved',
      description: 'Your preferences have been updated successfully.',
    });
  };

  const onWorkSubmit = (data: WorkSettingsFormValues) => {
    console.log('Work settings:', data);
    toast({
      title: 'Settings saved',
      description: 'Work policy settings have been updated successfully.',
    });
  };

  const onNotificationSubmit = (data: NotificationSettingsFormValues) => {
    console.log('Notification settings:', data);
    toast({
      title: 'Settings saved',
      description: 'Notification preferences have been updated successfully.',
    });
  };

  return (
    <div className="space-y-6 bg-pink-70 min-h-screen">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your application preferences and notification settings</p>
      </div>

      <Tabs defaultValue="preferences" className="space-y-6">
        <TabsList>
          <TabsTrigger value="preferences">
            <Globe className="mr-2 h-4 w-4" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="account">
            <Lock className="mr-2 h-4 w-4" />
            Account & Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Application Preferences</CardTitle>
              <CardDescription>Customize your application experience</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...preferencesForm}>
                <form onSubmit={preferencesForm.handleSubmit(onPreferencesSubmit)} className="space-y-6">
                  <FormField
                    control={preferencesForm.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Language</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="hi">हिन्दी (Hindi)</SelectItem>
                            <SelectItem value="es">Español (Spanish)</SelectItem>
                            <SelectItem value="fr">Français (French)</SelectItem>
                            <SelectItem value="de">Deutsch (German)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose your preferred language for the application
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={preferencesForm.control}
                    name="timezone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Timezone</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select timezone" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Asia/Kolkata">India (IST)</SelectItem>
                            <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                            <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                            <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                            <SelectItem value="Asia/Tokyo">Japan (JST)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Select your timezone for accurate time display
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={preferencesForm.control}
                    name="dateFormat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date Format</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select date format" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (31/12/2024)</SelectItem>
                            <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (12/31/2024)</SelectItem>
                            <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (2024-12-31)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose how dates are displayed throughout the app
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={preferencesForm.control}
                    name="theme"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Theme</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select theme" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                            <SelectItem value="system">System Default</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose your preferred color theme
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end pt-4">
                    <Button type="submit">Save Preferences</Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...notificationForm}>
                <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-6">
                  <FormField
                    control={notificationForm.control}
                    name="emailNotifications"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Email Notifications</FormLabel>
                          <FormDescription>
                            Receive notifications via email
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={notificationForm.control}
                    name="leaveRequestNotifications"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Leave Requests</FormLabel>
                          <FormDescription>
                            Get notified about new leave requests
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={notificationForm.control}
                    name="attendanceNotifications"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Attendance Updates</FormLabel>
                          <FormDescription>
                            Get notified about attendance changes
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={notificationForm.control}
                    name="payrollNotifications"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Payroll Notifications</FormLabel>
                          <FormDescription>
                            Get notified about payroll processing
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={notificationForm.control}
                    name="performanceReviewNotifications"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Performance Reviews</FormLabel>
                          <FormDescription>
                            Get notified about performance review updates
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={notificationForm.control}
                    name="desktopNotifications"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Desktop Notifications</FormLabel>
                          <FormDescription>
                            Enable browser desktop notifications
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end pt-4">
                    <Button type="submit">Save Preferences</Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account & Security</CardTitle>
              <CardDescription>Manage your account settings and security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Password</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Update your password to keep your account secure
                </p>
                <Button variant="outline" onClick={() => navigate('/change-password')}>
                  <Lock className="mr-2 h-4 w-4" />
                  Change Password
                </Button>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-2">Personal Information</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  View and update your personal profile information
                </p>
                <Button variant="outline" onClick={() => navigate('/profile')}>
                  <Mail className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-2">Account Information</h3>
                <div className="space-y-3 mt-4">
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Employee ID</p>
                      <p className="text-sm text-muted-foreground font-mono">{user?.employeeId || user?.employeeId || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Role</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {user?.role?.toLowerCase().replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
