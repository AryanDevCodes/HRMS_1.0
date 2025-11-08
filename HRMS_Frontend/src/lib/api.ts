// API Configuration and Base Setup
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';

// Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  isFirstLogin?: boolean;
  user: UserInfo;
}

export interface UserInfo {
  id: number;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string | null;
  designation: string | null;
  companyLogo?: string | null; // URL to company logo
}

export interface Employee {
  id: number;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  city?: string;
  state?: string;
  pincode?: string;
  dateOfJoining: string;
  department: string;
  designation: string;
  role: string;
  status: string;
  salary?: number;
  manager?: Employee;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
}

export interface Attendance {
  id: number;
  employee: Employee;
  date: string;
  checkInTime: string;
  checkOutTime: string;
  status: string;
  workHours: number;
  overtimeHours: number;
  remarks: string;
  isLate: boolean;
  lateMinutes: number;
}

export interface LeaveApplication {
  id: number;
  employee: Employee;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: string;
  approvedBy?: Employee;
  approvalDate?: string;
  approvalRemarks?: string;
  isHalfDay: boolean;
}

export interface LeaveType {
  id: number;
  name: string;
  description: string;
  maxDaysAllowed: number;
  isActive: boolean;
  requiresApproval: boolean;
}

export interface LeaveBalance {
  id: number;
  employee: Employee;
  leaveType: LeaveType;
  year: number;
  totalAllocated: number;
  used: number;
  balance: number;
}

export interface Payroll {
  id: number;
  employee: Employee;
  salaryMonth: string;
  basicSalary: number;
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
  providentFund: number;
  professionalTax: number;
  incomeTax: number;
  daysWorked: number;
  daysOnLeave: number;
  overtimeHours: number;
  isProcessed: boolean;
  processedDate?: string;
}

export interface Performance {
  id: number;
  employee: Employee;
  reviewer: Employee;
  reviewPeriodStart: string;
  reviewPeriodEnd: string;
  overallRating: number;
  technicalSkillsRating: number;
  communicationRating: number;
  teamworkRating: number;
  leadershipRating: number;
  strengths: string;
  areasForImprovement: string;
  goals: string;
  reviewerComments: string;
  status: string;
  reviewDate: string;
}

export interface Department {
  id: number;
  name: string;
  description: string;
  manager?: Employee;
  isActive: boolean;
}

export interface Designation {
  id: number;
  name: string;
  description: string;
  level: number;
  isActive: boolean;
}

// API Error Handler
class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Token Management
const getAccessToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

const getRefreshToken = (): string | null => {
  return localStorage.getItem('refreshToken');
};

const setTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  try {
    window.dispatchEvent(new CustomEvent('authTokensUpdated'));
  } catch (e) {
  }
};

const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

// Base API Request Function
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const accessToken = getAccessToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Handle 401 - Try to refresh token
    if (response.status === 401) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        // Retry the request with new token
        headers['Authorization'] = `Bearer ${newToken}`;
        const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...config,
          headers,
        });
        
        if (!retryResponse.ok) {
          throw new ApiError(
            retryResponse.status,
            `API Error: ${retryResponse.statusText}`
          );
        }
        
        return retryResponse.json();
      } else {
        // Refresh failed, logout
        clearTokens();
        window.location.href = '/login';
        throw new ApiError(401, 'Session expired. Please login again.');
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new ApiError(
        response.status,
        error.message || `API Error: ${response.statusText}`,
        error
      );
    }

    // Handle 204 No Content (no attendance for today)
    if (response.status === 204) {
      return null as T;
    }

    return response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Network error. Please check your connection.');
  }
}

