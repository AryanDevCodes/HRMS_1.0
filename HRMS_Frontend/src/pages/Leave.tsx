import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import LeaveRequestDialog from '@/components/leave/LeaveRequestDialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Leave() {
  const { data: leaveRequests, isLoading } = useQuery({
    queryKey: ['leaveRequests'],
    queryFn: api.leave.getAll,
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };

  const getLeaveTypeColor = (type: string) => {
    switch (type) {
      case 'sick': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'casual': return 'bg-accent/10 text-accent border-accent/20';
      case 'annual': return 'bg-primary/10 text-primary border-primary/20';
      default: return 'bg-muted';
    }
  };

  const filterByStatus = (status: string) => {
    if (status === 'all') return leaveRequests;
    return leaveRequests?.filter(req => req.status === status);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Leave Management</h1>
          <p className="text-muted-foreground">Track and manage employee leave requests</p>
        </div>
        <LeaveRequestDialog />
      </div>

      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="all">
            <TabsList className="mb-6">
              <TabsTrigger value="all">All Requests</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>

            {['all', 'pending', 'approved', 'rejected'].map((status) => (
              <TabsContent key={status} value={status}>
                {isLoading ? (
                  <div className="py-8 text-center text-muted-foreground">Loading...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Leave Type</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>End Date</TableHead>
                        <TableHead>Days</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filterByStatus(status)?.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell className="font-medium">{request.employeeName}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getLeaveTypeColor(request.leaveType) + ' capitalize'}>
                              {request.leaveType}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(request.startDate).toLocaleDateString()}</TableCell>
                          <TableCell>{new Date(request.endDate).toLocaleDateString()}</TableCell>
                          <TableCell>{request.days}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusVariant(request.status)} className="capitalize">
                              {request.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">{request.reason}</TableCell>
                          <TableCell className="text-right">
                            {request.status === 'pending' && (
                              <div className="flex justify-end gap-2">
                                <Button size="sm" variant="outline">Approve</Button>
                                <Button size="sm" variant="outline">Reject</Button>
                              </div>
                            )}
                            {request.status !== 'pending' && (
                              <Button size="sm" variant="ghost">View</Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
