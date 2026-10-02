import { api } from './apiClient';

export const examApi = {
  getAll: () => api.get('/faculty/exams'),
  getScores: (examId, subjectCode) => api.get(`/faculty/exams/${examId}/scores${subjectCode ? `?subjectCode=${subjectCode}` : ''}`),
  saveScores: (examId, subjectCode, scores) => api.post(`/faculty/exams/${examId}/scores`, { subjectCode, scores }),
  updateSingleScore: (examId, scoreId, data) => api.put(`/faculty/exams/${examId}/scores/${scoreId}`, data),
  submitScores: (examId, subjectCode) => api.post(`/faculty/exams/${examId}/scores/submit`, { subjectCode })
};
