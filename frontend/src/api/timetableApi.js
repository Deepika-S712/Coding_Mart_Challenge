import { api } from './apiClient';

export const timetableApi = {
  getAll: () => api.get('/faculty/timetable'),
  getToday: () => api.get('/faculty/timetable/today'),
  create: (data) => api.post('/faculty/timetable', data),
  update: (id, data) => api.put(`/faculty/timetable/${id}`, data),
  delete: (id) => api.delete(`/faculty/timetable/${id}`)
};
