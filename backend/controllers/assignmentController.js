const assignmentService = require('../services/assignmentService');
const ResponseDto = require('../dto/responseDto');

class AssignmentController {
  async getAll(req, res, next) {
    try {
      const { subjectCode, status } = req.query;
      const assignments = await assignmentService.getAssignments(req.user, { subjectCode, status });
      return ResponseDto.success(res, assignments, 'Assignments retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const assignment = await assignmentService.getAssignmentById(req.user, req.params.id);
      return ResponseDto.success(res, assignment, 'Assignment details retrieved');
    } catch (err) {
      if (err.statusCode) {
        return ResponseDto.error(res, err.message, err.code, err.statusCode);
      }
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const created = await assignmentService.createAssignment(req.user, req.body);
      return ResponseDto.success(res, created, 'Assignment created successfully', 201);
    } catch (err) {
      if (err.statusCode) {
        return ResponseDto.error(res, err.message, err.code, err.statusCode);
      }
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const updated = await assignmentService.updateAssignment(req.user, req.params.id, req.body);
      return ResponseDto.success(res, updated, 'Assignment updated successfully');
    } catch (err) {
      if (err.statusCode) {
        return ResponseDto.error(res, err.message, err.code, err.statusCode);
      }
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      await assignmentService.deleteAssignment(req.user, req.params.id);
      return ResponseDto.success(res, null, 'Assignment deleted successfully');
    } catch (err) {
      if (err.statusCode) {
        return ResponseDto.error(res, err.message, err.code, err.statusCode);
      }
      next(err);
    }
  }

  async gradeSubmission(req, res, next) {
    try {
      const { id, subId } = req.params;
      const { score, feedback } = req.body;
      const graded = await assignmentService.gradeSubmission(req.user, id, subId, { score, feedback });
      return ResponseDto.success(res, graded, 'Submission graded successfully');
    } catch (err) {
      if (err.statusCode) {
        return ResponseDto.error(res, err.message, err.code, err.statusCode);
      }
      next(err);
    }
  }
}

module.exports = new AssignmentController();
