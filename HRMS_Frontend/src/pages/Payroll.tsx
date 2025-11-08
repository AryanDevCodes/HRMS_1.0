import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, DollarSign } from 'lucide-react';

export default function Payroll() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payroll</h1>
          <p className="text-muted-foreground">Manage employee salaries and payments</p>
        </div>
        <Button className="gap-2">
          <Download className="h-4 w-4" />
          Generate Payslips
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <DollarSign className="mb-4 h-16 w-16 text-muted-foreground" />
          <h3 className="mb-2 text-xl font-semibold">Payroll Management</h3>
          <p className="text-center text-muted-foreground">
            Payroll features will be implemented here.<br />
            This will include salary processing, tax calculations, and payment history.
          </p>
          <Button className="mt-6">Configure Payroll</Button>
        </CardContent>
      </Card>
    </div>
  );
}
