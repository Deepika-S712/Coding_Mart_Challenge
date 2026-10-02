import { examTimetable, examScores } from '../data/exams.js';

export const examRepository = {
  getTimetable() {
    return [...examTimetable];
  },

  getAllExamScores({ facultyId, subjectCode } = {}) {
    let result = [...examScores];
    if (facultyId) result = result.filter(e => e.facultyId === facultyId);
    if (subjectCode) result = result.filter(e => e.subjectCode === subjectCode);
    return result;
  },

  getExamScoresById(id) {
    return examScores.find(e => e.id === id);
  },

  saveDraftScores(id, scoresList) {
    const exam = examScores.find(e => e.id === id);
    if (!exam) return { error: "EXAM_NOT_FOUND" };
    if (exam.status === "SUBMITTED") {
      return { error: "EXAM_ALREADY_SUBMITTED" };
    }
    exam.scores = scoresList;
    return exam;
  },

  updateSingleScore(id, studentId, { marks, grade, remarks }) {
    const exam = examScores.find(e => e.id === id);
    if (!exam) return { error: "EXAM_NOT_FOUND" };
    if (exam.status === "SUBMITTED") {
      return { error: "EXAM_ALREADY_SUBMITTED" };
    }
    const scoreItem = exam.scores.find(s => s.studentId === studentId);
    if (scoreItem) {
      if (marks !== undefined) scoreItem.marks = Number(marks);
      if (grade !== undefined) scoreItem.grade = grade;
      if (remarks !== undefined) scoreItem.remarks = remarks;
    } else {
      exam.scores.push({ studentId, marks: Number(marks), grade, remarks });
    }
    return exam;
  },

  submitFinalScores(id) {
    const exam = examScores.find(e => e.id === id);
    if (!exam) return { error: "EXAM_NOT_FOUND" };
    if (exam.status === "SUBMITTED") {
      return { error: "ALREADY_SUBMITTED" };
    }
    exam.status = "SUBMITTED";
    return exam;
  }
};
