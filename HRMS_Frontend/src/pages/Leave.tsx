import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leaveApi, leaveBalanceApi, leaveTypeApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
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
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Loader2, Calendar, CheckCircle, XCircle, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function Leave() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { hasRole } = useAuth();
  const [selectedTab, setSelectedTab] = useState('my-leaves');
  const isManager = hasRole(['ADMIN', 'HR_MANAGER']);

  // Fetch my leave requests
  const { data: myLeaves, isLoading: myLeavesLoading } = useQuery({
    queryKey: ['myLeaves'],
    queryFn: leaveApi.getMyLeaves,
  });

  // Fetch pending approvals (for managers)
  const { data: pendingApprovals, isLoading: approvalsLoading } = useQuery({
    queryKey: ['pendingApprovals'],
    queryFn: leaveApi.getPendingApprovals,
    enabled: isManager,
  });

  // Fetch leave balances
  const { data: leaveBalances, isLoading: balancesLoading } = useQuery({
    queryKey: ['myLeaveBalances'],
    queryFn: leaveBalanceApi.getMyBalances,
  });

  // Fetch leave types
  const { data: leaveTypes } = useQuery({
    queryKey: ['leaveTypes'],
    queryFn: leaveTypeApi.getActive,
  });

  // Approve leave mutation
  const approveMutation = useMutation({
    mutationFn: (id: number) => leaveApi.approve(id),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Leave request approved successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['pendingApprovals'] });
      queryClient.invalidateQueries({ queryKey: ['myLeaves'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to approve leave',
        variant: 'destructive',
      });
    },
  });

  // Reject leave mutation
  const rejectMutation = useMutation({
    mutationFn: (id: number) => leaveApi.reject(id, 'Rejected by manager'),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Leave request rejected',
      });
      queryClient.invalidateQueries({ queryKey: ['pendingApprovals'] });
      queryClient.invalidateQueries({ queryKey: ['myLeaves'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject leave',
        variant: 'destructive',
      });
    },
  });

  // Cancel leave mutation
  const cancelMutation = useMutation({
    mutationFn: (id: number) => leaveApi.cancel(id),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Leave request cancelled',
      });
      queryClient.invalidateQueries({ queryKey: ['myLeaves'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to cancel leave',
        variant: 'destructive',
      });
    },
  });

  const getStatusVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      case 'cancelled': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-500/10 text-green-500 hover:bg-green-500/20';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20';
      case 'rejected':
        return 'bg-red-500/10 text-red-500 hover:bg-red-500/20';
      case 'cancelled':
        return 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20';
      default:
        return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20';
    }
  };

  const getLeaveTypeColor = (type: string) => {
    const colors: any = {
      'Sick Leave': 'bg-red-500/10 text-red-500 border-red-500/20',
      'Casual Leave': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      'Annual Leave': 'bg-green-500/10 text-green-500 border-green-500/20',
      'Maternity Leave': 'bg-pink-500/10 text-pink-500 border-pink-500/20',
      'Paternity Leave': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    };
    return colors[type] || 'bg-gray-500/10 text-gray-500 border-gray-500/20';
  };

  const filterByStatus = (leaves: any[], status: string) => {
    if (status === 'all') return leaves;
    return leaves?.filter(req => req.status?.toLowerCase() === status) || [];
  };

  const renderLeaveTable = (leaves: any[], showActions: boolean = false, showEmployee: boolean = false) => {
    if (!leaves || leaves.length === 0) {
      return (
        <div className="py-8 text-center text-muted-foreground">
          No leave requests found
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            {showEmployee && <TableHead>Employee</TableHead>}
            <TableHead>Leave Type</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Days</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leaves.map((request) => (
            <TableRow key={request.id}>
              {showEmployee && (
                <TableCell className="font-medium">
                  {request.employee?.firstName} {request.employee?.lastName}
                </TableCell>
              )}
              <TableCell>
                <Badge variant="outline" className={getLeaveTypeColor(request.leaveType?.name)}>
                  {request.leaveType?.name}
                </Badge>
              </TableCell>
              <TableCell>
                {request.startDate ? format(new Date(request.startDate), 'MMM dd, yyyy') : 'N/A'}
              </TableCell>
              <TableCell>
                {request.endDate ? format(new Date(request.endDate), 'MMM dd, yyyy') : 'N/A'}
              </TableCell>
              <TableCell>{request.totalDays}</TableCell>
              <TableCell className="max-w-xs truncate">{request.reason}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(request.status)}>
                  {request.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {showActions && request.status?.toLowerCase() === 'pending' && (
                  <div className="flex justify-end gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => approveMutation.mutate(request.id)}
                      disabled={approveMutation.isPending}
                      className="gap-1"
                    >
                      <CheckCircle className="h-3 w-3" />
                      Approve
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => rejectMutation.mutate(request.id)}
                      disabled={rejectMutation.isPending}
                      className="gap-1"
                    >
                      <XCircle className="h-3 w-3" />
                      Reject
                    </Button>
                  </div>
                )}
                {!showActions && request.status?.toLowerCase() === 'pending' && (
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => cancelMutation.mutate(request.id)}
                    disabled={cancelMutation.isPending}
                  >
                    Cancel
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  const isLoading = myLeavesLoading || balancesLoading || approvalsLoading;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Leave TimeOff</h1>
          <p className="text-muted-foreground">Track and manage employee leave requests</p>
        </div>
        <LeaveRequestDialog />
      </div>

      {/* Leave Balance Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {balancesLoading ? (
          <div className="col-span-full flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : leaveBalances && leaveBalances.length > 0 ? (
          leaveBalances.map((balance: any) => {
            const usagePercentage = (balance.used / balance.totalAllocated) * 100;
            const isLowBalance = balance.balance < balance.totalAllocated * 0.2;
            
            return (
              <Card key={balance.id} className={isLowBalance ? 'border-orange-500/50' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {balance.leaveType?.name}
                    </CardTitle>
                    {isLowBalance && (
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-primary">{balance.balance}</span>
                      <span className="text-sm text-muted-foreground">remaining</span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{balance.used} used</span>
                        <span>{balance.totalAllocated} total</span>
                      </div>
                      <Progress 
                        value={usagePercentage} 
                        className="h-2"
                      />
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs">
                      {isLowBalance ? (
                        <span className="text-orange-500 font-medium">⚠️ Low balance</span>
                      ) : (
                        <span className="text-green-600 font-medium">✓ Available</span>
                      )}
                      <span className="text-muted-foreground">
                        • {balance.year}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Calendar className="mb-2 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">No leave balance information available</p>
              <p className="text-sm text-muted-foreground mt-1">Contact HR to set up your leave allocation</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Leave Requests Table */}
      <Card>
        <CardContent className="p-6">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="my-leaves">My Leaves</TabsTrigger>
              {isManager && <TabsTrigger value="pending-approvals">Pending Approvals</TabsTrigger>}
              <TabsTrigger value="all">All Requests</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <TabsContent value="my-leaves">
                  {renderLeaveTable(myLeaves || [], false, false)}
                </TabsContent>

                {isManager && (
                  <TabsContent value="pending-approvals">
                    {renderLeaveTable(pendingApprovals || [], true, true)}
                  </TabsContent>
                )}

                <TabsContent value="all">
                  {renderLeaveTable(myLeaves || [], false, false)}
                </TabsContent>

                <TabsContent value="approved">
                  {renderLeaveTable(filterByStatus(myLeaves || [], 'approved'), false, false)}
                </TabsContent>

                <TabsContent value="rejected">
                  {renderLeaveTable(filterByStatus(myLeaves || [], 'rejected'), false, false)}
                </TabsContent>
              </>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
