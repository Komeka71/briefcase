import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to add auth token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('briefcase_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const dashboardService = {
  getSummary: () => api.get('/dashboard')
};

export const clientService = {
  getAll: (format = '') => api.get(`/clients${format ? `?format=${format}` : ''}`),
  getPaginated: (page = 1, pageSize = 5, search = '') =>
    api.get(`/clients/paginated?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(search)}`),
  getCursor: (limit = null) =>
    api.get(`/clients/cursor${limit ? `?limit=${limit}` : ''}`),
  getById: (id) => api.get(`/clients/${id}`),
  create: (data) => api.post('/clients', data),
  update: (id, data) => api.put(`/clients/${id}`, data),
  delete: (id) => api.delete(`/clients/${id}`)
};

export const caseService = {
  getAll: (params = {}) => api.get('/cases', { params }),
  getReferenceData: () => api.get('/cases/reference-data'),
  getById: (id) => api.get(`/cases/${id}`),
  create: (data) => api.post('/cases', data),
  update: (id, data) => api.put(`/cases/${id}`, data),
  delete: (id) => api.delete(`/cases/${id}`)
};

export const lawyerService = {
  getAll: () => api.get('/lawyers'),
  getDepartments: () => api.get('/lawyers/departments'),
  create: (data) => api.post('/lawyers', data),
  update: (id, data) => api.put(`/lawyers/${id}`, data),
  delete: (id) => api.delete(`/lawyers/${id}`)
};

export const hearingService = {
  getAll: () => api.get('/hearings'),
  create: (data) => api.post('/hearings', data),
  update: (id, data) => api.put(`/hearings/${id}`, data),
  delete: (id) => api.delete(`/hearings/${id}`)
};

export const reportService = {
  getQuery1: (format = '') => api.get(`/reports/query1-clients${format ? `?format=${format}` : ''}`),
  postQuery2: (data) => api.post('/reports/query2-insert-integrity', data),
  getQuery3: (func, column = 'budget', table = 'CASES', format = '') =>
    api.get(`/reports/query3-aggregate?func=${func}&column=${column}&table=${table}${format ? `&format=${format}` : ''}`),
  getQuery4: (column, operator, value, format = '') =>
    api.get(`/reports/query4-conditional?column=${column}&operator=${encodeURIComponent(operator)}&value=${encodeURIComponent(value)}${format ? `&format=${format}` : ''}`),
  getQuery5: (table1, table2, joinType) =>
    api.get(`/reports/query5-join?table1=${table1}&table2=${table2}&joinType=${joinType}`),
  getQuery6: (minBudget = 300000) =>
    api.get(`/reports/query6-subquery?minBudget=${minBudget}`),
  getQuery7: () => api.get('/reports/query7-correlated'),
  putQuery8: (data) => api.put('/reports/query8-update-integrity', data),
  getViewData: (view = 'vw_client_cases') => api.get(`/reports/views?view=${view}`)
};

export const auditService = {
  getLogs: (page = 1, pageSize = 15, table = '', operation = '') =>
    api.get(`/audit?page=${page}&pageSize=${pageSize}&table=${table}&operation=${operation}`),
  getStats: () => api.get('/audit/stats')
};

export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  getAllUsers: () => api.get('/auth/users'),
  deleteUser: (id) => api.delete(`/auth/users/${id}`)
};

export default api;
