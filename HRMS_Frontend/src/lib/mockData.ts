import { Employee, LeaveRequest, AttendanceRecord, DashboardStats } from '@/types/employee';

// Mock data for development
// TODO: Replace with real API calls

export const mockEmployees: Employee[] = [
  {
    id: '1',
    employeeId: 'EMP001',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@company.com',
    phone: '+1 234 567 8900',
    department: 'Engineering',
    position: 'Senior Developer',
    joinDate: '2022-01-15',
    status: 'active',
    manager: 'Sarah Johnson',
    salary: 85000,
  },
  {
    id: '2',
    employeeId: 'EMP002',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@company.com',
    phone: '+1 234 567 8901',
    department: 'Marketing',
    position: 'Marketing Manager',
    joinDate: '2021-06-20',
    status: 'active',
    manager: 'Michael Brown',
    salary: 75000,
  },
  {
    id: '3',
    employeeId: 'EMP003',
    firstName: 'Michael',
    lastName: 'Brown',
    email: 'michael.brown@company.com',
    phone: '+1 234 567 8902',
    department: 'Human Resources',
    position: 'HR Director',
    joinDate: '2020-03-10',
    status: 'active',
    salary: 95000,
  },
  {
    id: '4',
    employeeId: 'EMP004',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@company.com',
    phone: '+1 234 567 8903',
    department: 'Engineering',
    position: 'Engineering Manager',
    joinDate: '2019-11-05',
    status: 'active',
    salary: 105000,
  },
  {
    id: '5',
    employeeId: 'EMP005',
    firstName: 'David',
    lastName: 'Wilson',
    email: 'david.wilson@company.com',
    phone: '+1 234 567 8904',
    department: 'Sales',
    position: 'Sales Representative',
    joinDate: '2023-02-14',
    status: 'on-leave',
    manager: 'Lisa Anderson',
    salary: 65000,
  },
];

export const mockLeaveRequests: LeaveRequest[] = [
  {
    id: '1',
    employeeId: 'EMP005',
    employeeName: 'David Wilson',
    leaveType: 'sick',
    startDate: '2024-01-20',
    endDate: '2024-01-22',
    days: 3,
    reason: 'Medical checkup',
    status: 'pending',
    appliedDate: '2024-01-15',
  },
  {
    id: '2',
    employeeId: 'EMP001',
    employeeName: 'John Doe',
    leaveType: 'annual',
    startDate: '2024-02-10',
    endDate: '2024-02-15',
    days: 5,
    reason: 'Family vacation',
    status: 'approved',
    appliedDate: '2024-01-10',
  },
  {
    id: '3',
    employeeId: 'EMP002',
    employeeName: 'Jane Smith',
    leaveType: 'casual',
    startDate: '2024-01-25',
    endDate: '2024-01-25',
    days: 1,
    reason: 'Personal work',
    status: 'pending',
    appliedDate: '2024-01-18',
  },
];

export const mockAttendance: AttendanceRecord[] = [
  {
    id: '1',
    employeeId: 'EMP001',
    employeeName: 'John Doe',
    date: '2024-01-19',
    checkIn: '09:00 AM',
    checkOut: '06:00 PM',
    status: 'present',
    workHours: 9,
  },
  {
    id: '2',
    employeeId: 'EMP002',
    employeeName: 'Jane Smith',
    date: '2024-01-19',
    checkIn: '09:15 AM',
    checkOut: '06:15 PM',
    status: 'late',
    workHours: 9,
  },
  {
    id: '3',
    employeeId: 'EMP003',
    employeeName: 'Michael Brown',
    date: '2024-01-19',
    checkIn: '08:45 AM',
    checkOut: '05:45 PM',
    status: 'present',
    workHours: 9,
  },
  {
    id: '4',
    employeeId: 'EMP004',
    employeeName: 'Sarah Johnson',
    date: '2024-01-19',
    checkIn: '09:00 AM',
    checkOut: '06:00 PM',
    status: 'present',
    workHours: 9,
  },
  {
    id: '5',
    employeeId: 'EMP005',
    employeeName: 'David Wilson',
    date: '2024-01-19',
    checkIn: '-',
    checkOut: '-',
    status: 'absent',
    workHours: 0,
  },
];

export const mockDashboardStats: DashboardStats = {
  totalEmployees: 125,
  presentToday: 118,
  onLeave: 5,
  pendingRequests: 8,
};

// API placeholder functions for future implementation
export const api = {
  // TODO: Implement real API calls
  employees: {
    getAll: async (): Promise<Employee[]> => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockEmployees;
    },
    getById: async (id: string): Promise<Employee | undefined> => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockEmployees.find(emp => emp.id === id);
    },
    create: async (employee: Omit<Employee, 'id'>): Promise<Employee> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      const newEmployee = { ...employee, id: Date.now().toString() };
      return newEmployee;
    },
    update: async (id: string, employee: Partial<Employee>): Promise<Employee> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      const existing = mockEmployees.find(emp => emp.id === id);
      return { ...existing!, ...employee };
    },
    delete: async (id: string): Promise<void> => {
      await new Promise(resolve => setTimeout(resolve, 500));
    },
  },
  
  leave: {
    getAll: async (): Promise<LeaveRequest[]> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockLeaveRequests;
    },
    approve: async (id: string): Promise<LeaveRequest> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      const request = mockLeaveRequests.find(req => req.id === id);
      return { ...request!, status: 'approved' };
    },
    reject: async (id: string): Promise<LeaveRequest> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      const request = mockLeaveRequests.find(req => req.id === id);
      return { ...request!, status: 'rejected' };
    },
  },
  
  attendance: {
    getAll: async (date?: string): Promise<AttendanceRecord[]> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockAttendance;
    },
    markAttendance: async (employeeId: string, status: string): Promise<AttendanceRecord> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockAttendance[0];
    },
  },
  
  dashboard: {
    getStats: async (): Promise<DashboardStats> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockDashboardStats;
    },
  },
};
