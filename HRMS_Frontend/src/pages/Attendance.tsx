import { useQuery } from '@tanstack/react-query';
import { Calendar, Download } from 'lucide-react';
import { api } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function Attendance() {
  const { data: attendance, isLoading } = useQuery({
    queryKey: ['attendance'],
    queryFn: () => api.attendance.getAll(),
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'present': return 'default';
      case 'late': return 'secondary';
      case 'half-day': return 'outline';
      case 'absent': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Attendance</h1>
          <p className="text-muted-foreground">Monitor employee attendance and work hours</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Calendar className="h-4 w-4" />
            Select Date
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-primary">94.4%</div>
            <p className="text-sm text-muted-foreground">Attendance Rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-success">118</div>
            <p className="text-sm text-muted-foreground">Present</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-warning">5</div>
            <p className="text-sm text-muted-foreground">Late</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-destructive">2</div>
            <p className="text-sm text-muted-foreground">Absent</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Work Hours</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendance?.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.employeeName}</TableCell>
                    <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                    <TableCell>{record.checkIn}</TableCell>
                    <TableCell>{record.checkOut}</TableCell>
                    <TableCell>{record.workHours} hrs</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(record.status)} className="capitalize">
                        {record.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
