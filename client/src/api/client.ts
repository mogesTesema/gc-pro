import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — add JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth API ──────────────────────────────────────────────
export const authAPI = {
  register: (data: any) => apiClient.post('/auth/register', data),
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),
  getMe: () => apiClient.get('/auth/me'),
  changePassword: (data: any) => apiClient.put('/auth/change-password', data),
};

// ─── Profile API ───────────────────────────────────────────
export const profileAPI = {
  getMe: () => apiClient.get('/profiles/me'),
  updateMe: (data: any) => apiClient.put('/profiles/me', data),
  getCreators: (params?: any) => apiClient.get('/profiles/creators', { params }),
  getById: (userId: string) => apiClient.get(`/profiles/${userId}`),
};

// ─── Campaign API ──────────────────────────────────────────
export const campaignAPI = {
  getAll: (params?: any) => apiClient.get('/campaigns', { params }),
  getById: (id: string) => apiClient.get(`/campaigns/${id}`),
  getMy: () => apiClient.get('/campaigns/my'),
  create: (data: any) => apiClient.post('/campaigns', data),
  update: (id: string, data: any) => apiClient.put(`/campaigns/${id}`, data),
  delete: (id: string) => apiClient.delete(`/campaigns/${id}`),
  toggleBookmark: (id: string) => apiClient.post(`/campaigns/${id}/bookmark`),
  getAnalytics: (id: string) => apiClient.get(`/campaigns/${id}/analytics`),
};

// ─── Application API ───────────────────────────────────────
export const applicationAPI = {
  apply: (data: any) => apiClient.post('/applications', data),
  getMy: () => apiClient.get('/applications/my'),
  getCampaignApps: (campaignId: string) =>
    apiClient.get(`/applications/campaign/${campaignId}`),
  accept: (id: string) => apiClient.put(`/applications/${id}/accept`),
  reject: (id: string) => apiClient.put(`/applications/${id}/reject`),
  markComplete: (id: string) => apiClient.put(`/applications/${id}/complete`),
};

// ─── Chat API ──────────────────────────────────────────────
export const chatAPI = {
  getMy: () => apiClient.get('/chats'),
  getById: (id: string) => apiClient.get(`/chats/${id}`),
  getMessages: (chatId: string, params?: any) =>
    apiClient.get(`/chats/${chatId}/messages`, { params }),
  sendMessage: (chatId: string, data: any) =>
    apiClient.post(`/chats/${chatId}/messages`, data),
};

// ─── Ratings API ───────────────────────────────────────────
export const ratingsAPI = {
  submit: (data: any) => apiClient.post('/ratings', data),
  getUser: (userId: string) => apiClient.get(`/ratings/${userId}`),
};

// ─── Notifications API ─────────────────────────────────────
export const notificationsAPI = {
  getAll: (params?: any) => apiClient.get('/notifications', { params }),
  markAllRead: () => apiClient.put('/notifications/read-all'),
  markRead: (id: string) => apiClient.put(`/notifications/${id}/read`),
};

// ─── Coins API ─────────────────────────────────────────────
export const coinsAPI = {
  getBalance: () => apiClient.get('/coins/balance'),
  getTransactions: () => apiClient.get('/coins/transactions'),
  request: (data: any) => apiClient.post('/coins/request', data),
};

// ─── Admin API ─────────────────────────────────────────────
export const adminAPI = {
  getDashboardStats: () => apiClient.get('/admin/stats'),
  getPendingProfiles: () => apiClient.get('/admin/pending-profiles'),
  approveProfile: (userId: string) =>
    apiClient.put(`/admin/profiles/${userId}/approve`),
  rejectProfile: (userId: string, data: any) =>
    apiClient.put(`/admin/profiles/${userId}/reject`, data),
  addCoins: (userId: string, data: any) =>
    apiClient.post(`/admin/coins/${userId}`, data),
  getAllUsers: (params?: any) => apiClient.get('/admin/users', { params }),
  toggleUserStatus: (userId: string) =>
    apiClient.put(`/admin/users/${userId}/toggle`),
};

// ─── AI API ───────────────────────────────────────────────
export const aiAPI = {
  getRecommendations: (data: any) => apiClient.post('/ai/recommend', data),
  analyzeCreator: (creatorId: string) =>
    apiClient.post(`/ai/analyze/${creatorId}`),
};

// ─── SuperAdmin API ───────────────────────────────────────
export const superAdminAPI = {
  getStats: () => apiClient.get('/superadmin/stats'),
  getAdmins: () => apiClient.get('/superadmin/admins'),
  createAdmin: (data: any) => apiClient.post('/superadmin/admins', data),
  updateAdmin: (id: string, data: any) => apiClient.put(`/superadmin/admins/${id}`, data),
  deleteAdmin: (id: string) => apiClient.delete(`/superadmin/admins/${id}`),
  getActivityLogs: (params?: any) => apiClient.get('/superadmin/activity-logs', { params }),
  getDisputes: (params?: any) => apiClient.get('/superadmin/disputes', { params }),
  createDispute: (data: any) => apiClient.post('/superadmin/disputes', data),
  resolveDispute: (id: string, data: any) => apiClient.put(`/superadmin/disputes/${id}/resolve`, data),
};

export default apiClient;
