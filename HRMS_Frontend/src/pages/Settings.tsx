import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

const companySettingsSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  companyEmail: z.string().email('Please enter a valid email address'),
  companyPhone: z.string().min(10, 'Please enter a valid phone number'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  timezone: z.string().min(1, 'Please select a timezone'),
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
});

type CompanySettingsFormValues = z.infer<typeof companySettingsSchema>;
type WorkSettingsFormValues = z.infer<typeof workSettingsSchema>;
type NotificationSettingsFormValues = z.infer<typeof notificationSettingsSchema>;

export default function Settings() {
  const { toast } = useToast();

  const companyForm = useForm<CompanySettingsFormValues>({
    resolver: zodResolver(companySettingsSchema),
    defaultValues: {
      companyName: 'ACME Corporation',
      companyEmail: 'info@acme.com',
      companyPhone: '+1 (555) 123-4567',
      address: '123 Business St, Suite 100, City, State 12345',
      timezone: 'America/New_York',
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
      attendanceNotifications: false,
      payrollNotifications: true,
    },
  });

  const onCompanySubmit = (data: CompanySettingsFormValues) => {
    console.log('Company settings:', data);
    toast({
      title: 'Settings saved',
      description: 'Company settings have been updated successfully.',
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Configure system preferences and policies</p>
      </div>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList>
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="work">Work Policy</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Manage your organization's basic information</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...companyForm}>
                <form onSubmit={companyForm.handleSubmit(onCompanySubmit)} className="space-y-4">
                  <FormField
                    control={companyForm.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input placeholder="ACME Corporation" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={companyForm.control}
                      name="companyEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Email</FormLabel>
                          <FormControl>
                            <Input placeholder="info@company.com" type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={companyForm.control}
                      name="companyPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="+1 (555) 123-4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={companyForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Business St, Suite 100" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={companyForm.control}
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
                            <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                            <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                            <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                            <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                            <SelectItem value="Europe/London">London (GMT)</SelectItem>
                            <SelectItem value="Europe/Paris">Central European Time (CET)</SelectItem>
                            <SelectItem value="Asia/Tokyo">Japan (JST)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end pt-4">
                    <Button type="submit">Save Changes</Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="work">
          <Card>
            <CardHeader>
              <CardTitle>Work Policy</CardTitle>
              <CardDescription>Configure working hours and leave policies</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...workForm}>
                <form onSubmit={workForm.handleSubmit(onWorkSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={workForm.control}
                      name="workingHoursStart"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Working Hours Start</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={workForm.control}
                      name="workingHoursEnd"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Working Hours End</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={workForm.control}
                    name="workingDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Working Days per Week</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select working days" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="5">5 Days (Mon-Fri)</SelectItem>
                            <SelectItem value="6">6 Days (Mon-Sat)</SelectItem>
                            <SelectItem value="7">7 Days</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={workForm.control}
                      name="annualLeave"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Annual Leave Days</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="20" {...field} />
                          </FormControl>
                          <FormDescription>Days per year</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={workForm.control}
                      name="sickLeave"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sick Leave Days</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="10" {...field} />
                          </FormControl>
                          <FormDescription>Days per year</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button type="submit">Save Changes</Button>
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

                  <div className="flex justify-end pt-4">
                    <Button type="submit">Save Preferences</Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
