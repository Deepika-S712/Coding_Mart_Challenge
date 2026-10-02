import { api } from './apiClient';

export const reportApi = {
  getAttendanceReport: () => api.get('/faculty/reports/attendance'),
  getMarksReport: () => api.get('/faculty/reports/marks'),
  getAssignmentReport: () => api.get('/faculty/reports/assignments'),
  getAssessmentReport: () => api.get('/faculty/reports/assessments'),
  getStudentPerformanceReport: () => api.get('/faculty/reports/student-performance'),
  getSubjectPerformanceReport: () => api.get('/faculty/reports/subject-performance')
};
