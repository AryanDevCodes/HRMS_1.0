import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Download, Clock, LogIn, LogOut, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { attendanceApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function Attendance() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [page, setPage] = useState(0);
  const pageSize = 10;

  // Get current user info from localStorage
  const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = userInfo.role === 'ADMIN' || userInfo.role === 'HR_MANAGER';

  // Get today's attendance status
  const { data: todayAttendance, isLoading: todayLoading } = useQuery({
    queryKey: ['attendance-today'],
    queryFn: () => attendanceApi.getToday(),
  });

  // Get attendance history
  const { data: attendanceData, isLoading: historyLoading } = useQuery({
    queryKey: ['attendance-history', selectedMonth, page],
    queryFn: () => attendanceApi.getMyAttendancePaginated(page, pageSize),
  });

  // Check-in mutation
  const checkInMutation = useMutation({
    mutationFn: () => attendanceApi.checkIn(),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Checked in successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['attendance-today'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-history'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to check in',
        variant: 'destructive',
      });
    },
  });

  // Check-out mutation
  const checkOutMutation = useMutation({
    mutationFn: () => attendanceApi.checkOut(),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Checked out successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['attendance-today'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-history'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to check out',
        variant: 'destructive',
      });
    },
  });

  const getStatusVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'present': return 'default';
      case 'late': return 'secondary';
      case 'half-day': return 'outline';
      case 'absent': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'present':
        return 'bg-green-500/10 text-green-500 hover:bg-green-500/20';
      case 'late':
        return 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20';
      case 'absent':
        return 'bg-red-500/10 text-red-500 hover:bg-red-500/20';
      case 'half_day':
        return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20';
    }
  };

  // Friendly labels for statuses
  const getStatusLabel = (status: string) => {
    if (!status) return 'N/A';
    const s = status.toUpperCase();
    switch (s) {
      case 'PRESENT':
        return 'Present';
      case 'LATE':
        return 'Late';
      case 'HALF_DAY':
      case 'HALF-DAY':
        return 'Half Day';
      case 'ON_LEAVE':
        return 'On Leave';
      case 'ABSENT':
        return 'Absent (No time off applied)';
      default:
        return status;
    }
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return 'N/A';
    try {
      return format(new Date(timeString), 'hh:mm a');
    } catch {
      return timeString;
    }
  };

  const calculateWorkHours = (checkIn: string | null, checkOut: string | null) => {
    if (!checkIn || !checkOut) return 'N/A';
    try {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      const diffMs = end.getTime() - start.getTime();
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m`;
    } catch {
      return 'N/A';
    }
  };

  const attendanceRecords = attendanceData?.content || [];
  const totalPages = attendanceData?.totalPages || 0;
  const hasCheckedIn = !!(todayAttendance && todayAttendance.checkIn);
  const hasCheckedOut = !!(todayAttendance && todayAttendance.checkOut);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Attendance</h1>
          <p className="text-muted-foreground">Monitor employee attendance and work hours</p>
        </div>
        <div className="flex gap-3">
          <Input
            type="month"
            value={selectedMonth}
            onChange={(e) => {
              setSelectedMonth(e.target.value);
              setPage(0);
            }}
            className="w-auto"
          />
        </div>
      </div>

      {/* Check-in/Check-out Card */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Today's Attendance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todayLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Check-in Time */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${hasCheckedIn ? 'bg-green-500/10' : 'bg-gray-500/10'}`}>
                        <LogIn className={`h-5 w-5 ${hasCheckedIn ? 'text-green-500' : 'text-gray-500'}`} />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Check In</p>
                        <p className="text-lg font-semibold">
                          {todayAttendance?.checkIn 
                            ? formatTime(todayAttendance.checkIn) 
                            : 'Not checked in'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Check-out Time */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${hasCheckedOut ? 'bg-blue-500/10' : 'bg-gray-500/10'}`}>
                        <LogOut className={`h-5 w-5 ${hasCheckedOut ? 'text-blue-500' : 'text-gray-500'}`} />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Check Out</p>
                        <p className="text-lg font-semibold">
                          {todayAttendance?.checkOut 
                            ? formatTime(todayAttendance.checkOut) 
                            : 'Not checked out'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Work Hours */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-purple-500/10">
                        <Clock className="h-5 w-5 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Work Hours</p>
                        <p className="text-lg font-semibold">
                          {calculateWorkHours(todayAttendance?.checkIn, todayAttendance?.checkOut)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-center">
                <Button
                  size="lg"
                  onClick={() => checkInMutation.mutate()}
                  disabled={hasCheckedIn || checkInMutation.isPending}
                  className="gap-2"
                >
                  {checkInMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <LogIn className="h-4 w-4" />
                  )}
                  {hasCheckedIn ? 'Already Checked In' : 'Check In'}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => checkOutMutation.mutate()}
                  disabled={!hasCheckedIn || hasCheckedOut || checkOutMutation.isPending}
                  className="gap-2"
                >
                  {checkOutMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="h-4 w-4" />
                  )}
                  {hasCheckedOut ? 'Already Checked Out' : 'Check Out'}
                </Button>
              </div>

              {/* Status */}
              {todayAttendance && (
                <div className="flex justify-center">
                  <Badge className={getStatusColor(todayAttendance.status)}>
                    {getStatusLabel(todayAttendance.status)}
                  </Badge>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Attendance History */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance History</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {historyLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : attendanceRecords.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No attendance records found for this month
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Work Hours</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceRecords.map((record: any) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {record.date ? format(new Date(record.date), 'MMM dd, yyyy') : 'N/A'}
                      </TableCell>
                      <TableCell>{formatTime(record.checkIn)}</TableCell>
                      <TableCell>{formatTime(record.checkOut)}</TableCell>
                      <TableCell>{calculateWorkHours(record.checkIn, record.checkOut)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(record.status)}>
                          {getStatusLabel(record.status)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

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
    </div>
  );
}
