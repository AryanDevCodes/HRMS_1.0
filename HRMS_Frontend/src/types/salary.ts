export interface SalaryComponent {
  name: string;
  code: string;
  type: 'EARNING' | 'DEDUCTION';
  amount: number;
  percentage?: number;
  isTaxable: boolean;
  description?: string;
}

export interface SalaryBreakdown {
  employeeId: number;
  employeeName: string;
  monthlyWage: number;
  yearlyWage: number;
  earnings: SalaryComponent[];
  deductions: SalaryComponent[];
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
  employerContributions: number;
}
