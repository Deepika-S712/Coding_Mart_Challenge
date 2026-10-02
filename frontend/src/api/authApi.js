import { api } from './apiClient';

export const authApi = {
  login: async (email, password) => {
    return await api.post('/auth/teacher/login', { email, password });
  },
  logout: async () => {
    return await api.post('/auth/teacher/logout');
  },
  getCurrentUser: async () => {
    return await api.get('/auth/teacher/me');
  }
};
