import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle session expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      const currentPath = window.location.pathname;
      if (currentPath !== '/login') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// -------------------------------------------------------------
// API Services
// -------------------------------------------------------------

export const authService = {
  login: (credentials) => api.post('/admin/login', credentials),
  getMe: () => api.get('/admin/me'),
  updateProfile: (data) => api.put('/admin/profile', data),
};

export const dashboardService = {
  getStats: () => api.get('/admin/dashboard'),
};

export const studentService = {
  getAll: (params) => api.get('/admin/students', { params }),
  getById: (id) => api.get(`/admin/students/${id}`),
  create: (data) => api.post('/admin/students', data),
  update: (id, data) => api.put(`/admin/students/${id}`, data),
  delete: (id) => api.delete(`/admin/students/${id}`),
};

export const facultyService = {
  getAll: (params) => api.get('/admin/faculty', { params }),
  getById: (id) => api.get(`/admin/faculty/${id}`),
  create: (data) => api.post('/admin/faculty', data),
  update: (id, data) => api.put(`/admin/faculty/${id}`, data),
  delete: (id) => api.delete(`/admin/faculty/${id}`),
};

export const departmentService = {
  getAll: (params) => api.get('/admin/departments', { params }),
  create: (data) => api.post('/admin/departments', data),
  update: (id, data) => api.put(`/admin/departments/${id}`, data),
  delete: (id) => api.delete(`/admin/departments/${id}`),
};

export const courseService = {
  getAll: (params) => api.get('/admin/courses', { params }),
  create: (data) => api.post('/admin/courses', data),
  update: (id, data) => api.put(`/admin/courses/${id}`, data),
  delete: (id) => api.delete(`/admin/courses/${id}`),
};

export const subjectService = {
  getAll: (params) => api.get('/admin/subjects', { params }),
  create: (data) => api.post('/admin/subjects', data),
  update: (id, data) => api.put(`/admin/subjects/${id}`, data),
  delete: (id) => api.delete(`/admin/subjects/${id}`),
};

export const timetableService = {
  getAll: (params) => api.get('/admin/timetable', { params }),
  create: (data) => api.post('/admin/timetable', data),
  update: (id, data) => api.put(`/admin/timetable/${id}`, data),
  delete: (id) => api.delete(`/admin/timetable/${id}`),
};

export const reportService = {
  getReports: () => api.get('/admin/reports'),
  downloadCsvUrl: (entity) => `${API_BASE_URL}/admin/reports/export/${entity}`,
};

export default api;