// Refresh Access Token
async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${refreshToken}`,
      },
    });

    if (!response.ok) return null;

    const data: AuthResponse = await response.json();
    setTokens(data.accessToken, data.refreshToken);
    return data.accessToken;
  } catch {
    return null;
  }
}

// ==================== Authentication API ====================
export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    setTokens(response.accessToken, response.refreshToken);
    localStorage.setItem('user', JSON.stringify(response.user));
    return response;
  },

  signup: async (formData: FormData): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      body: formData, // Send FormData directly, don't stringify
      // Don't set Content-Type header, browser will set it with boundary for multipart/form-data
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Registration failed' }));
      throw new ApiError(response.status, errorData.message || 'Registration failed');
    }
    
    return response.json();
  },

  logout: () => {
    clearTokens();
    window.location.href = '/login';
  },

  getCurrentUser: (): Promise<UserInfo> => {
    return apiRequest<UserInfo>('/auth/me');
  },

  refreshToken: async (): Promise<AuthResponse> => {
    const refreshToken = getRefreshToken();
    return apiRequest<AuthResponse>('/auth/refresh', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${refreshToken}`,
      },
    });
  },
};

// ==================== Employee API ====================
export const employeeApi = {
  getAll: (params?: { page?: number; size?: number; sortBy?: string; sortDirection?: string }) => {
    const queryParams = new URLSearchParams(params as any).toString();
    return apiRequest<{ content: Employee[]; totalElements: number; totalPages: number }>(
      `/employees${queryParams ? `?${queryParams}` : ''}`
    );
  },

  getById: (id: number): Promise<Employee> => {
    return apiRequest<Employee>(`/employees/${id}`);
  },

  create: (employee: Partial<Employee>): Promise<Employee> => {
    return apiRequest<Employee>('/employees', {
      method: 'POST',
      body: JSON.stringify(employee),
    });
  },

  update: (id: number, employee: Partial<Employee>): Promise<Employee> => {
    return apiRequest<Employee>(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(employee),
    });
  },

  delete: (id: number): Promise<void> => {
    return apiRequest<void>(`/employees/${id}`, {
      method: 'DELETE',
    });
  },

  getProfile: (): Promise<Employee> => {
    return apiRequest<Employee>('/employees/profile');
  },

  updateProfile: (employee: Partial<Employee>): Promise<Employee> => {
    return apiRequest<Employee>('/employees/profile', {
      method: 'PUT',
      body: JSON.stringify(employee),
    });
  },

  search: (keyword: string, page = 0, size = 10) => {
    return apiRequest<{ content: Employee[]; totalElements: number; totalPages: number }>(
      `/employees/search?keyword=${keyword}&page=${page}&size=${size}`
    );
  },

  getByDepartment: (departmentId: number): Promise<Employee[]> => {
    return apiRequest<Employee[]>(`/employees/department/${departmentId}`);
  },

  getByRole: (role: string): Promise<Employee[]> => {
    return apiRequest<Employee[]>(`/employees/role/${role}`);
  },

  getByStatus: (status: string): Promise<Employee[]> => {
    return apiRequest<Employee[]>(`/employees/status/${status}`);
  },

  changeStatus: (id: number, status: string): Promise<Employee> => {
    return apiRequest<Employee>(`/employees/${id}/status?status=${status}`, {
      method: 'PATCH',
    });
  },

  getStatistics: (): Promise<{ totalEmployees: number; activeEmployees: number; inactiveEmployees: number }> => {
    return apiRequest('/employees/statistics');
  },

  resendWelcomeEmail: (id: number): Promise<{ success: boolean; message: string }> => {
    return apiRequest(`/employees/${id}/resend-welcome-email`, {
      method: 'POST',
    });
  },

  resetPassword: (id: number): Promise<{ success: boolean; message: string }> => {
    return apiRequest(`/employees/${id}/reset-password`, {
      method: 'POST',
    });
  },

  activate: (id: number): Promise<{ success: boolean; message: string }> => {
    return apiRequest(`/employees/${id}/activate`, {
      method: 'POST',
    });
  },

  getSalaryStructure: (id: number) => {
    return apiRequest(`/employees/${id}/salary-structure`);
  },
};

