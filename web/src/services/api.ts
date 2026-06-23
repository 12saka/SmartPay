const API_BASE = 'http://localhost:5000/api';

// Helper to get headers with JWT token
function getHeaders() {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export const authService = {
  login: async (credentials: any) => {
    const data = await request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },
  register: async (userData: any) => {
    const data = await request<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    }
  },
  getCurrentUser: () => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          return JSON.parse(userStr);
        } catch (e) {
          console.error('Failed to parse user', e);
          localStorage.removeItem('user');
        }
      }
      return null;
    }
    return null;
  },
  getMe: async () => {
    return request<any>('/auth/me');
  }
};

export const employeeService = {
  getAll: async (params: { branchId?: number; status?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.branchId) query.append('branchId', params.branchId.toString());
    if (params.status) query.append('status', params.status);
    return request<any[]>(`/employees?${query.toString()}`);
  },
  getById: async (id: number) => {
    return request<any>(`/employees/${id}`);
  },
  create: async (employeeData: any) => {
    return request<any>('/employees', {
      method: 'POST',
      body: JSON.stringify(employeeData),
    });
  },
  update: async (id: number, employeeData: any) => {
    return request<any>(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(employeeData),
    });
  },
  toggleStatus: async (id: number, status: string) => {
    return request<any>(`/employees/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }
};

export const advanceService = {
  getAll: async (params: { status?: string; employeeId?: number } = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.employeeId) query.append('employeeId', params.employeeId.toString());
    return request<any[]>(`/advances?${query.toString()}`);
  },
  request: async (advanceData: { employeeId: number; amount: number; repaymentPeriod?: number }) => {
    return request<any>('/advances', {
      method: 'POST',
      body: JSON.stringify(advanceData),
    });
  },
  approve: async (id: number, status: 'APPROVED' | 'REJECTED') => {
    return request<any>(`/advances/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }
};

export const payrollService = {
  getAll: async (params: { month?: string; branchId?: number; status?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.month) query.append('month', params.month);
    if (params.branchId) query.append('branchId', params.branchId.toString());
    if (params.status) query.append('status', params.status);
    return request<any[]>(`/payroll?${query.toString()}`);
  },
  generateDraft: async (month: string, branchId?: number) => {
    return request<any>('/payroll/draft', {
      method: 'POST',
      body: JSON.stringify({ month, branchId }),
    });
  },
  updateRun: async (id: number, updateData: any) => {
    return request<any>(`/payroll/run/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  },
  updatePeriodStatus: async (month: string, action: 'HR_APPROVE' | 'FINANCE_APPROVE' | 'COMPANY_APPROVE' | 'RESET', branchId?: number) => {
    return request<any>('/payroll/period-status', {
      method: 'PUT',
      body: JSON.stringify({ month, action, branchId }),
    });
  },
  executeBulk: async (month: string, paymentMethod?: string, branchId?: number) => {
    return request<any>('/payroll/pay-bulk', {
      method: 'POST',
      body: JSON.stringify({ month, paymentMethod, branchId }),
    });
  }
};

export const branchService = {
  getAll: async () => {
    return request<any[]>('/branches');
  },
  create: async (branchData: { name: string; location?: string }) => {
    return request<any>('/branches', {
      method: 'POST',
      body: JSON.stringify(branchData),
    });
  }
};

export const reportService = {
  getStats: async (params: { month?: string; branchId?: number } = {}) => {
    const query = new URLSearchParams();
    if (params.month) query.append('month', params.month);
    if (params.branchId) query.append('branchId', params.branchId.toString());
    return request<any>(`/reports/stats?${query.toString()}`);
  },
  getTrends: async (params: { branchId?: number } = {}) => {
    const query = new URLSearchParams();
    if (params.branchId) query.append('branchId', params.branchId.toString());
    return request<any[]>(`/reports/trends?${query.toString()}`);
  },
  getDepartments: async (params: { month?: string; branchId?: number } = {}) => {
    const query = new URLSearchParams();
    if (params.month) query.append('month', params.month);
    if (params.branchId) query.append('branchId', params.branchId.toString());
    return request<any>(`/reports/departments?${query.toString()}`);
  }
};

export const walletService = {
  getBalances: async () => {
    return request<any[]>('/wallet/balances');
  },
  getTransactions: async () => {
    return request<any[]>('/wallet/transactions');
  },
  fundWallet: async (data: { walletType: string; amount: number; reference: string }) => {
    return request<any>('/wallet/fund', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
};

export const auditService = {
  getAll: async (params: { search?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    return request<any[]>(`/audits?${query.toString()}`);
  }
};

export const notificationService = {
  getAll: async (params: { category?: string } = {}) => {
    const query = new URLSearchParams();
    if (params.category) query.append('category', params.category);
    return request<any[]>(`/notifications?${query.toString()}`);
  },
  markRead: async (id: number) => {
    return request<any>(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  },
  markAllRead: async () => {
    return request<any>('/notifications/read-all', {
      method: 'PUT',
    });
  }
};
