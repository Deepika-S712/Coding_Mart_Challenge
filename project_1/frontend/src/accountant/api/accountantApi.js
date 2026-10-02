import axios from 'axios';

// Centralized API Base URL configuration according to Section 17
const API_BASE = import.meta.env.VITE_ACCOUNTANT_API_URL || '/api/accountant';

const api = axios.create({
  baseURL: API_BASE,
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

// Response interceptor for unified error formatting
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const customError = {
      message:
        error.response?.data?.message ||
        error.message ||
        'An unexpected error occurred while communicating with the server.',
      status: error.response?.status || 500,
      errors: error.response?.data?.errors || null,
    };
    return Promise.reject(customError);
  }
);

// Dedicated Service Methods for the Accountant Module
export const accountantApi = {
  // Auth
  login: (username, password) => api.post('/auth/login', { username, password }),
  getProfile: () => api.get('/auth/me'),

  // Dashboard
  getDashboard: () => api.get('/dashboard'),

  // Fee Structure
  getFeeStructures: (params) => api.get('/fee-structures', { params }),
  getFeeStructureById: (id) => api.get(`/fee-structures/${id}`),
  createFeeStructure: (data) => api.post('/fee-structures', data),
  updateFeeStructure: (id, data) => api.put(`/fee-structures/${id}`, data),
  deleteFeeStructure: (id) => api.delete(`/fee-structures/${id}`),

  // Student Fees
  getStudentFees: (params) => api.get('/student-fees', { params }),
  getStudentFeeDetails: (studentId) => api.get(`/student-fees/${studentId}`),
  getPendingFees: (params) => api.get('/pending-fees', { params }),

  // Payments
  getPayments: (params) => api.get('/payments', { params }),
  getPaymentById: (id) => api.get(`/payments/${id}`),
  recordPayment: (data) => api.post('/payments', data),

  // Receipts
  getReceipts: (params) => api.get('/receipts', { params }),
  getReceiptById: (id) => api.get(`/receipts/${id}`),

  // Reports
  getReports: (params) => api.get('/reports', { params }),

  // Lookups
  getDepartments: () => api.get('/departments'),
  getStudents: (params) => api.get('/students', { params }),
  getStudentPendingFees: (studentId) => api.get(`/students/${studentId}/pending-fees`),
};

export default api;