// ==================== Attendance API ====================
export const attendanceApi = {
  checkIn: (): Promise<Attendance> => {
    return apiRequest<Attendance>('/attendance/check-in', {
      method: 'POST',
    });
  },

  checkOut: (): Promise<Attendance> => {
    return apiRequest<Attendance>('/attendance/check-out', {
      method: 'PATCH',
    });
  },

  markAttendance: (data: {
    employeeId: number;
    date: string;
    status: string;
    remarks?: string;
  }): Promise<Attendance> => {
    return apiRequest<Attendance>('/attendance/mark', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: (id: number, data: { status: string; remarks?: string }): Promise<Attendance> => {
    return apiRequest<Attendance>(`/attendance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  getById: (id: number): Promise<Attendance> => {
    return apiRequest<Attendance>(`/attendance/${id}`);
  },

  getToday: (): Promise<Attendance> => {
    return apiRequest<Attendance>('/attendance/today');
  },

  getMyAttendance: (startDate: string, endDate: string): Promise<Attendance[]> => {
    return apiRequest<Attendance[]>(
      `/attendance/my-attendance?startDate=${startDate}&endDate=${endDate}`
    );
  },

  getMyMonthlyAttendance: (year: number, month: number): Promise<Attendance[]> => {
    return apiRequest<Attendance[]>(
      `/attendance/my-attendance/month?year=${year}&month=${month}`
    );
  },

  getMyAttendancePaginated: (page = 0, size = 10) => {
    return apiRequest<{ content: Attendance[]; totalElements: number; totalPages: number }>(
      `/attendance/my-attendance/paginated?page=${page}&size=${size}`
    );
  },

  getEmployeeAttendance: (employeeId: number, startDate: string, endDate: string): Promise<Attendance[]> => {
    return apiRequest<Attendance[]>(
      `/attendance/employee/${employeeId}?startDate=${startDate}&endDate=${endDate}`
    );
  },

  getEmployeeMonthlyAttendance: (employeeId: number, year: number, month: number): Promise<Attendance[]> => {
    return apiRequest<Attendance[]>(
      `/attendance/employee/${employeeId}/month?year=${year}&month=${month}`
    );
  },

  getEmployeeStats: (employeeId: number, startDate: string, endDate: string) => {
    return apiRequest<{
      presentDays: number;
      absentDays: number;
      halfDays: number;
      wfhDays: number;
      totalHours: number;
    }>(`/attendance/employee/${employeeId}/stats?startDate=${startDate}&endDate=${endDate}`);
  },

  delete: (id: number): Promise<void> => {
    return apiRequest<void>(`/attendance/${id}`, {
      method: 'DELETE',
    });
  },

  getAllTodayAttendance: (): Promise<Array<{
    employeeId: number;
    employeeCode: string;
    firstName: string;
    lastName: string;
    email: string;
    department: string;
    attendanceStatus: string;
  }>> => {
    return apiRequest('/attendance/today/all');
  },
};

// ==================== Leave Application API ====================
export const leaveApi = {
  apply: (data: {
    leaveTypeId: number;
    startDate: string;
    endDate: string;
    reason: string;
    isHalfDay?: boolean;
  }): Promise<LeaveApplication> => {
    return apiRequest<LeaveApplication>('/leave-applications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  approve: (id: number): Promise<LeaveApplication> => {
    return apiRequest<LeaveApplication>(`/leave-applications/${id}/approve`, {
      method: 'PATCH',
    });
  },

  reject: (id: number, rejectionReason: string): Promise<LeaveApplication> => {
    return apiRequest<LeaveApplication>(`/leave-applications/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ rejectionReason }),
    });
  },

  cancel: (id: number): Promise<LeaveApplication> => {
    return apiRequest<LeaveApplication>(`/leave-applications/${id}/cancel`, {
      method: 'PATCH',
    });
  },

  getById: (id: number): Promise<LeaveApplication> => {
    return apiRequest<LeaveApplication>(`/leave-applications/${id}`);
  },

  getMyLeaves: (): Promise<LeaveApplication[]> => {
    return apiRequest<LeaveApplication[]>('/leave-applications/my-leaves');
  },

  getMyLeavesPaginated: (page = 0, size = 10) => {
    return apiRequest<{ content: LeaveApplication[]; totalElements: number; totalPages: number }>(
      `/leave-applications/my-leaves/paginated?page=${page}&size=${size}`
    );
  },

  getPending: (): Promise<LeaveApplication[]> => {
    return apiRequest<LeaveApplication[]>('/leave-applications/pending');
  },

  getPendingApprovals: (): Promise<LeaveApplication[]> => {
    return apiRequest<LeaveApplication[]>('/leave-applications/pending-approvals');
  },

  getByStatus: (status: string): Promise<LeaveApplication[]> => {
    return apiRequest<LeaveApplication[]>(`/leave-applications/status/${status}`);
  },

  getEmployeeLeaves: (employeeId: number): Promise<LeaveApplication[]> => {
    return apiRequest<LeaveApplication[]>(`/leave-applications/employee/${employeeId}`);
  },

  getAll: (): Promise<LeaveApplication[]> => {
    return apiRequest<LeaveApplication[]>('/leave-applications/all');
  },

  getApproved: (): Promise<LeaveApplication[]> => {
    return apiRequest<LeaveApplication[]>('/leave-applications/approved');
  },

  getRejected: (): Promise<LeaveApplication[]> => {
    return apiRequest<LeaveApplication[]>('/leave-applications/rejected');
  },

  getLogs: (leaveApplicationId: number): Promise<Array<{
    id: number;
    previousStatus: string | null;
    newStatus: string;
    actionType: string;
    remarks: string;
    changedAt: string;
    changedBy: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
    };
  }>> => {
    return apiRequest(`/leave-applications/logs/${leaveApplicationId}`);
  },
};

