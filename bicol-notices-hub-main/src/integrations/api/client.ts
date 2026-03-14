const API_BASE_URL = 'http://localhost:3001/api';

// Helper to get token from localStorage
const getToken = () => localStorage.getItem('token');

const apiClient = {
  // Generic request method
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = getToken();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  },

  // Auth endpoints
  auth: {
    login: (email: string, password: string) =>
      apiClient.request<{ token: string; user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),

    register: (email: string, password: string, fullName: string, role: string) =>
      apiClient.request<{ token: string; user: any }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, fullName, role }),
      }),

    logout: () =>
      apiClient.request<{ message: string }>('/auth/logout', {
        method: 'POST',
      }),

    me: () => apiClient.request<any>('/auth/me'),
  },

  // Profiles endpoints
  profiles: {
    get: (userId: string) => apiClient.request<any>(`/profiles/${userId}`),
    update: (userId: string, data: any) =>
      apiClient.request<any>(`/profiles/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },

  // Departments endpoints
  departments: {
    list: () => apiClient.request<any[]>('/departments'),
  },

  // Programs endpoints
  programs: {
    list: () => apiClient.request<any[]>('/programs'),
  },

  // Notices endpoints
  notices: {
    list: (params?: { category?: string; priority?: string; department_id?: string; author_id?: string; status?: string }) => {
      const query = params ? '?' + new URLSearchParams(params as any).toString() : '';
      return apiClient.request<any[]>(`/notices${query}`);
    },
    get: (id: number) => apiClient.request<any>(`/notices/${id}`),
    create: (data: any) =>
      apiClient.request<any>('/notices', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: any) =>
      apiClient.request<any>(`/notices/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      apiClient.request<any>(`/notices/${id}`, {
        method: 'DELETE',
      }),
  },

  // Notice reads endpoints
  noticeReads: {
    markAsRead: (noticeId: number) =>
      apiClient.request<any>('/notice-reads', {
        method: 'POST',
        body: JSON.stringify({ notice_id: noticeId }),
      }),
    getBulk: (noticeIds: number[]) =>
      apiClient.request<any[]>(`/notice-reads/bulk?notice_ids=${noticeIds.join(',')}`),
  },

  // Activity logs endpoints
  activityLogs: {
    list: (params?: { user_id?: string; limit?: number }) => {
      const query = params ? '?' + new URLSearchParams(params as any).toString() : '';
      return apiClient.request<any[]>(`/activity-logs${query}`);
    },
  },

  // Users endpoints (admin)
  users: {
    list: () => apiClient.request<any[]>('/users'),
    update: (userId: string, data: any) =>
      apiClient.request<any>(`/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },

  // Stats endpoints
  stats: {
    get: () => apiClient.request<any>('/stats'),
  },
};

export default apiClient;

