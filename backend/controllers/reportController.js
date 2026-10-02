const reportService = require('../services/reportService');
const ResponseDto = require('../dto/responseDto');

class ReportController {
  async getAttendanceReport(req, res, next) {
    try {
      const data = await reportService.getAttendanceReport(req.user);
      return ResponseDto.success(res, data, 'Attendance report generated');
    } catch (err) {
      next(err);
    }
  }

  async getMarksReport(req, res, next) {
    try {
      const data = await reportService.getMarksReport(req.user);
      return ResponseDto.success(res, data, 'Marks report generated');
    } catch (err) {
      next(err);
    }
  }

  async getAssignmentReport(req, res, next) {
    try {
      const data = await reportService.getAssignmentReport(req.user);
      return ResponseDto.success(res, data, 'Assignment report generated');
    } catch (err) {
      next(err);
    }
  }

  async getAssessmentReport(req, res, next) {
    try {
      const data = await reportService.getAssessmentReport(req.user);
      return ResponseDto.success(res, data, 'Assessment report generated');
    } catch (err) {
      next(err);
    }
  }

  async getStudentPerformanceReport(req, res, next) {
    try {
      const data = await reportService.getStudentPerformanceReport(req.user);
      return ResponseDto.success(res, data, 'Student performance report generated');
    } catch (err) {
      next(err);
    }
  }

  async getSubjectPerformanceReport(req, res, next) {
    try {
      const data = await reportService.getSubjectPerformanceReport(req.user);
      return ResponseDto.success(res, data, 'Subject performance report generated');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ReportController();