// ==================== Leave Balance API ====================
export const leaveBalanceApi = {
  create: (data: {
    employeeId: number;
    leaveTypeId: number;
    year: number;
    totalAllocated: number;
  }): Promise<LeaveBalance> => {
    return apiRequest<LeaveBalance>('/leave-balances', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: (id: number, totalAllocated: number): Promise<LeaveBalance> => {
    return apiRequest<LeaveBalance>(`/leave-balances/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ totalAllocated }),
    });
  },

  getById: (id: number): Promise<LeaveBalance> => {
    return apiRequest<LeaveBalance>(`/leave-balances/${id}`);
  },

  getMyBalances: (): Promise<LeaveBalance[]> => {
    return apiRequest<LeaveBalance[]>('/leave-balances/my-balances');
  },

  getEmployeeBalances: (employeeId: number, year: number): Promise<LeaveBalance[]> => {
    return apiRequest<LeaveBalance[]>(`/leave-balances/employee/${employeeId}/year/${year}`);
  },

  getAllEmployeeBalances: (employeeId: number): Promise<LeaveBalance[]> => {
    return apiRequest<LeaveBalance[]>(`/leave-balances/employee/${employeeId}`);
  },

  initializeBalances: (employeeId: number, year: number): Promise<void> => {
    return apiRequest<void>(`/leave-balances/employee/${employeeId}/initialize/${year}`, {
      method: 'POST',
    });
  },

  initializeCurrentYear: (employeeId: number): Promise<void> => {
    return apiRequest<void>(`/leave-balances/employee/${employeeId}/initialize-current-year`, {
      method: 'POST',
    });
  },
};

// ==================== Leave Type API ====================
export const leaveTypeApi = {
  create: (leaveType: Partial<LeaveType>): Promise<LeaveType> => {
    return apiRequest<LeaveType>('/leave-types', {
      method: 'POST',
      body: JSON.stringify(leaveType),
    });
  },

  update: (id: number, leaveType: Partial<LeaveType>): Promise<LeaveType> => {
    return apiRequest<LeaveType>(`/leave-types/${id}`, {
      method: 'PUT',
      body: JSON.stringify(leaveType),
    });
  },

  getById: (id: number): Promise<LeaveType> => {
    return apiRequest<LeaveType>(`/leave-types/${id}`);
  },

  getAll: (): Promise<LeaveType[]> => {
    return apiRequest<LeaveType[]>('/leave-types');
  },

  getActive: (): Promise<LeaveType[]> => {
    return apiRequest<LeaveType[]>('/leave-types/active');
  },

  delete: (id: number): Promise<void> => {
    return apiRequest<void>(`/leave-types/${id}`, {
      method: 'DELETE',
    });
  },

  deactivate: (id: number): Promise<void> => {
    return apiRequest<void>(`/leave-types/${id}/deactivate`, {
      method: 'PATCH',
    });
  },
};

// ==================== Payroll API ====================
export const payrollApi = {
  generate: (data: {
    employeeId: number;
    payPeriodStart: string;
    payPeriodEnd: string;
  }): Promise<Payroll> => {
    return apiRequest<Payroll>('/payroll/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: (id: number, payroll: Partial<Payroll>): Promise<Payroll> => {
    return apiRequest<Payroll>(`/payroll/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payroll),
    });
  },

  getById: (id: number): Promise<Payroll> => {
    return apiRequest<Payroll>(`/payroll/${id}`);
  },

  getMyPayrolls: (): Promise<Payroll[]> => {
    return apiRequest<Payroll[]>('/payroll/my-payrolls');
  },

  getMyPayrollsPaginated: (page = 0, size = 10) => {
    return apiRequest<{ content: Payroll[]; totalElements: number; totalPages: number }>(
      `/payroll/my-payrolls/paginated?page=${page}&size=${size}`
    );
  },

  getMyPayrollForPeriod: (startDate: string, endDate: string): Promise<Payroll[]> => {
    return apiRequest<Payroll[]>(
      `/payroll/my-payrolls/period?startDate=${startDate}&endDate=${endDate}`
    );
  },

  getEmployeePayrolls: (employeeId: number): Promise<Payroll[]> => {
    return apiRequest<Payroll[]>(`/payroll/employee/${employeeId}`);
  },

  getEmployeePayrollForYear: (employeeId: number, year: number): Promise<Payroll[]> => {
    return apiRequest<Payroll[]>(`/payroll/employee/${employeeId}/year?year=${year}`);
  },

  getForPeriod: (startDate: string, endDate: string): Promise<Payroll[]> => {
    return apiRequest<Payroll[]>(`/payroll/period?startDate=${startDate}&endDate=${endDate}`);
  },

  getByYear: (year: number): Promise<Payroll[]> => {
    return apiRequest<Payroll[]>(`/payroll/year/${year}`);
  },

  delete: (id: number): Promise<void> => {
    return apiRequest<void>(`/payroll/${id}`, {
      method: 'DELETE',
    });
  },

  generatePayrun: (month: number, year: number): Promise<{
    success: boolean;
    message: string;
    totalEmployees: number;
    successCount: number;
    failureCount: number;
  }> => {
    return apiRequest('/payroll/generate-payrun', {
      method: 'POST',
      body: JSON.stringify({ month, year }),
    });
  },

  exportPayroll: (month: number, year: number): Promise<Blob> => {
    const accessToken = getAccessToken();
    return fetch(`${API_BASE_URL}/payroll/export?month=${month}&year=${year}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }).then(response => {
      if (!response.ok) {
        throw new Error('Failed to export payroll');
      }
      return response.blob();
    });
  },
};

// ==================== Performance API ====================
export const performanceApi = {
  create: (performance: Partial<Performance>): Promise<Performance> => {
    return apiRequest<Performance>('/performance', {
      method: 'POST',
      body: JSON.stringify(performance),
    });
  },

  update: (id: number, performance: Partial<Performance>): Promise<Performance> => {
    return apiRequest<Performance>(`/performance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(performance),
    });
  },

  getById: (id: number): Promise<Performance> => {
    return apiRequest<Performance>(`/performance/${id}`);
  },

  getMyReviews: (): Promise<Performance[]> => {
    return apiRequest<Performance[]>('/performance/my-reviews');
  },

  getMyReviewsPaginated: (page = 0, size = 10) => {
    return apiRequest<{ content: Performance[]; totalElements: number; totalPages: number }>(
      `/performance/my-reviews/paginated?page=${page}&size=${size}`
    );
  },

  getMyReviewsByYear: (year: number): Promise<Performance[]> => {
    return apiRequest<Performance[]>(`/performance/my-reviews/year?year=${year}`);
  },

  getEmployeeReviews: (employeeId: number): Promise<Performance[]> => {
    return apiRequest<Performance[]>(`/performance/employee/${employeeId}`);
  },

  getEmployeeReviewsByYear: (employeeId: number, year: number): Promise<Performance[]> => {
    return apiRequest<Performance[]>(`/performance/employee/${employeeId}/year?year=${year}`);
  },

  getAverageRating: (employeeId: number): Promise<{ averageRating: number }> => {
    return apiRequest<{ averageRating: number }>(`/performance/employee/${employeeId}/average-rating`);
  },

  getReviewedByMe: (): Promise<Performance[]> => {
    return apiRequest<Performance[]>('/performance/reviewed-by-me');
  },

  getByYear: (year: number): Promise<Performance[]> => {
    return apiRequest<Performance[]>(`/performance/year/${year}`);
  },

  getByPeriod: (startDate: string, endDate: string): Promise<Performance[]> => {
    return apiRequest<Performance[]>(
      `/performance/period?startDate=${startDate}&endDate=${endDate}`
    );
  },

  delete: (id: number): Promise<void> => {
    return apiRequest<void>(`/performance/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== Department API ====================
export const departmentApi = {
  create: (department: Partial<Department>): Promise<Department> => {
    return apiRequest<Department>('/departments', {
      method: 'POST',
      body: JSON.stringify(department),
    });
  },

  update: (id: number, department: Partial<Department>): Promise<Department> => {
    return apiRequest<Department>(`/departments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(department),
    });
  },

  getById: (id: number): Promise<Department> => {
    return apiRequest<Department>(`/departments/${id}`);
  },

  getByIdWithManager: (id: number): Promise<Department> => {
    return apiRequest<Department>(`/departments/${id}/with-manager`);
  },

  getAll: (): Promise<Department[]> => {
    return apiRequest<Department[]>('/departments');
  },

  getActive: (): Promise<Department[]> => {
    return apiRequest<Department[]>('/departments/active');
  },

  delete: (id: number): Promise<void> => {
    return apiRequest<void>(`/departments/${id}`, {
      method: 'DELETE',
    });
  },

  deactivate: (id: number): Promise<void> => {
    return apiRequest<void>(`/departments/${id}/deactivate`, {
      method: 'PATCH',
    });
  },
};

