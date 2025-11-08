import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Users, UserCheck, UserX, Clock, Loader2 } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import EmployeeCard from '@/components/dashboard/EmployeeCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { employeeApi, leaveApi, attendanceApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Fetch employee statistics for this month and last month
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['employeeStats'],
    queryFn: employeeApi.getStatistics,
  });

  // Fetch pending leave requests (only for admin/HR)
  const { data: pendingLeaves, isLoading: leavesLoading } = useQuery({
    queryKey: ['pendingLeaves'],
    queryFn: leaveApi.getPending,
    retry: false, 
  });

  // Fetch today's attendance
  const { data: todayAttendance, isLoading: attendanceLoading } = useQuery({
    queryKey: ['todayAttendance'],
    queryFn: attendanceApi.getToday,
    retry: false,
  });

  // Fetch all employees with real attendance status
  const { data: employeesWithAttendance, isLoading: employeesAttendanceLoading } = useQuery({
    queryKey: ['employeesAttendance'],
    queryFn: attendanceApi.getAllTodayAttendance,
    retry: false,
  });

  const handleApproveLeave = async (leaveId: number) => {
    try {
      await leaveApi.approve(leaveId);
      toast({
        title: 'Success',
        description: 'Leave request approved successfully',
      });
      // Refresh the list
      window.location.reload();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to approve leave',
        variant: 'destructive',
      });
    }
  };

  const handleRejectLeave = async (leaveId: number) => {
    try {
      await leaveApi.reject(leaveId, 'Rejected from dashboard');
      toast({
        title: 'Success',
        description: 'Leave request rejected',
      });
      window.location.reload();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject leave',
        variant: 'destructive',
      });
    }
  };

  const isLoading = statsLoading || leavesLoading || attendanceLoading || employeesAttendanceLoading;

  // Use real attendance data from backend
  const employees = employeesWithAttendance || [];

  return (

    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-2 text-xl font-semibold">
          {user ? (
            <>
              Welcome back,{' '}
              <span className="text-primary font-bold">
                {user.firstName}{user.lastName ? ' ' + user.lastName : ''}
              </span>
              ! Here's what happening today.
            </>
          ) : (
            <>Welcome back! Here's what happening today.</>
          )}
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Employees"
              value={stats?.totalEmployees || 0}
              icon={Users}
              change={stats?.activeEmployees ? `${stats.activeEmployees} active, ${stats.inactiveEmployees || 0} inactive` : undefined}
              trend={'up'}
            />
            <StatCard
              title="Active Employees"
              value={stats?.activeEmployees || 0}
              icon={UserCheck}
              change={`${((stats?.activeEmployees || 0) / (stats?.totalEmployees || 1) * 100).toFixed(1)}% of total`}
              trend="up"
            />
            <StatCard
              title="Inactive Employees"
              value={stats?.inactiveEmployees || 0}
              icon={UserX}
              change={`${((stats?.inactiveEmployees || 0) / (stats?.totalEmployees || 1) * 100).toFixed(1)}% of total`}
              trend={stats?.inactiveEmployees && stats.inactiveEmployees > 0 ? 'down' : undefined}
            />
            <StatCard
              title="Pending Leave Requests"
              value={pendingLeaves?.length || 0}
              icon={Clock}
              change={pendingLeaves && pendingLeaves.length > 0 ? 'Requires attention' : 'All clear'}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Pending Leave Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {!pendingLeaves || pendingLeaves.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No pending leave requests</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingLeaves.slice(0, 5).map((leave) => (
                        <TableRow key={leave.id}>
                          <TableCell className="font-medium">
                            {leave.employee.firstName} {leave.employee.lastName}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {leave.leaveType.name}
                            </Badge>
                          </TableCell>
                          <TableCell>{leave.totalDays} days</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => handleApproveLeave(leave.id)}>
                                Approve
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleRejectLeave(leave.id)}>
                                Reject
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Today's Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                {!todayAttendance ? (
                  <p className="text-center text-muted-foreground py-4">No attendance data available</p>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <p className="font-medium">Check In Time</p>
                        <p className="text-sm text-muted-foreground">
                          {todayAttendance.checkInTime ? format(new Date(`2000-01-01T${todayAttendance.checkInTime}`), 'hh:mm a') : 'Not checked in'}
                        </p>
                      </div>
                      <Badge 
                        variant={
                          todayAttendance.status === 'PRESENT' ? 'default' : 
                          todayAttendance.status === 'LATE' ? 'secondary' : 
                          'destructive'
                        }
                      >
                        {todayAttendance.status}
                      </Badge>
                    </div>
                    {todayAttendance.checkOutTime && (
                      <div className="flex justify-between items-center p-3 border rounded">
                        <div>
                          <p className="font-medium">Check Out Time</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(`2000-01-01T${todayAttendance.checkOutTime}`), 'hh:mm a')}
                          </p>
                        </div>
                        <p className="text-sm font-medium">
                          {todayAttendance.workHours?.toFixed(2)} hrs
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Employee Cards Section */}
          <Card>
            <CardHeader>
              <CardTitle>Team Status</CardTitle>
              <p className="text-sm text-muted-foreground">Current attendance status of all employees</p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {employees.slice(0, 12).map((employee: any) => (
                  <EmployeeCard key={employee.employeeId} employee={employee} />
                ))}
              </div>
              {employees.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No employees found</p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
