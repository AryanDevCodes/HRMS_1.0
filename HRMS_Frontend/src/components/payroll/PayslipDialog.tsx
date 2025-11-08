import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Printer, Check, X, Download } from 'lucide-react';
import { format } from 'date-fns';
import { generatePayslipPDF } from '@/lib/payslipPDF';
import { useToast } from '@/hooks/use-toast';

interface PayslipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: any;
  selectedMonth: number;
  selectedYear: string;
}

export function PayslipDialog({ open, onOpenChange, employee, selectedMonth, selectedYear }: PayslipDialogProps) {
  const { toast } = useToast();
  
  console.log('PayslipDialog rendered:', { open, employee, selectedMonth, selectedYear });
  
  // Calculate salary components
  const basicSalary = employee?.basicSalary || 50000;
  const allowances = basicSalary * 0.3;
  const grossSalary = basicSalary + allowances;
  const deductions = grossSalary * 0.124;
  const netSalary = grossSalary - deductions;

  // Calculate worked days
  const totalWorkingDays = 20.0; // 5 days/week * 4 weeks
  const paidLeaves = 2.0;
  const totalPayableDays = totalWorkingDays + paidLeaves;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount || 0);
  };

  const handlePrintPDF = () => {
    if (!employee) {
      toast({
        title: 'Error',
        description: 'No employee data available',
        variant: 'destructive',
      });
      return;
    }

    try {
      generatePayslipPDF({
        employee: {
          firstName: employee.firstName,
          lastName: employee.lastName,
          employeeId: employee.employeeId,
          email: employee.email,
          department: employee.department,
          designation: employee.designation,
          bankAccountNumber: employee.bankAccountNumber,
          panNumber: employee.panNumber,
        },
        selectedMonth,
        selectedYear,
        basicSalary,
        allowances,
        grossSalary,
        deductions,
        netSalary,
        companyName: employee.companyName || 'WorkZen HRMS',
      });

      toast({
        title: 'Success',
        description: 'Payslip PDF generated successfully',
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate PDF',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {!employee ? (
          <div className="p-4 text-center text-muted-foreground">
            No employee selected
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="text-2xl">
                  {employee.firstName} {employee.lastName}
                </DialogTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                New Payslip
              </Button>
              <Button variant="outline" size="sm">
                Compute
              </Button>
              <Button variant="outline" size="sm">
                Validate
              </Button>
              <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button 
                variant="default" 
                size="sm"
                onClick={handlePrintPDF}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Payrun Information */}
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Payrun</p>
              <p className="font-medium text-blue-600 hover:underline cursor-pointer">
                Payrun {format(new Date(parseInt(selectedYear), selectedMonth, 1), 'MMM yyyy')}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Salary Structure</p>
              <p className="font-medium text-blue-600 hover:underline cursor-pointer">
                Regular Pay
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Period</p>
              <p className="font-medium">
                01 {format(new Date(parseInt(selectedYear), selectedMonth, 1), 'MMM')} to{' '}
                {format(new Date(parseInt(selectedYear), selectedMonth + 1, 0), 'dd MMM')}
              </p>
            </div>
          </div>

          {/* Worked Days & Salary Computation */}
          <Card>
            <CardContent className="p-0">
              <div className="border-b p-4">
                <h3 className="font-semibold">Worked Days & Salary Computation</h3>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Days</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <div>
                        <p className="font-medium">Attendance</p>
                        <p className="text-xs text-muted-foreground">
                          {totalWorkingDays.toFixed(2)} (5 working days in week)
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {totalWorkingDays.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(basicSalary * (totalWorkingDays / 22))}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <div>
                        <p className="font-medium">Paid Time off</p>
                        <p className="text-xs text-muted-foreground">
                          {paidLeaves.toFixed(2)} (2 Paid leaves/Month)
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {paidLeaves.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(basicSalary * (paidLeaves / 22))}
                    </TableCell>
                  </TableRow>
                  <TableRow className="bg-muted/50 font-semibold">
                    <TableCell>Total</TableCell>
                    <TableCell className="text-right">{totalPayableDays.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(basicSalary)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Salary Note */}
          <div className="bg-muted/50 p-4 rounded-lg border">
            <p className="text-sm text-muted-foreground">
              Salary is calculated based on the employee's monthly attendance. Paid leaves are included in the total 
              payable days, while unpaid leaves are deducted from the salary.
            </p>
          </div>

          {/* Earnings & Deductions */}
          <div className="grid grid-cols-2 gap-6">
            {/* Earnings */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3 text-sm">Earnings</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Basic Salary</span>
                    <span className="font-medium">{formatCurrency(basicSalary)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>House Rent Allowance</span>
                    <span className="font-medium">{formatCurrency(allowances * 0.5)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Other Allowances</span>
                    <span className="font-medium">{formatCurrency(allowances * 0.5)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t font-semibold">
                    <span>Gross Salary</span>
                    <span>{formatCurrency(grossSalary)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Deductions */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3 text-sm">Deductions</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Provident Fund (PF)</span>
                    <span className="font-medium text-red-600">-{formatCurrency(deductions * 0.5)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Income Tax (TDS)</span>
                    <span className="font-medium text-red-600">-{formatCurrency(deductions * 0.4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Professional Tax</span>
                    <span className="font-medium text-red-600">-{formatCurrency(deductions * 0.1)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t font-semibold">
                    <span>Total Deductions</span>
                    <span className="text-red-600">-{formatCurrency(deductions)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Net Salary */}
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Net Salary (Take Home)</p>
                  <p className="text-3xl font-bold text-green-600">{formatCurrency(netSalary)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Done</p>
                    <p className="text-xs text-muted-foreground">Payslip validated</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