// ==================== Designation API ====================
export const designationApi = {
  create: (designation: Partial<Designation>): Promise<Designation> => {
    return apiRequest<Designation>('/designations', {
      method: 'POST',
      body: JSON.stringify(designation),
    });
  },

  update: (id: number, designation: Partial<Designation>): Promise<Designation> => {
    return apiRequest<Designation>(`/designations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(designation),
    });
  },

  getById: (id: number): Promise<Designation> => {
    return apiRequest<Designation>(`/designations/${id}`);
  },

  getAll: (): Promise<Designation[]> => {
    return apiRequest<Designation[]>('/designations');
  },

  getActive: (): Promise<Designation[]> => {
    return apiRequest<Designation[]>('/designations/active');
  },

  getActiveOrdered: (): Promise<Designation[]> => {
    return apiRequest<Designation[]>('/designations/active/ordered');
  },

  delete: (id: number): Promise<void> => {
    return apiRequest<void>(`/designations/${id}`, {
      method: 'DELETE',
    });
  },

  deactivate: (id: number): Promise<void> => {
    return apiRequest<void>(`/designations/${id}/deactivate`, {
      method: 'PATCH',
    });
  },
};

// Export utility functions
export { getAccessToken, getRefreshToken, setTokens, clearTokens, ApiError };
