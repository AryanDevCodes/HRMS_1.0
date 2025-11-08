import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Briefcase, 
  Building2,
  CreditCard,
  Lock,
  Edit
} from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

// Employee interface for profile data
interface EmployeeProfile {
  id: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  role: string;
  status: string;
  dateOfJoining?: string;
  salary?: number;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  bankAccountNumber?: string;
  bankName?: string;
  ifscCode?: string;
  panNumber?: string;
  department?: {
    id: number;
    name: string;
  };
  designation?: {
    id: number;
    name: string;
  };
  manager?: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch complete employee profile
  const { data: employee, isLoading, isError, error } = useQuery<EmployeeProfile>({
    queryKey: ['employeeProfile', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User ID not available');
      return await apiRequest(`/employees/${user.id}`);
    },
    enabled: !!user?.id,
  });

  const getUserInitials = () => {
    if (!user) return 'U';
    const firstInitial = user.firstName?.[0] || '';
    const lastInitial = user.lastName?.[0] || '';
    return `${firstInitial}${lastInitial}`.toUpperCase() || 'U';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return 'N/A';
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="w-96">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Please log in to view your profile</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="w-96">
          <CardContent className="pt-6 text-center">
            <p className="text-destructive mb-4">Failed to load profile information</p>
            <p className="text-sm text-muted-foreground">{error?.message || 'Unknown error'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="w-96">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">No profile data available</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">View and manage your personal information</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/change-password')}>
          <Lock className="mr-2 h-4 w-4" />
          Change Password
        </Button>
      </div>

      {/* Profile Header Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold">
                  {employee.firstName} {employee.lastName}
                </h2>
                <Badge variant={employee.status === 'ACTIVE' ? 'default' : 'secondary'}>
                  {employee.status || 'UNKNOWN'}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span className="text-sm">Employee ID: {employee.employeeCode || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Briefcase className="h-4 w-4" />
                  <span className="text-sm capitalize">
                    {employee.role ? employee.role.toLowerCase().replace('_', ' ') : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span className="text-sm">{employee.department?.name || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">
                    Joined {formatDate(employee.dateOfJoining)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Information Tabs */}
      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList>
          <TabsTrigger value="personal">Personal Information</TabsTrigger>
          <TabsTrigger value="employment">Employment Details</TabsTrigger>
          <TabsTrigger value="banking">Banking & Tax</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Your personal contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </label>
                  <p className="text-base">{employee.email || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </label>
                  <p className="text-base">{employee.phone || 'N/A'}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4" />
                  Address
                </label>
                <p className="text-base">{employee.address || 'N/A'}</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Date of Birth
                  </label>
                  <p className="text-base">{formatDate(employee.dateOfBirth)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Gender
                  </label>
                  <p className="text-base capitalize">
                    {employee.gender ? employee.gender.toLowerCase() : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Emergency Contact</CardTitle>
              <CardDescription>Person to contact in case of emergency</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Contact Name
                  </label>
                  <p className="text-base">{employee.emergencyContactName || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Contact Phone
                  </label>
                  <p className="text-base">{employee.emergencyContactPhone || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Employment Information</CardTitle>
              <CardDescription>Your job and organizational details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Employee Code
                  </label>
                  <p className="text-base font-mono">{employee.employeeCode || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Designation
                  </label>
                  <p className="text-base">{employee.designation?.name || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Department
                  </label>
                  <p className="text-base">{employee.department?.name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Manager
                  </label>
                  <p className="text-base">
                    {employee.manager 
                      ? `${employee.manager.firstName} ${employee.manager.lastName}`
                      : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Date of Joining
                  </label>
                  <p className="text-base">{formatDate(employee.dateOfJoining)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Employment Status
                  </label>
                  <Badge variant={employee.status === 'ACTIVE' ? 'default' : 'secondary'}>
                    {employee.status || 'UNKNOWN'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Salary Information</CardTitle>
              <CardDescription>Your compensation details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Base Salary
                  </label>
                  <p className="text-2xl font-bold">
                    {employee.salary ? `₹${employee.salary.toLocaleString('en-IN')}` : 'N/A'}
                  </p>
                  <p className="text-xs text-muted-foreground">per month</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="banking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bank Account Details</CardTitle>
              <CardDescription>Information for salary disbursement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Bank Name
                  </label>
                  <p className="text-base">{employee.bankName || 'N/A'}</p>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      Account Number
                    </label>
                    <p className="text-base font-mono">{employee.bankAccountNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      IFSC Code
                    </label>
                    <p className="text-base font-mono">{employee.ifscCode || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tax Information</CardTitle>
              <CardDescription>Your tax identification details</CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  PAN Number
                </label>
                <p className="text-base font-mono">{employee.panNumber || 'N/A'}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}