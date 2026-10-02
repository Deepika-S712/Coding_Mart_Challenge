import { api } from './apiClient';

export const assignmentApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/faculty/assignments${query ? `?${query}` : ''}`);
  },
  getById: (id) => api.get(`/faculty/assignments/${id}`),
  create: (data) => api.post('/faculty/assignments', data),
  update: (id, data) => api.put(`/faculty/assignments/${id}`, data),
  delete: (id) => api.delete(`/faculty/assignments/${id}`),
  gradeSubmission: (assignmentId, submissionId, gradeData) => 
    api.post(`/faculty/assignments/${assignmentId}/submissions/${submissionId}/grade`, gradeData)
};
