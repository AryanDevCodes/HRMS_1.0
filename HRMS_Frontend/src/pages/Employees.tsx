import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, MoreVertical, Pencil, Trash2, Mail, Key, UserCheck, MapPin, Phone, Calendar, Building, Briefcase, DollarSign, User, UserPlus } from 'lucide-react';
import { employeeApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AddEmployeeDialog from '@/components/employees/AddEmployeeDialog';
import SalaryInfo from '@/components/employees/SalaryInfo';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { format } from 'date-fns';

export default function Employees() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [deleteEmployeeId, setDeleteEmployeeId] = useState<number | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);
  const pageSize = 12;

  // Get current user info from localStorage
  const userInfo = JSON.parse(localStorage.getItem('user') || '{}');

  const { data: employeesData, isLoading } = useQuery({
    queryKey: ['employees', page, searchTerm],
    queryFn: async () => {
      if (searchTerm.trim()) {
        return employeeApi.search(searchTerm, page, pageSize);
      }
      return employeeApi.getAll({ page, size: pageSize });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => employeeApi.delete(id),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Employee deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setDeleteEmployeeId(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete employee',
        variant: 'destructive',
      });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (id: number) => employeeApi.resetPassword(id),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Password reset successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reset password',
        variant: 'destructive',
      });
    },
  });

  const activateDeactivateMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => 
      employeeApi.changeStatus(id, status),
    onSuccess: (_, variables) => {
      toast({
        title: 'Success',
        description: `Employee status updated to ${variables.status}`,
      });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update employee status',
        variant: 'destructive',
      });
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-500/10 text-green-500 hover:bg-green-500/20';
      case 'inactive':
        return 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20';
      case 'terminated':
        return 'bg-red-500/10 text-red-500 hover:bg-red-500/20';
      default:
        return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20';
    }
  };

  const employees = employeesData?.content || [];
  const totalPages = employeesData?.totalPages || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Employees</h1>
          <p className="text-muted-foreground">Manage your organization's workforce</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/employees/new')} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Add Employee
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="mb-6 flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Search by name, ID, email, or department..." 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button type="submit" variant="outline" className="gap-2">
              <Search className="h-4 w-4" />
              Search
            </Button>
          </form>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : employees.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              {searchTerm ? 'No employees found matching your search' : 'No employees found'}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {employees.map((employee: any) => (
                  <Card 
                    key={employee.id} 
                    className="hover:shadow-lg transition-shadow cursor-pointer group"
                    onClick={() => setSelectedEmployee(employee)}
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col items-center text-center space-y-2">
                        <Avatar className="h-14 w-14">
                          <AvatarFallback className="bg-primary/10 text-primary text-lg">
                            {employee.firstName?.[0]}{employee.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="space-y-0.5 w-full">
                          <h3 className="font-semibold text-sm">
                            {employee.firstName} {employee.lastName}
                          </h3>
                          <p className="text-xs text-muted-foreground truncate">{employee.email}</p>
                          <p className="text-xs font-mono text-muted-foreground">{employee.employeeId}</p>
                        </div>

                        <div className="flex items-center gap-1 text-xs">
                          <Building className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">{employee.department || 'N/A'}</span>
                        </div>

                        <Badge className={getStatusColor(employee.status || 'active')} style={{ fontSize: '10px', padding: '2px 6px' }}>
                          {employee.status || 'Active'}
                        </Badge>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm" className="w-full h-7 text-xs mt-1">
                              <MoreVertical className="h-3 w-3 mr-1" />
                              Actions
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEmployee(employee);
                            }}>
                              <User className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit Employee
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                              <Mail className="mr-2 h-4 w-4" />
                              Send Email
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                resetPasswordMutation.mutate(employee.id);
                              }}
                            >
                              <Key className="mr-2 h-4 w-4" />
                              Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                activateDeactivateMutation.mutate({ 
                                  id: employee.id, 
                                  status: employee.status?.toLowerCase() === 'active' ? 'INACTIVE' : 'ACTIVE'
                                });
                              }}
                            >
                              <UserCheck className="mr-2 h-4 w-4" />
                              {employee.status?.toLowerCase() === 'active' ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteEmployeeId(employee.id);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Page {page + 1} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(0, p - 1))}
                      disabled={page === 0}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                      disabled={page >= totalPages - 1}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Employee Details Dialog */}
      <Dialog open={selectedEmployee !== null} onOpenChange={() => setSelectedEmployee(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Employee Details</DialogTitle>
            <DialogDescription>Complete information about the employee</DialogDescription>
          </DialogHeader>
          
          {selectedEmployee && (
            <div className="space-y-6">
              {/* Profile Section */}
              <div className="flex items-center gap-6 pb-6 border-b">
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="bg-primary/10 text-primary text-3xl">
                    {selectedEmployee.firstName?.[0]}{selectedEmployee.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold">
                    {selectedEmployee.firstName} {selectedEmployee.lastName}
                  </h3>
                  <p className="text-muted-foreground">{selectedEmployee.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getStatusColor(selectedEmployee.status || 'active')}>
                      {selectedEmployee.status || 'Active'}
                    </Badge>
                    <span className="text-sm font-mono text-muted-foreground">
                      {selectedEmployee.employeeId}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tabbed Content */}
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="salary" disabled={!['ADMIN', 'PAYROLL_OFFICER'].includes(userInfo.role)}>
                    Salary Info
                  </TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-6 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-sm text-muted-foreground">{selectedEmployee.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Phone</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedEmployee.phoneNumber || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Address</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedEmployee.address || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Employment Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Employment Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Building className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Department</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedEmployee.department || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Designation</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedEmployee.designation || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Joining Date</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedEmployee.dateOfJoining 
                            ? format(new Date(selectedEmployee.dateOfJoining), 'MMMM dd, yyyy')
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Salary Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Salary Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Current Salary</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedEmployee.salary 
                            ? `$${Number(selectedEmployee.salary).toLocaleString()}`
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Additional Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Additional Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Role</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedEmployee.role || 'EMPLOYEE'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Date of Birth</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedEmployee.dateOfBirth 
                            ? format(new Date(selectedEmployee.dateOfBirth), 'MMMM dd, yyyy')
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Gender</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedEmployee.gender || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Banking Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Banking Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Bank Name</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedEmployee.bankName || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Account Number</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedEmployee.bankAccountNumber || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">IFSC Code</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedEmployee.ifscCode || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">PAN Number</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedEmployee.panNumber || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Emergency Contact */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Emergency Contact</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Contact Name</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedEmployee.emergencyContactName || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Contact Phone</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedEmployee.emergencyContactPhone || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Manager Information */}
                {selectedEmployee.manager && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Reporting Manager</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-start gap-3">
                        <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Manager Name</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedEmployee.manager.fullName || 
                             `${selectedEmployee.manager.firstName} ${selectedEmployee.manager.lastName}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Designation</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedEmployee.manager.designation || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="salary" className="mt-4">
              {['ADMIN', 'PAYROLL_OFFICER'].includes(userInfo.role) ? (
                <SalaryInfo employeeId={selectedEmployee.id} />
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  You don't have permission to view salary information.
                </div>
              )}
            </TabsContent>

            <TabsContent value="documents" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Documents & Resumes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Document management feature coming soon.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Password Management</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Manage password and account security settings.
                    </p>
                    <Button 
                      variant="outline"
                      onClick={() => resetPasswordMutation.mutate(selectedEmployee.id)}
                    >
                      <Key className="mr-2 h-4 w-4" />
                      Reset Password
                    </Button>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Account Status</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      {selectedEmployee.status?.toLowerCase() === 'active' 
                        ? 'This account is currently active.'
                        : 'This account is currently inactive.'}
                    </p>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        activateDeactivateMutation.mutate({ 
                          id: selectedEmployee.id, 
                          status: selectedEmployee.status?.toLowerCase() === 'active' ? 'INACTIVE' : 'ACTIVE'
                        });
                      }}
                    >
                      <UserCheck className="mr-2 h-4 w-4" />
                      {selectedEmployee.status?.toLowerCase() === 'active' ? 'Deactivate Account' : 'Activate Account'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button 
                  variant="outline"
                  onClick={() => setSelectedEmployee(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteEmployeeId !== null} onOpenChange={() => setDeleteEmployeeId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the employee
              and remove their data from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteEmployeeId && deleteMutation.mutate(deleteEmployeeId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
