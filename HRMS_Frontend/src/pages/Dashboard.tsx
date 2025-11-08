import { useQuery } from '@tanstack/react-query';
import { Users, UserCheck, UserX, Clock } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api, mockLeaveRequests, mockAttendance } from '@/lib/mockData';
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

export default function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: api.dashboard.getStats,
  });

  const pendingLeaves = mockLeaveRequests.filter(req => req.status === 'pending');
  const todayAttendance = mockAttendance.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Employees"
          value={stats?.totalEmployees || 0}
          icon={Users}
          change="+2.5% from last month"
          trend="up"
        />
        <StatCard
          title="Present Today"
          value={stats?.presentToday || 0}
          icon={UserCheck}
          change="94.4% attendance"
          trend="up"
        />
        <StatCard
          title="On Leave"
          value={stats?.onLeave || 0}
          icon={UserX}
        />
        <StatCard
          title="Pending Requests"
          value={stats?.pendingRequests || 0}
          icon={Clock}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pending Leave Requests</CardTitle>
          </CardHeader>
          <CardContent>
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
                {pendingLeaves.map((leave) => (
                  <TableRow key={leave.id}>
                    <TableCell className="font-medium">{leave.employeeName}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {leave.leaveType}
                      </Badge>
                    </TableCell>
                    <TableCell>{leave.days} days</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">Approve</Button>
                        <Button size="sm" variant="outline">Reject</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Today's Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {todayAttendance.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.employeeName}</TableCell>
                    <TableCell>{record.checkIn}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          record.status === 'present' ? 'default' : 
                          record.status === 'late' ? 'secondary' : 
                          'destructive'
                        }
                        className="capitalize"
                      >
                        {record.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
