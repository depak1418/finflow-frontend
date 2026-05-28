import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

// Attach JWT token to every request automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If token expired → kick to login
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────
export const login    = (data) => API.post('/auth/login',    data);
export const register = (data) => API.post('/auth/register', data);

// ── Transactions ──────────────────────────────────────
export const getTransactions    = (page = 0, size = 10) =>
  API.get(`/transactions?page=${page}&size=${size}`);
export const createTransaction  = (data) => API.post('/transactions', data);
export const updateTransaction  = (id, data) => API.put(`/transactions/${id}`, data);
export const deleteTransaction  = (id) => API.delete(`/transactions/${id}`);

// ── Categories ────────────────────────────────────────
export const getCategories = () => API.get('/categories');

// ── Budgets ───────────────────────────────────────────
export const getBudgets          = (month, year) =>
  API.get(`/budgets?month=${month}&year=${year}`);
export const createOrUpdateBudget = (data) => API.post('/budgets', data);

// ── Dashboard ─────────────────────────────────────────
export const getDashboard = (month, year) =>
  API.get(`/dashboard?month=${month}&year=${year}`);

// ── Notifications ─────────────────────────────────────
export const getNotifications = () => API.get('/notifications');
export const markNotificationRead = (id) => API.put(`/notifications/${id}/read`);