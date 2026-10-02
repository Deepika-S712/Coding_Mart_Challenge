import { api } from './apiClient';

export const noticeApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/faculty/notices${query ? `?${query}` : ''}`);
  },
  getById: (id) => api.get(`/faculty/notices/${id}`),
  create: (data) => api.post('/faculty/notices', data),
  update: (id, data) => api.put(`/faculty/notices/${id}`, data),
  delete: (id) => api.delete(`/faculty/notices/${id}`)
};
