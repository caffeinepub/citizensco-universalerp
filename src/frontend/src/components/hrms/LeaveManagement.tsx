import { useGetPendingLeaves, useApproveLeave, useRejectLeave } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Check, X, Loader2, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function LeaveManagement() {
  const { data: pendingLeaves, isLoading } = useGetPendingLeaves();
  const approveLeave = useApproveLeave();
  const rejectLeave = useRejectLeave();

  const handleApprove = async (leaveId: string) => {
    try {
      await approveLeave.mutateAsync(leaveId);
      toast.success('Leave request approved');
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve leave');
    }
  };

  const handleReject = async (leaveId: string) => {
    try {
      await rejectLeave.mutateAsync(leaveId);
      toast.success('Leave request rejected');
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject leave');
    }
  };

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) / 1000000).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leave Management</CardTitle>
        <CardDescription>Review and manage employee leave requests</CardDescription>
      </CardHeader>
      <CardContent>
        {!pendingLeaves || pendingLeaves.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No pending leave requests</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee ID</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingLeaves.map((leave) => (
                <TableRow key={leave.id}>
                  <TableCell className="font-medium">{leave.employeeId}</TableCell>
                  <TableCell>{formatDate(leave.startDate)}</TableCell>
                  <TableCell>{formatDate(leave.endDate)}</TableCell>
                  <TableCell>{leave.reason}</TableCell>
                  <TableCell>
                    <Badge variant="outline">Pending</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleApprove(leave.id)}
                        disabled={approveLeave.isPending}
                      >
                        <Check className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReject(leave.id)}
                        disabled={rejectLeave.isPending}
                      >
                        <X className="h-4 w-4 text-red-600" />
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
  );
}
