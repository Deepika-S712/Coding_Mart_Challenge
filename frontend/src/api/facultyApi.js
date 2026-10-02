import { api } from './apiClient';

export const facultyApi = {
  getDashboard: () => api.get('/faculty/dashboard'),
  getProfile: () => api.get('/faculty/profile'),
  updateProfile: (data) => api.put('/faculty/profile', data),
  getSubjects: () => api.get('/faculty/subjects')
};
