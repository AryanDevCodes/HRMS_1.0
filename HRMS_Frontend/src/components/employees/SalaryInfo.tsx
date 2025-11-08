import { useQuery } from '@tanstack/react-query';
import { employeeApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, TrendingUp, TrendingDown, Info, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { SalaryBreakdown } from '@/types/salary';

interface SalaryInfoProps {
  employeeId: number;
}

export default function SalaryInfo({ employeeId }: SalaryInfoProps) {
  const { data: salaryData, isLoading, error } = useQuery({
    queryKey: ['employee-salary', employeeId],
    queryFn: () => employeeApi.getSalaryStructure(employeeId),
  }) as { data: SalaryBreakdown | undefined; isLoading: boolean; error: Error | null };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <Info className="h-4 w-4" />
        <AlertDescription>
          Failed to load salary information. You may not have permission to view this data.
        </AlertDescription>
      </Alert>
    );
  }

  if (!salaryData) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          No salary structure configured for this employee.
        </AlertDescription>
      </Alert>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Monthly Salary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(salaryData.monthlyWage)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Yearly: {formatCurrency(salaryData.yearlyWage)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Gross Salary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(salaryData.grossSalary)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total Earnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-blue-600" />
              Net Salary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(salaryData.netSalary)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              After Deductions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Earnings Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Earnings Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Component</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Percentage</TableHead>
                <TableHead className="text-right">Amount (Monthly)</TableHead>
                <TableHead className="text-right">Amount (Yearly)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salaryData.earnings.map((earning, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{earning.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {earning.description || '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    {earning.percentage ? `${earning.percentage}%` : '-'}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(earning.amount)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatCurrency(earning.amount * 12)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/50 font-semibold">
                <TableCell colSpan={3}>Gross Salary</TableCell>
                <TableCell className="text-right text-green-600">
                  {formatCurrency(salaryData.grossSalary)}
                </TableCell>
                <TableCell className="text-right text-green-600">
                  {formatCurrency(salaryData.grossSalary * 12)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Deductions Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-red-600" />
            Deductions Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Component</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Percentage</TableHead>
                <TableHead className="text-right">Amount (Monthly)</TableHead>
                <TableHead className="text-right">Amount (Yearly)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salaryData.deductions
                .filter((ded) => !ded.code.includes('EMPLOYER'))
                .map((deduction, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{deduction.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {deduction.description || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {deduction.percentage ? `${deduction.percentage}%` : '-'}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(deduction.amount)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatCurrency(deduction.amount * 12)}
                    </TableCell>
                  </TableRow>
                ))}
              <TableRow className="bg-muted/50 font-semibold">
                <TableCell colSpan={3}>Total Deductions</TableCell>
                <TableCell className="text-right text-red-600">
                  {formatCurrency(salaryData.totalDeductions)}
                </TableCell>
                <TableCell className="text-right text-red-600">
                  {formatCurrency(salaryData.totalDeductions * 12)}
                </TableCell>
              </TableRow>
              <TableRow className="bg-primary/10 font-bold">
                <TableCell colSpan={3}>Net Payable</TableCell>
                <TableCell className="text-right text-primary text-lg">
                  {formatCurrency(salaryData.netSalary)}
                </TableCell>
                <TableCell className="text-right text-primary text-lg">
                  {formatCurrency(salaryData.netSalary * 12)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Employer Contributions */}
      {salaryData.employerContributions > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Employer Contributions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {salaryData.deductions
                .filter((ded) => ded.code.includes('EMPLOYER'))
                .map((contribution, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm font-medium">{contribution.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {formatCurrency(contribution.amount)} / month
                    </span>
                  </div>
                ))}
              <div className="flex justify-between items-center pt-2 border-t font-semibold">
                <span>Total Employer Contribution</span>
                <span className="text-primary">
                  {formatCurrency(salaryData.employerContributions)} / month
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
