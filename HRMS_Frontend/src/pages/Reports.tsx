import { useQuery } from '@tanstack/react-query';
import { employeeApi, attendanceApi, leaveApi, payrollApi, apiRequest } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Loader2, Users, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function Reports() {
  const currentYear = new Date().getFullYear();
  const [selectedReport, setSelectedReport] = useState('employee');
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  
  // Fetch employee statistics
  const { data: employeeStats, isLoading: employeeLoading } = useQuery({
    queryKey: ['employeeStats'],
    queryFn: employeeApi.getStatistics,
  });

  // Fetch all employees
  const { data: employeesData, isLoading: employeesLoading } = useQuery({
    queryKey: ['all-employees'],
    queryFn: () => employeeApi.getAll({ page: 0, size: 100 }),
  });

  // Fetch pending leaves
  const { data: pendingLeaves, isLoading: leavesLoading } = useQuery({
    queryKey: ['pending-leaves-report'],
    queryFn: leaveApi.getPending,
  });

  // Fetch selected employee's salary structure
  const { data: salaryData, isLoading: salaryLoading } = useQuery({
    queryKey: ['salary-report', selectedEmployeeId],
    queryFn: () => apiRequest(`/employees/${selectedEmployeeId}/salary-structure`),
    enabled: !!selectedEmployeeId && selectedReport === 'payroll',
  }) as { data: any; isLoading: boolean };

  const employees = employeesData?.content || [];
  const isLoading = employeeLoading || employeesLoading || leavesLoading;

  const reportTypes = [
    {
      id: 'employee',
      name: 'Employee Report',
      icon: Users,
      description: 'Overview of all employees and their details',
    },
    {
      id: 'attendance',
      name: 'Attendance Report',
      icon: Calendar,
      description: 'Employee attendance summary and statistics',
    },
    {
      id: 'leave',
      name: 'Leave Report',
      icon: FileText,
      description: 'Leave applications and balances',
    },
    {
      id: 'payroll',
      name: 'Payroll Report',
      icon: DollarSign,
      description: 'Salary and payment information',
    },
  ];

  const handleExportReport = (reportType: string) => {
    // TODO: Implement report export functionality
    console.log('Exporting report:', reportType);
  };

  const getDepartmentCounts = () => {
    const deptCounts: any = {};
    employees.forEach((emp: any) => {
      const dept = emp.departmentName || 'Unassigned';
      deptCounts[dept] = (deptCounts[dept] || 0) + 1;
    });
    return Object.entries(deptCounts).map(([name, count]) => ({ name, count }));
  };

  const getRoleCounts = () => {
    const roleCounts: any = {};
    employees.forEach((emp: any) => {
      const role = emp.role || 'EMPLOYEE';
      roleCounts[role] = (roleCounts[role] || 0) + 1;
    });
    return Object.entries(roleCounts).map(([name, count]) => ({ name, count }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">Generate and view HR reports</p>
        </div>
        <div className="flex gap-3">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 6 }, (_, i) => {
                const date = subMonths(new Date(), i);
                return (
                  <SelectItem key={i} value={format(date, 'yyyy-MM')}>
                    {format(date, 'MMMM yyyy')}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <Button onClick={() => handleExportReport(selectedReport)} className="gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Quick Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{employeeStats?.totalEmployees || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{employeeStats?.activeEmployees || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Leaves</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{pendingLeaves?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Departments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{getDepartmentCounts().length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Report Types Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          const isSelected = selectedReport === report.id;
          return (
            <Card
              key={report.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                isSelected ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedReport(report.id)}
            >
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className={`p-3 rounded-full ${isSelected ? 'bg-primary' : 'bg-muted'}`}>
                    <Icon className={`h-6 w-6 ${isSelected ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold">{report.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{report.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Report Content */}
      <Card>
        <CardHeader>
          <CardTitle>
            {reportTypes.find(r => r.id === selectedReport)?.name || 'Report'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Tabs value={selectedReport} onValueChange={setSelectedReport}>
              <TabsContent value="employee">
                <div className="space-y-6">
                  {/* Employee Distribution */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">By Department</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {getDepartmentCounts().map((dept: any) => (
                            <div key={dept.name} className="flex justify-between items-center p-3 border rounded">
                              <span className="font-medium">{dept.name}</span>
                              <Badge variant="outline">{dept.count}</Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">By Role</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {getRoleCounts().map((role: any) => (
                            <div key={role.name} className="flex justify-between items-center p-3 border rounded">
                              <span className="font-medium">{role.name}</span>
                              <Badge variant="outline">{role.count}</Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Employee List */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Designation</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Join Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {employees.slice(0, 10).map((emp: any) => (
                        <TableRow key={emp.id}>
                          <TableCell className="font-mono text-sm">{emp.employeeId}</TableCell>
                          <TableCell className="font-medium">
                            {emp.firstName} {emp.lastName}
                          </TableCell>
                          <TableCell>{emp.departmentName || 'N/A'}</TableCell>
                          <TableCell>{emp.designationName || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge variant={emp.status?.toLowerCase() === 'active' ? 'default' : 'secondary'}>
                              {emp.status || 'Active'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {emp.joiningDate ? format(new Date(emp.joiningDate), 'MMM dd, yyyy') : 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="attendance">
                <div className="flex flex-col items-center justify-center py-16">
                  <Calendar className="mb-4 h-16 w-16 text-muted-foreground" />
                  <h3 className="mb-2 text-xl font-semibold">Attendance Report</h3>
                  <p className="text-center text-muted-foreground">
                    Detailed attendance reports will be shown here.<br />
                    Including daily attendance, late arrivals, and work hours summary.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="leave">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Pending Leave Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {pendingLeaves && pendingLeaves.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Employee</TableHead>
                              <TableHead>Leave Type</TableHead>
                              <TableHead>Start Date</TableHead>
                              <TableHead>End Date</TableHead>
                              <TableHead>Days</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {pendingLeaves.map((leave: any) => (
                              <TableRow key={leave.id}>
                                <TableCell className="font-medium">
                                  {leave.employee?.firstName} {leave.employee?.lastName}
                                </TableCell>
                                <TableCell>{leave.leaveType?.name}</TableCell>
                                <TableCell>
                                  {leave.startDate ? format(new Date(leave.startDate), 'MMM dd, yyyy') : 'N/A'}
                                </TableCell>
                                <TableCell>
                                  {leave.endDate ? format(new Date(leave.endDate), 'MMM dd, yyyy') : 'N/A'}
                                </TableCell>
                                <TableCell>{leave.totalDays}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <p className="text-center text-muted-foreground py-8">No pending leave requests</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="payroll">
                <div className="space-y-6">
                  {/* Filters */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Salary Statement Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Employee</label>
                          <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select employee" />
                            </SelectTrigger>
                            <SelectContent>
                              {employees.map((emp: any) => (
                                <SelectItem key={emp.id} value={emp.id.toString()}>
                                  {emp.firstName} {emp.lastName} ({emp.employeeId})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Year</label>
                          <Select value={selectedYear} onValueChange={setSelectedYear}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select year" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 5 }, (_, i) => currentYear - i).map(year => (
                                <SelectItem key={year} value={year.toString()}>
                                  {year}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-end">
                          <Button 
                            onClick={() => handleExportReport('salary')} 
                            className="w-full gap-2"
                            disabled={!selectedEmployeeId}
                          >
                            <Download className="h-4 w-4" />
                            Export PDF
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Salary Statement */}
                  {selectedEmployeeId && salaryData ? (
                    <div className="space-y-4">
                      {/* Employee Info Card */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Salary Statement - {selectedYear}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid gap-4 md:grid-cols-3">
                            <div>
                              <p className="text-sm text-muted-foreground">Employee Name</p>
                              <p className="font-semibold">{salaryData.employeeName}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Monthly Wage</p>
                              <p className="font-semibold">₹{salaryData.monthlyWage?.toLocaleString('en-IN')}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Annual CTC</p>
                              <p className="font-semibold">₹{salaryData.yearlyWage?.toLocaleString('en-IN')}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Monthly Breakdown Table */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Monthly Salary Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Month</TableHead>
                                <TableHead className="text-right">Gross Salary</TableHead>
                                <TableHead className="text-right">Total Deductions</TableHead>
                                <TableHead className="text-right">Net Salary</TableHead>
                                <TableHead>Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {Array.from({ length: 12 }, (_, i) => {
                                const monthName = format(new Date(parseInt(selectedYear), i, 1), 'MMMM');
                                const isPastMonth = new Date(parseInt(selectedYear), i) <= new Date();
                                
                                return (
                                  <TableRow key={i}>
                                    <TableCell className="font-medium">{monthName}</TableCell>
                                    <TableCell className="text-right text-green-600">
                                      ₹{salaryData.grossSalary?.toLocaleString('en-IN')}
                                    </TableCell>
                                    <TableCell className="text-right text-red-600">
                                      -₹{salaryData.totalDeductions?.toLocaleString('en-IN')}
                                    </TableCell>
                                    <TableCell className="text-right font-semibold">
                                      ₹{salaryData.netSalary?.toLocaleString('en-IN')}
                                    </TableCell>
                                    <TableCell>
                                      {isPastMonth ? (
                                        <Badge className="bg-green-500">Paid</Badge>
                                      ) : (
                                        <Badge variant="secondary">Pending</Badge>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                              <TableRow className="font-semibold bg-muted/50">
                                <TableCell>TOTAL (Annual)</TableCell>
                                <TableCell className="text-right text-green-600">
                                  ₹{((salaryData.grossSalary || 0) * 12).toLocaleString('en-IN')}
                                </TableCell>
                                <TableCell className="text-right text-red-600">
                                  -₹{((salaryData.totalDeductions || 0) * 12).toLocaleString('en-IN')}
                                </TableCell>
                                <TableCell className="text-right">
                                  ₹{((salaryData.netSalary || 0) * 12).toLocaleString('en-IN')}
                                </TableCell>
                                <TableCell></TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>

                      {/* Salary Components Breakdown */}
                      <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg text-green-600">Earnings</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Component</TableHead>
                                  <TableHead className="text-right">Monthly</TableHead>
                                  <TableHead className="text-right">Annual</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {salaryData.earnings?.map((earning: any) => (
                                  <TableRow key={earning.code}>
                                    <TableCell>
                                      {earning.name}
                                      {earning.percentage && (
                                        <span className="text-xs text-muted-foreground ml-2">
                                          ({earning.percentage}%)
                                        </span>
                                      )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      ₹{earning.amount?.toLocaleString('en-IN')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      ₹{(earning.amount * 12)?.toLocaleString('en-IN')}
                                    </TableCell>
                                  </TableRow>
                                ))}
                                <TableRow className="font-semibold">
                                  <TableCell>Total Earnings</TableCell>
                                  <TableCell className="text-right">
                                    ₹{salaryData.grossSalary?.toLocaleString('en-IN')}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    ₹{((salaryData.grossSalary || 0) * 12)?.toLocaleString('en-IN')}
                                  </TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg text-red-600">Deductions</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Component</TableHead>
                                  <TableHead className="text-right">Monthly</TableHead>
                                  <TableHead className="text-right">Annual</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {salaryData.deductions
                                  ?.filter((d: any) => !d.code?.includes('EMPLOYER'))
                                  .map((deduction: any) => (
                                    <TableRow key={deduction.code}>
                                      <TableCell>
                                        {deduction.name}
                                        {deduction.percentage && (
                                          <span className="text-xs text-muted-foreground ml-2">
                                            ({deduction.percentage}%)
                                          </span>
                                        )}
                                      </TableCell>
                                      <TableCell className="text-right">
                                        ₹{deduction.amount?.toLocaleString('en-IN')}
                                      </TableCell>
                                      <TableCell className="text-right">
                                        ₹{(deduction.amount * 12)?.toLocaleString('en-IN')}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                <TableRow className="font-semibold">
                                  <TableCell>Total Deductions</TableCell>
                                  <TableCell className="text-right">
                                    ₹{salaryData.totalDeductions?.toLocaleString('en-IN')}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    ₹{((salaryData.totalDeductions || 0) * 12)?.toLocaleString('en-IN')}
                                  </TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Summary Card */}
                      <Card className="border-primary">
                        <CardHeader>
                          <CardTitle className="text-lg">Net Salary Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid gap-4 md:grid-cols-3">
                            <div className="p-4 bg-green-50 rounded-lg">
                              <p className="text-sm text-green-700 mb-1">Monthly Take Home</p>
                              <p className="text-2xl font-bold text-green-700">
                                ₹{salaryData.netSalary?.toLocaleString('en-IN')}
                              </p>
                            </div>
                            <div className="p-4 bg-blue-50 rounded-lg">
                              <p className="text-sm text-blue-700 mb-1">Annual Take Home</p>
                              <p className="text-2xl font-bold text-blue-700">
                                ₹{((salaryData.netSalary || 0) * 12)?.toLocaleString('en-IN')}
                              </p>
                            </div>
                            <div className="p-4 bg-purple-50 rounded-lg">
                              <p className="text-sm text-purple-700 mb-1">Employer Contribution</p>
                              <p className="text-2xl font-bold text-purple-700">
                                ₹{salaryData.employerContributions?.toLocaleString('en-IN')}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16">
                      <DollarSign className="mb-4 h-16 w-16 text-muted-foreground" />
                      <h3 className="mb-2 text-xl font-semibold">Salary Statement Report</h3>
                      <p className="text-center text-muted-foreground">
                        Select an employee and year to view detailed salary statement.<br />
                        Including monthly breakdown, earnings, deductions, and net salary.
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
