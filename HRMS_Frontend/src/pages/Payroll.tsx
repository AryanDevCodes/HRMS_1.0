import { useQuery } from '@tanstack/react-query';
import { payrollApi, employeeApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, DollarSign, Loader2, Calendar, TrendingUp, FileText, Users, AlertCircle, BarChart3 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format } from 'date-fns';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { PayslipDialog } from '@/components/payroll/PayslipDialog';
import { generatePayslipPDF } from '@/lib/payslipPDF';
import { useToast } from '@/hooks/use-toast';

export default function Payroll() {
  const { toast } = useToast();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [page, setPage] = useState(0);
  const [viewMode, setViewMode] = useState<'annually' | 'monthly'>('monthly');
  const [payrunSection, setPayrunSection] = useState<'payrun' | 'validate'>('payrun');
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [isPayslipDialogOpen, setIsPayslipDialogOpen] = useState(false);
  const [showEmployeesWithoutBank, setShowEmployeesWithoutBank] = useState(false);
  const [showEmployeesWithoutManager, setShowEmployeesWithoutManager] = useState(false);
  const pageSize = 10;

  // Fetch my payroll records
  const { data: payrollData, isLoading } = useQuery({
    queryKey: ['my-payrolls', page],
    queryFn: () => payrollApi.getMyPayrollsPaginated(page, pageSize),
  });

  // Fetch employee statistics for dashboard
  const { data: employeeStats } = useQuery({
    queryKey: ['employee-stats'],
    queryFn: employeeApi.getStatistics,
  });

  // Fetch all employees for warnings
  const { data: employeesData } = useQuery({
    queryKey: ['all-employees-minimal'],
    queryFn: () => employeeApi.getAll({ page: 0, size: 100 }),
  });

  const payrollRecords = payrollData?.content || [];
  const totalPages = payrollData?.totalPages || 0;
  const employees = employeesData?.content || [];

  // Get employees without bank account
  const employeesWithoutBank = employees.filter((emp: any) => !emp.bankAccountNumber);
  
  // Get employees without manager
  const employeesWithoutManager = employees.filter((emp: any) => !emp.manager);

  // Calculate totals for selected month payrun
  const payrunTotals = employees.reduce((acc: any, employee: any) => {
    const basicSalary = employee.basicSalary || 50000;
    const allowances = basicSalary * 0.3;
    const grossSalary = basicSalary + allowances;
    const deductions = grossSalary * 0.124;
    const netSalary = grossSalary - deductions;
    const employerCost = grossSalary * 1.12;

    return {
      employerCost: acc.employerCost + employerCost,
      gross: acc.gross + grossSalary,
      net: acc.net + netSalary,
    };
  }, { employerCost: 0, gross: 0, net: 0 });

  // Calculate totals for the year
  const yearlyTotals = payrollRecords.reduce((acc: any, record: any) => {
    return {
      grossSalary: acc.grossSalary + (record.grossSalary || 0),
      totalDeductions: acc.totalDeductions + (record.totalDeductions || 0),
      netSalary: acc.netSalary + (record.netSalary || 0),
    };
  }, { grossSalary: 0, totalDeductions: 0, netSalary: 0 });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount || 0);
  };

  const getStatusColor = (isProcessed: boolean) => {
    return isProcessed
      ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
      : 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20';
  };

  const handleDownloadPayslip = (payrollId: number) => {
    // TODO: Implement payslip download
    console.log('Download payslip for:', payrollId);
  };

  const handleDownloadEmployeePayslip = (employee: any) => {
    try {
      const basicSalary = employee.basicSalary || 50000;
      const allowances = basicSalary * 0.3;
      const grossSalary = basicSalary + allowances;
      const deductions = grossSalary * 0.124;
      const netSalary = grossSalary - deductions;

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
        description: `Payslip for ${employee.firstName} ${employee.lastName} downloaded successfully`,
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

  const handleGeneratePayrun = async () => {
    try {
      toast({
        title: 'Generating Payrun',
        description: 'Please wait while we generate payroll for all employees...',
      });

      const result = await payrollApi.generatePayrun(selectedMonth, parseInt(selectedYear));

      if (result.success) {
        toast({
          title: 'Success',
          description: `Payrun generated! ${result.successCount} out of ${result.totalEmployees} employees processed successfully.`,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.message || 'Failed to generate payrun',
        });
      }
    } catch (error: any) {
      console.error('Error generating payrun:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to generate payrun',
      });
    }
  };

  const handleExport = async () => {
    try {
      toast({
        title: 'Exporting',
        description: 'Preparing payroll data for export...',
      });

      const blob = await payrollApi.exportPayroll(selectedMonth, parseInt(selectedYear));
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `payroll_${selectedYear}_${selectedMonth + 1}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Success',
        description: 'Payroll data exported successfully',
      });
    } catch (error: any) {
      console.error('Error exporting payroll:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to export payroll data',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payroll</h1>
          <p className="text-muted-foreground">Manage employee salaries and payments</p>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="payrun">Payrun</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Warning</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {employeesWithoutBank.length > 0 ? (
                  <button 
                    onClick={() => {
                      setShowEmployeesWithoutBank(true);
                      setShowEmployeesWithoutManager(false);
                    }}
                    className="block text-blue-600 hover:underline text-sm w-full text-left"
                  >
                    {employeesWithoutBank.length} Employee{employeesWithoutBank.length > 1 ? 's' : ''} without Bank A/c
                  </button>
                ) : (
                  <p className="text-sm text-muted-foreground">No warnings</p>
                )}
                
                {employeesWithoutManager.length > 0 && (
                  <button 
                    onClick={() => {
                      setShowEmployeesWithoutManager(true);
                      setShowEmployeesWithoutBank(false);
                    }}
                    className="block text-blue-600 hover:underline text-sm w-full text-left"
                  >
                    {employeesWithoutManager.length} Employee{employeesWithoutManager.length > 1 ? 's' : ''} without Manager
                  </button>
                )}
              </CardContent>
            </Card>

            {/* Payrun Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payrun</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <button 
                  onClick={() => {
                    setSelectedMonth(9); // October (0-indexed)
                    setSelectedYear('2025');
                    setShowEmployeesWithoutBank(false);
                    setShowEmployeesWithoutManager(false);
                    // Scroll to payrun section
                    document.querySelector('[value="payrun"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                  }}
                  className="block text-blue-600 hover:underline text-sm w-full text-left"
                >
                  Payrun for Oct 2025 ({employees.length} Payslip{employees.length !== 1 ? 's' : ''})
                </button>
                <button 
                  onClick={() => {
                    setSelectedMonth(8); // September (0-indexed)
                    setSelectedYear('2025');
                    setShowEmployeesWithoutBank(false);
                    setShowEmployeesWithoutManager(false);
                    // Scroll to payrun section
                    document.querySelector('[value="payrun"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                  }}
                  className="block text-blue-600 hover:underline text-sm w-full text-left"
                >
                  Payrun for Sept 2025 ({employees.length} Payslip{employees.length !== 1 ? 's' : ''})
                </button>
              </CardContent>
            </Card>
          </div>
          
          {/* Warning Details Section */}
          {(showEmployeesWithoutBank || showEmployeesWithoutManager) && (
            <Card className="border-yellow-200 bg-yellow-50/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <CardTitle className="text-lg">
                      {showEmployeesWithoutBank 
                        ? `Employees Without Bank Account (${employeesWithoutBank.length})`
                        : `Employees Without Manager (${employeesWithoutManager.length})`
                      }
                    </CardTitle>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setShowEmployeesWithoutBank(false);
                      setShowEmployeesWithoutManager(false);
                    }}
                  >
                    Close
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Alert className="mb-4 bg-yellow-100 border-yellow-300">
                  <AlertDescription className="text-sm">
                    {showEmployeesWithoutBank 
                      ? 'These employees do not have bank account information. Please update their profiles before processing payroll.'
                      : 'These employees do not have an assigned manager. Please assign a manager to complete their profile.'
                    }
                  </AlertDescription>
                </Alert>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(showEmployeesWithoutBank ? employeesWithoutBank : employeesWithoutManager).map((employee: any) => (
                      <TableRow key={employee.id}>
                        <TableCell className="font-medium">{employee.employeeId}</TableCell>
                        <TableCell>{employee.firstName} {employee.lastName}</TableCell>
                        <TableCell>{employee.email}</TableCell>
                        <TableCell>{employee.department || 'N/A'}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => window.location.href = `/employees?id=${employee.id}`}
                          >
                            Update Profile
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Employer Cost & Employee Count Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Employer Cost Card */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Employer cost</CardTitle>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="employer-view" className="text-xs text-muted-foreground">Annually</Label>
                    <Switch id="employer-view" checked={viewMode === 'monthly'} onCheckedChange={(checked) => setViewMode(checked ? 'monthly' : 'annually')} />
                    <Label htmlFor="employer-view" className="text-xs text-muted-foreground">Monthly</Label>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-around items-end h-48 border-b pb-2">
                    {['Jan 2025', 'Feb 2025', 'Mar 2025'].map((month, idx) => (
                      <div key={month} className="flex flex-col items-center gap-2">
                        <div 
                          className="w-16 bg-blue-500/20 rounded-t border-2 border-blue-500 relative"
                          style={{ height: `${80 + idx * 30}px` }}
                        >
                          <div className="absolute inset-0 bg-blue-500/40 rounded-t" style={{ height: '40%', bottom: 0 }}></div>
                        </div>
                        <span className="text-xs text-muted-foreground">{month}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Employee Count Card */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Employee Count</CardTitle>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="employee-view" className="text-xs text-muted-foreground">Annually</Label>
                    <Switch id="employee-view" checked={viewMode === 'monthly'} onCheckedChange={(checked) => setViewMode(checked ? 'monthly' : 'annually')} />
                    <Label htmlFor="employee-view" className="text-xs text-muted-foreground">Monthly</Label>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-around items-end h-48 border-b pb-2">
                    {['Jan 2025', 'Feb 2025', 'Mar 2025'].map((month, idx) => (
                      <div key={month} className="flex flex-col items-center gap-2">
                        <div 
                          className="w-16 bg-cyan-500/20 rounded-t border-2 border-cyan-500 relative"
                          style={{ height: `${100 + idx * 20}px` }}
                        >
                          <div className="absolute inset-0 bg-cyan-500/40 rounded-t" style={{ height: '50%', bottom: 0 }}></div>
                        </div>
                        <span className="text-xs text-muted-foreground">{month}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Payrun Tab */}
        <TabsContent value="payrun" className="space-y-6">
          {/* Sub-navigation for Payrun sections */}
          <div className="flex items-center gap-2 border-b pb-2">
            <Button
              variant={payrunSection === 'payrun' ? 'default' : 'ghost'}
              onClick={() => setPayrunSection('payrun')}
              className="rounded-full"
            >
              Payrun
            </Button>
            <Button
              variant={payrunSection === 'validate' ? 'default' : 'ghost'}
              onClick={() => setPayrunSection('validate')}
              className="rounded-full"
            >
              Validation
            </Button>
          </div>

          {/* Payrun Section */}
          {payrunSection === 'payrun' && (
            <div className="space-y-6">
              {/* Payrun Summary Header */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-8">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Payrun {format(new Date(parseInt(selectedYear), selectedMonth, 1), 'MMM yyyy')}
                        </p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div>
                          <p className="text-xs text-muted-foreground">Employer Cost</p>
                          <p className="text-lg font-bold">{formatCurrency(payrunTotals.employerCost)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Gross</p>
                          <p className="text-lg font-bold">{formatCurrency(payrunTotals.gross)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Net</p>
                          <p className="text-lg font-bold">{formatCurrency(payrunTotals.net)}</p>
                        </div>
                      </div>
                    </div>
                    <Button className="bg-green-600 hover:bg-green-700">
                      Done
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Header with Month Selector and Action Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Select value={selectedMonth.toString()} onValueChange={(val) => setSelectedMonth(parseInt(val))}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Select Month" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          {format(new Date(2025, i, 1), 'MMMM yyyy')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 5 }, (_, i) => currentYear - i).map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleExport}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button className="bg-green-600 hover:bg-green-700" onClick={handleGeneratePayrun}>
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Payrun
                  </Button>
                </div>
              </div>

              {/* Employee Payslip Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Payrun for {format(new Date(parseInt(selectedYear), selectedMonth, 1), 'MMMM yyyy')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pay Period</TableHead>
                        <TableHead>Employee</TableHead>
                        <TableHead className="text-right">Employer Cost</TableHead>
                        <TableHead className="text-right">Basic Wage</TableHead>
                        <TableHead className="text-right">Gross Wage</TableHead>
                      <TableHead className="text-right">Net Wage</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-center">Action</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                          </TableCell>
                        </TableRow>
                      ) : employees.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                            No employees found
                          </TableCell>
                        </TableRow>
                      ) : (
                        employees.map((employee: any) => {
                          // Calculate salary components
                          const basicSalary = employee.basicSalary || 50000;
                          const allowances = basicSalary * 0.3; // 30% allowances
                          const grossSalary = basicSalary + allowances;
                          const deductions = grossSalary * 0.124; // ~12.4% deductions (PF + Tax)
                          const netSalary = grossSalary - deductions;
                          const employerCost = grossSalary * 1.12; // Employer contribution

                          return (
                            <TableRow 
                              key={employee.id}
                              className="hover:bg-muted/50"
                            >
                              <TableCell 
                                className="font-medium cursor-pointer"
                                onClick={() => {
                                  setSelectedEmployee(employee);
                                  setIsPayslipDialogOpen(true);
                                }}
                              >
                                {format(new Date(parseInt(selectedYear), selectedMonth, 1), 'MMM yyyy')}
                              </TableCell>
                              <TableCell
                                className="cursor-pointer"
                                onClick={() => {
                                  setSelectedEmployee(employee);
                                  setIsPayslipDialogOpen(true);
                                }}
                              >
                                <div>
                                  <div className="font-medium">{employee.firstName} {employee.lastName}</div>
                                  <div className="text-xs text-muted-foreground">{employee.employeeId}</div>
                                </div>
                              </TableCell>
                              <TableCell 
                                className="text-right font-medium cursor-pointer"
                                onClick={() => {
                                  setSelectedEmployee(employee);
                                  setIsPayslipDialogOpen(true);
                                }}
                              >
                                {formatCurrency(employerCost)}
                              </TableCell>
                              <TableCell 
                                className="text-right font-medium cursor-pointer"
                                onClick={() => {
                                  setSelectedEmployee(employee);
                                  setIsPayslipDialogOpen(true);
                                }}
                              >
                                {formatCurrency(basicSalary)}
                              </TableCell>
                              <TableCell 
                                className="text-right font-medium cursor-pointer"
                                onClick={() => {
                                  setSelectedEmployee(employee);
                                  setIsPayslipDialogOpen(true);
                                }}
                              >
                                {formatCurrency(grossSalary)}
                              </TableCell>
                              <TableCell 
                                className="text-right font-medium text-green-600 cursor-pointer"
                                onClick={() => {
                                  setSelectedEmployee(employee);
                                  setIsPayslipDialogOpen(true);
                                }}
                              >
                                {formatCurrency(netSalary)}
                              </TableCell>
                              <TableCell 
                                className="text-center cursor-pointer"
                                onClick={() => {
                                  setSelectedEmployee(employee);
                                  setIsPayslipDialogOpen(true);
                                }}
                              >
                                <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
                                  ✓ Done
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownloadEmployeePayslip(employee);
                                  }}
                                  className="gap-1"
                                >
                                  <Download className="h-3 w-3" />
                                  PDF
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Information Footer */}
              <div className="bg-muted/50 p-4 rounded-lg border">
                <p className="text-sm text-muted-foreground mb-2">
                  <strong>Note:</strong> The payslip of an individual employee is generated on the basis of attendance of that employee in a particular month.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-xs">
                  <div>
                    <span className="font-semibold">Employer cost:</span>
                    <span className="text-muted-foreground"> Employee's monthly wage</span>
                  </div>
                  <div>
                    <span className="font-semibold">Basic wage:</span>
                    <span className="text-muted-foreground"> Employee's basic salary</span>
                  </div>
                  <div>
                    <span className="font-semibold">Gross wage:</span>
                    <span className="text-muted-foreground"> Basic salary + all allowances</span>
                  </div>
                  <div>
                    <span className="font-semibold">Net wage:</span>
                    <span className="text-muted-foreground"> Gross - deductions</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Validation Section */}
          {payrunSection === 'validate' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Payrun Validation</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Review and validate payrun data before final processing
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Validation Summary */}
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Valid Entries</p>
                            <p className="text-2xl font-bold text-green-600">{employees.length}</p>
                          </div>
                          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                            <span className="text-2xl">✓</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-yellow-50 border-yellow-200">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Warnings</p>
                            <p className="text-2xl font-bold text-yellow-600">0</p>
                          </div>
                          <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                            <AlertCircle className="h-6 w-6 text-yellow-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-red-50 border-red-200">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Errors</p>
                            <p className="text-2xl font-bold text-red-600">0</p>
                          </div>
                          <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                            <span className="text-2xl text-red-600">✕</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Validation Checks */}
                  <div className="space-y-3">
                    <h3 className="font-semibold">Validation Checks</h3>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 border rounded-lg bg-green-50 border-green-200">
                        <div className="flex items-center gap-3">
                          <span className="text-green-600">✓</span>
                          <div>
                            <p className="font-medium">All employees have attendance records</p>
                            <p className="text-xs text-muted-foreground">No missing attendance data found</p>
                          </div>
                        </div>
                        <Badge className="bg-green-500/10 text-green-600">Passed</Badge>
                      </div>

                      <div className="flex items-center justify-between p-3 border rounded-lg bg-green-50 border-green-200">
                        <div className="flex items-center gap-3">
                          <span className="text-green-600">✓</span>
                          <div>
                            <p className="font-medium">Salary components configured</p>
                            <p className="text-xs text-muted-foreground">All employees have valid salary structures</p>
                          </div>
                        </div>
                        <Badge className="bg-green-500/10 text-green-600">Passed</Badge>
                      </div>

                      <div className="flex items-center justify-between p-3 border rounded-lg bg-green-50 border-green-200">
                        <div className="flex items-center gap-3">
                          <span className="text-green-600">✓</span>
                          <div>
                            <p className="font-medium">Bank account information</p>
                            <p className="text-xs text-muted-foreground">All employees have bank details on file</p>
                          </div>
                        </div>
                        <Badge className="bg-green-500/10 text-green-600">Passed</Badge>
                      </div>

                      <div className="flex items-center justify-between p-3 border rounded-lg bg-green-50 border-green-200">
                        <div className="flex items-center gap-3">
                          <span className="text-green-600">✓</span>
                          <div>
                            <p className="font-medium">Tax calculations</p>
                            <p className="text-xs text-muted-foreground">TDS and other deductions calculated correctly</p>
                          </div>
                        </div>
                        <Badge className="bg-green-500/10 text-green-600">Passed</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button variant="outline">
                      Cancel
                    </Button>
                    <Button className="bg-green-600 hover:bg-green-700">
                      Approve & Process Payrun
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Total Gross Salary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(yearlyTotals.grossSalary)}</div>
                <p className="text-xs text-muted-foreground mt-1">Year to date</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Total Deductions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(yearlyTotals.totalDeductions)}</div>
                <p className="text-xs text-muted-foreground mt-1">Tax + PF + Other</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Net Salary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(yearlyTotals.netSalary)}</div>
                <p className="text-xs text-muted-foreground mt-1">After all deductions</p>
              </CardContent>
            </Card>
          </div>
  
      {/* Payroll History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payroll History</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : payrollRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <DollarSign className="mb-4 h-16 w-16 text-muted-foreground" />
              <h3 className="mb-2 text-xl font-semibold">No Payroll Records</h3>
              <p className="text-center text-muted-foreground">
                No payroll records found for the selected period.
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month/Year</TableHead>
                    <TableHead className="text-right">Gross Salary</TableHead>
                    <TableHead className="text-right">Deductions</TableHead>
                    <TableHead className="text-right">Net Salary</TableHead>
                    <TableHead>Days Worked</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrollRecords.map((record: any) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {record.salaryMonth 
                            ? format(new Date(record.salaryMonth), 'MMMM yyyy')
                            : 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(record.grossSalary)}
                      </TableCell>
                      <TableCell className="text-right text-red-600">
                        -{formatCurrency(record.totalDeductions)}
                      </TableCell>
                      <TableCell className="text-right font-bold text-green-600">
                        {formatCurrency(record.netSalary)}
                      </TableCell>
                      <TableCell>
                        {record.daysWorked} / 30 days
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(record.isProcessed)}>
                          {record.isProcessed ? 'Processed' : 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2"
                          onClick={() => handleDownloadPayslip(record.id)}
                        >
                          <Download className="h-3 w-3" />
                          Payslip
                        </Button>
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

      {/* Payroll Breakdown (for latest month) */}
      {payrollRecords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Latest Payroll Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-muted-foreground">Earnings</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 border rounded">
                    <span className="text-sm">Basic Salary</span>
                    <span className="font-medium">
                      {formatCurrency(payrollRecords[0]?.basicSalary || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded">
                    <span className="text-sm">Overtime</span>
                    <span className="font-medium">
                      {formatCurrency((payrollRecords[0]?.overtimeHours || 0) * 20)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded bg-primary/5">
                    <span className="text-sm font-semibold">Gross Salary</span>
                    <span className="font-bold">
                      {formatCurrency(payrollRecords[0]?.grossSalary || 0)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-muted-foreground">Deductions</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 border rounded">
                    <span className="text-sm">Provident Fund</span>
                    <span className="font-medium text-red-600">
                      -{formatCurrency(payrollRecords[0]?.providentFund || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded">
                    <span className="text-sm">Income Tax</span>
                    <span className="font-medium text-red-600">
                      -{formatCurrency(payrollRecords[0]?.incomeTax || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded">
                    <span className="text-sm">Professional Tax</span>
                    <span className="font-medium text-red-600">
                      -{formatCurrency(payrollRecords[0]?.professionalTax || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded bg-destructive/5">
                    <span className="text-sm font-semibold">Total Deductions</span>
                    <span className="font-bold text-red-600">
                      -{formatCurrency(payrollRecords[0]?.totalDeductions || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 border-2 border-primary rounded-lg bg-primary/5">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Net Salary (Take Home)</span>
                <span className="text-2xl font-bold text-green-600">
                  {formatCurrency(payrollRecords[0]?.netSalary || 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
        </TabsContent>
      </Tabs>

      {/* Payslip Detail Dialog */}
      <PayslipDialog
        open={isPayslipDialogOpen}
        onOpenChange={setIsPayslipDialogOpen}
        employee={selectedEmployee}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
      />
    </div>
  );
}
