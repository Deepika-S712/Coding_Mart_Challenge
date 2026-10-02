import { api } from './apiClient';

export const contentApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/faculty/content${query ? `?${query}` : ''}`);
  },
  getById: (id) => api.get(`/faculty/content/${id}`),
  create: (data) => api.post('/faculty/content', data),
  update: (id, data) => api.put(`/faculty/content/${id}`, data),
  delete: (id) => api.delete(`/faculty/content/${id}`)
};
