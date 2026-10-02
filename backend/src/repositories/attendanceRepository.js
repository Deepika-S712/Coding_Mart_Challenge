import { studentAttendanceSummary, attendanceSessions } from '../data/attendance.js';

export const attendanceRepository = {
  getStudentSummary(studentId) {
    return studentAttendanceSummary[studentId] || {
      overallPercentage: 88.0,
      totalHeld: 150,
      totalAttended: 132,
      monthlyTrend: [
        { month: "June", percentage: 90 },
        { month: "July", percentage: 85 },
        { month: "August", percentage: 88 },
        { month: "September", percentage: 91 },
        { month: "October", percentage: 88 }
      ],
      subjectBreakdown: []
    };
  },

  getAllSessions({ facultyId, subjectCode, date, classVal } = {}) {
    let result = [...attendanceSessions];
    if (facultyId) result = result.filter(s => s.facultyId === facultyId);
    if (subjectCode) result = result.filter(s => s.subjectCode === subjectCode);
    if (date) result = result.filter(s => s.date === date);
    if (classVal) result = result.filter(s => s.class === classVal);
    return result;
  },

  findSessionById(id) {
    return attendanceSessions.find(s => s.id === id);
  },

  createSession(sessionData) {
    const id = `ATT-${sessionData.date}-${sessionData.subjectCode}-${Date.now()}`;
    const newSession = {
      id,
      ...sessionData
    };
    attendanceSessions.push(newSession);
    return newSession;
  },

  updateSession(id, updates) {
    const index = attendanceSessions.findIndex(s => s.id === id);
    if (index === -1) return null;
    attendanceSessions[index] = { ...attendanceSessions[index], ...updates };
    return attendanceSessions[index];
  }
};
