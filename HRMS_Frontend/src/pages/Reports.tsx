import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

export default function Reports() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground">Generate and view HR reports</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <FileText className="mb-4 h-16 w-16 text-muted-foreground" />
          <h3 className="mb-2 text-xl font-semibold">Reporting Dashboard</h3>
          <p className="text-center text-muted-foreground">
            Comprehensive reporting features will be implemented here.<br />
            Generate attendance, payroll, leave, and custom reports.
          </p>
          <Button className="mt-6">Generate Report</Button>
        </CardContent>
      </Card>
    </div>
  );
}
