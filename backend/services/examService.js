const examRepository = require('../repositories/examRepository');

class ExamService {
  async getExamsForFaculty(faculty) {
    return await examRepository.getAllExams();
  }

  async getScores(faculty, examId, subjectCode) {
    if (subjectCode && !faculty.assignedSubjects.includes(subjectCode)) {
      const error = new Error('You are not authorized for this subject');
      error.code = 'FORBIDDEN_RESOURCE';
      error.statusCode = 403;
      throw error;
    }
    const scores = await examRepository.getScoresByExamAndSubject(examId, subjectCode);
    if (!scores) {
      const error = new Error('Exam scores not found');
      error.code = 'NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }
    return scores;
  }

  async saveScores(faculty, examId, subjectCode, scores) {
    if (!faculty.assignedSubjects.includes(subjectCode)) {
      const error = new Error('You are not authorized for this subject');
      error.code = 'FORBIDDEN_RESOURCE';
      error.statusCode = 403;
      throw error;
    }
    return await examRepository.saveScores(examId, subjectCode, scores);
  }

  async updateSingleScore(faculty, examId, subjectCode, scoreId, updateData) {
    if (!faculty.assignedSubjects.includes(subjectCode)) {
      const error = new Error('You are not authorized for this subject');
      error.code = 'FORBIDDEN_RESOURCE';
      error.statusCode = 403;
      throw error;
    }
    return await examRepository.updateSingleScore(examId, subjectCode, scoreId, updateData);
  }

  async submitScores(faculty, examId, subjectCode) {
    if (!faculty.assignedSubjects.includes(subjectCode)) {
      const error = new Error('You are not authorized for this subject');
      error.code = 'FORBIDDEN_RESOURCE';
      error.statusCode = 403;
      throw error;
    }
    return await examRepository.submitScores(examId, subjectCode);
  }
}

module.exports = new ExamService();
