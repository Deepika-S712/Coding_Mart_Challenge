const assessmentService = require('../services/assessmentService');
const ResponseDto = require('../dto/responseDto');

class AssessmentController {
  async getAll(req, res, next) {
    try {
      const { subjectCode, className } = req.query;
      const list = await assessmentService.getAssessments(req.user, { subjectCode, className });
      return ResponseDto.success(res, list, 'Assessments retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const item = await assessmentService.getAssessmentById(req.user, req.params.id);
      return ResponseDto.success(res, item, 'Assessment details retrieved');
    } catch (err) {
      if (err.statusCode) {
        return ResponseDto.error(res, err.message, err.code, err.statusCode);
      }
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const created = await assessmentService.createAssessment(req.user, req.body);
      return ResponseDto.success(res, created, 'Assessment created successfully', 201);
    } catch (err) {
      if (err.statusCode) {
        return ResponseDto.error(res, err.message, err.code, err.statusCode);
      }
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const updated = await assessmentService.updateAssessment(req.user, req.params.id, req.body);
      return ResponseDto.success(res, updated, 'Assessment updated successfully');
    } catch (err) {
      if (err.statusCode) {
        return ResponseDto.error(res, err.message, err.code, err.statusCode);
      }
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      await assessmentService.deleteAssessment(req.user, req.params.id);
      return ResponseDto.success(res, null, 'Assessment deleted successfully');
    } catch (err) {
      if (err.statusCode) {
        return ResponseDto.error(res, err.message, err.code, err.statusCode);
      }
      next(err);
    }
  }

  async updateMarks(req, res, next) {
    try {
      const { results } = req.body;
      const updated = await assessmentService.updateMarks(req.user, req.params.id, results);
      return ResponseDto.success(res, updated, 'Assessment marks updated successfully');
    } catch (err) {
      if (err.statusCode) {
        return ResponseDto.error(res, err.message, err.code, err.statusCode);
      }
      next(err);
    }
  }
}

module.exports = new AssessmentController();
