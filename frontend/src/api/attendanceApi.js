import { api } from './apiClient';

export const attendanceApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/faculty/attendance${query ? `?${query}` : ''}`);
  },
  getById: (id) => api.get(`/faculty/attendance/${id}`),
  create: (data) => api.post('/faculty/attendance', data),
  update: (id, data) => api.put(`/faculty/attendance/${id}`, data)
};
