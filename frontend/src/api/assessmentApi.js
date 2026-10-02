import { api } from './apiClient';

export const assessmentApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/faculty/assessments${query ? `?${query}` : ''}`);
  },
  getById: (id) => api.get(`/faculty/assessments/${id}`),
  create: (data) => api.post('/faculty/assessments', data),
  update: (id, data) => api.put(`/faculty/assessments/${id}`, data),
  delete: (id) => api.delete(`/faculty/assessments/${id}`),
  updateMarks: (id, results) => api.put(`/faculty/assessments/${id}/marks`, { results })
};
