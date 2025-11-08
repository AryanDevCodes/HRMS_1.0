import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, ArrowLeft, UserPlus, Mail, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { apiRequest } from '@/lib/api';

interface EmployeeFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: Date | undefined;
  gender: string;
  address: string;
  dateOfJoining: Date | undefined;
  role: string;
  departmentId: number | null;
  designationId: number | null;
  managerId: number | null;
  salary: string;
  status: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  bankAccountNumber: string;
  bankName: string;
  ifscCode: string;
  panNumber: string;
}

const initialFormData: EmployeeFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  dateOfBirth: undefined,
  gender: '',
  address: '',
  dateOfJoining: undefined,
  role: 'EMPLOYEE',
  departmentId: null,
  designationId: null,
  managerId: null,
  salary: '',
  status: 'ACTIVE',
  emergencyContactName: '',
  emergencyContactPhone: '',
  bankAccountNumber: '',
  bankName: '',
  ifscCode: '',
  panNumber: '',
};

export default function EmployeeRegistration() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<EmployeeFormData>(initialFormData);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdEmployee, setCreatedEmployee] = useState<any>(null);

  // Fetch departments
  const { data: departments = [] } = useQuery<any[]>({
    queryKey: ['departments'],
    queryFn: () => apiRequest('/departments'),
  });

  // Fetch designations
  const { data: designations = [] } = useQuery<any[]>({
    queryKey: ['designations'],
    queryFn: () => apiRequest('/designations'),
  });

  // Fetch potential managers (employees with HR_MANAGER or ADMIN roles)
  const { data: managers = [] } = useQuery<any[]>({
    queryKey: ['managers'],
    queryFn: async () => {
      const admins = (await apiRequest('/employees/role/ADMIN')) as any[];
      const hrManagers = (await apiRequest('/employees/role/HR_MANAGER')) as any[];
      return [...admins, ...hrManagers];
    },
  });

  // Create employee mutation
  const createEmployeeMutation = useMutation({
    mutationFn: (employeeData: any) => 
      apiRequest('/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employeeData),
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setCreatedEmployee(data);
      setShowSuccess(true);
      setFormData(initialFormData);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const employeeData = {
      ...formData,
      dateOfBirth: formData.dateOfBirth ? format(formData.dateOfBirth, 'yyyy-MM-dd') : null,
      dateOfJoining: formData.dateOfJoining ? format(formData.dateOfJoining, 'yyyy-MM-dd') : null,
      salary: formData.salary ? parseFloat(formData.salary) : 0,
    };

    createEmployeeMutation.mutate(employeeData);
  };

  const handleInputChange = (field: keyof EmployeeFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (showSuccess && createdEmployee) {
    return (
      <div className="container max-w-2xl py-8">
        <Card className="border-green-500">
          <CardHeader>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
              <div>
                <CardTitle className="text-green-700">Employee Created Successfully!</CardTitle>
                <CardDescription>
                  Welcome email has been sent to {createdEmployee.employee?.email}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-green-50 border border-green-200 p-4 space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Employee ID:</span>
                <span className="font-mono text-green-700">{createdEmployee.employee?.employeeId}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Name:</span>
                <span>{createdEmployee.employee?.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Email:</span>
                <span>{createdEmployee.employee?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Role:</span>
                <span className="capitalize">{createdEmployee.employee?.role?.toLowerCase()}</span>
              </div>
            </div>

            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                A welcome email with login credentials has been sent to the employee's email address.
                The employee can use their email and the temporary password to log in.
              </AlertDescription>
            </Alert>

            <div className="flex gap-3">
              <Button 
                onClick={() => {
                  setShowSuccess(false);
                  setCreatedEmployee(null);
                }}
                className="flex-1"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Add Another Employee
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/employees')}
                className="flex-1"
              >
                View All Employees
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8 pb-20">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/employees')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Employees
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Create New Employee
            </CardTitle>
            <CardDescription>
              Fill in the employee details below. A welcome email with login credentials will be sent automatically.
            </CardDescription>
          </CardHeader>
          <CardContent className="max-h-[calc(100vh-250px)] overflow-y-auto pr-4">
              {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    required
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    required
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input
                    id="phoneNumber"
                    required
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Date of Birth *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !formData.dateOfBirth && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.dateOfBirth ? format(formData.dateOfBirth, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.dateOfBirth}
                        onSelect={(date) => handleInputChange('dateOfBirth', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            {/* Employment Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Employment Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date of Joining *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !formData.dateOfJoining && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.dateOfJoining ? format(formData.dateOfJoining, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.dateOfJoining}
                        onSelect={(date) => handleInputChange('dateOfJoining', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EMPLOYEE">Employee</SelectItem>
                      <SelectItem value="HR_MANAGER">HR Manager</SelectItem>
                      <SelectItem value="PAYROLL_OFFICER">Payroll Officer</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select 
                    value={formData.departmentId?.toString() || ''} 
                    onValueChange={(value) => handleInputChange('departmentId', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(departments) && departments.map((dept: any) => (
                        <SelectItem key={dept.id} value={dept.id.toString()}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="designation">Designation</Label>
                  <Select 
                    value={formData.designationId?.toString() || ''} 
                    onValueChange={(value) => handleInputChange('designationId', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select designation" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(designations) && designations.map((desig: any) => (
                        <SelectItem key={desig.id} value={desig.id.toString()}>
                          {desig.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manager">Reporting Manager</Label>
                  <Select 
                    value={formData.managerId?.toString() || ''} 
                    onValueChange={(value) => handleInputChange('managerId', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select manager" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(managers) && managers.map((manager: any) => (
                        <SelectItem key={manager.id} value={manager.id.toString()}>
                          {manager.fullName} ({manager.employeeId})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salary">Monthly Salary (₹) *</Label>
                  <Input
                    id="salary"
                    type="number"
                    required
                    value={formData.salary}
                    onChange={(e) => handleInputChange('salary', e.target.value)}
                    placeholder="50000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                      <SelectItem value="ON_LEAVE">On Leave</SelectItem>
                      <SelectItem value="SUSPENDED">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Emergency Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactName">Contact Name</Label>
                  <Input
                    id="emergencyContactName"
                    value={formData.emergencyContactName}
                    onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyContactPhone">Contact Phone</Label>
                  <Input
                    id="emergencyContactPhone"
                    value={formData.emergencyContactPhone}
                    onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Bank & Tax Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Bank & Tax Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bankAccountNumber">Bank Account Number</Label>
                  <Input
                    id="bankAccountNumber"
                    value={formData.bankAccountNumber}
                    onChange={(e) => handleInputChange('bankAccountNumber', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    value={formData.bankName}
                    onChange={(e) => handleInputChange('bankName', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ifscCode">IFSC Code</Label>
                  <Input
                    id="ifscCode"
                    value={formData.ifscCode}
                    onChange={(e) => handleInputChange('ifscCode', e.target.value)}
                    placeholder="SBIN0001234"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="panNumber">PAN Number</Label>
                  <Input
                    id="panNumber"
                    value={formData.panNumber}
                    onChange={(e) => handleInputChange('panNumber', e.target.value.toUpperCase())}
                    placeholder="ABCDE1234F"
                    maxLength={10}
                  />
                </div>
              </div>
            </div>

            {createEmployeeMutation.isError && (
              <Alert variant="destructive">
                <AlertDescription>
                  {(createEmployeeMutation.error as any)?.message || 'Failed to create employee. Please try again.'}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          
          <div className="border-t bg-gray-50 px-6 py-4">
            <div className="flex gap-3">
              <Button 
                type="submit" 
                disabled={createEmployeeMutation.isPending} 
                className="flex-1"
              >
                {createEmployeeMutation.isPending ? 'Creating...' : 'Create Employee & Send Welcome Email'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/employees')}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
}
