import { studentResults } from '../data/results.js';

export const resultRepository = {
  verifyResultPassword(password) {
    return password === "Result@123";
  },

  getByStudentId(studentId) {
    return studentResults[studentId] || {
      studentId,
      studentName: "Student",
      rollNo: "--",
      cgpa: 8.50,
      semesters: []
    };
  }
};
