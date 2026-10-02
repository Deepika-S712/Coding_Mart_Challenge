const examService = require('../services/examService');
const ResponseDto = require('../dto/responseDto');

class ExamController {
  async getAll(req, res, next) {
    try {
      const exams = await examService.getExamsForFaculty(req.user);
      return ResponseDto.success(res, exams, 'Exams retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  async getScores(req, res, next) {
    try {
      const { id } = req.params;
      const { subjectCode } = req.query;
      const scores = await examService.getScores(req.user, id, subjectCode);
      return ResponseDto.success(res, scores, 'Exam scores retrieved successfully');
    } catch (err) {
      if (err.statusCode) {
        return ResponseDto.error(res, err.message, err.code, err.statusCode);
      }
      next(err);
    }
  }

  async saveScores(req, res, next) {
    try {
      const { id } = req.params;
      const { subjectCode, scores } = req.body;
      const saved = await examService.saveScores(req.user, id, subjectCode, scores);
      return ResponseDto.success(res, saved, 'Exam scores saved successfully');
    } catch (err) {
      if (err.statusCode) {
        return ResponseDto.error(res, err.message, err.code, err.statusCode);
      }
      next(err);
    }
  }

  async updateSingleScore(req, res, next) {
    try {
      const { id, scoreId } = req.params;
      const { subjectCode, marks, grade, remarks } = req.body;
      const updated = await examService.updateSingleScore(req.user, id, subjectCode, scoreId, { marks, grade, remarks });
      return ResponseDto.success(res, updated, 'Student exam score updated successfully');
    } catch (err) {
      if (err.statusCode) {
        return ResponseDto.error(res, err.message, err.code, err.statusCode);
      }
      next(err);
    }
  }

  async submitScores(req, res, next) {
    try {
      const { id } = req.params;
      const { subjectCode } = req.body;
      const submitted = await examService.submitScores(req.user, id, subjectCode);
      return ResponseDto.success(res, submitted, 'Exam scores finalized and submitted');
    } catch (err) {
      if (err.statusCode) {
        return ResponseDto.error(res, err.message, err.code, err.statusCode);
      }
      next(err);
    }
  }
}

module.exports = new ExamController();
