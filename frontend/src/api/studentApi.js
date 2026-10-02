import { api } from './apiClient';

export const studentApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/faculty/students${query ? `?${query}` : ''}`);
  },
  getById: (id) => api.get(`/faculty/students/${id}`),
  create: (data) => api.post('/faculty/students', data),
  update: (id, data) => api.put(`/faculty/students/${id}`, data),
  delete: (id) => api.delete(`/faculty/students/${id}`)
};
