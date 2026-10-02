const { examsData } = require('../mock-data/examsData');

class ExamRepository {
  constructor() {
    this.exams = [...examsData];
  }

  async getAllExams() {
    return this.exams.map(e => ({
      id: e.id,
      name: e.name,
      academicYear: e.academicYear,
      semester: e.semester,
      startDate: e.startDate,
      endDate: e.endDate,
      status: e.status,
      subjectCount: e.subjects.length
    }));
  }

  async getExamById(examId) {
    return this.exams.find(e => e.id === examId) || null;
  }

  async getScoresByExamAndSubject(examId, subjectCode) {
    const exam = this.exams.find(e => e.id === examId);
    if (!exam) return null;

    if (subjectCode) {
      const subjectExam = exam.subjects.find(s => s.subjectCode === subjectCode);
      return subjectExam ? { ...subjectExam, examId: exam.id, examName: exam.name } : null;
    }

    return exam.subjects;
  }

  async saveScores(examId, subjectCode, scores) {
    const exam = this.exams.find(e => e.id === examId);
    if (!exam) return null;

    const subjectExam = exam.subjects.find(s => s.subjectCode === subjectCode);
    if (!subjectExam) return null;

    subjectExam.scores = scores;
    subjectExam.submissionStatus = 'Saved';
    return subjectExam;
  }

  async updateSingleScore(examId, subjectCode, scoreId, updateData) {
    const exam = this.exams.find(e => e.id === examId);
    if (!exam) return null;

    const subjectExam = exam.subjects.find(s => s.subjectCode === subjectCode);
    if (!subjectExam) return null;

    const score = subjectExam.scores.find(s => s.scoreId === scoreId);
    if (!score) return null;

    Object.assign(score, updateData);
    return score;
  }

  async submitScores(examId, subjectCode) {
    const exam = this.exams.find(e => e.id === examId);
    if (!exam) return null;

    const subjectExam = exam.subjects.find(s => s.subjectCode === subjectCode);
    if (!subjectExam) return null;

    subjectExam.submissionStatus = 'Submitted';
    subjectExam.submittedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
    return subjectExam;
  }
}

module.exports = new ExamRepository();
