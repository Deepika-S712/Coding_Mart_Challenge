const attendanceService = require('../services/attendanceService');
const ResponseDto = require('../dto/responseDto');

class AttendanceController {
  async getAll(req, res, next) {
    try {
      const { date, subjectCode, className } = req.query;
      const records = await attendanceService.getAttendanceSheets(req.user, { date, subjectCode, className });
      return ResponseDto.success(res, records, 'Attendance records retrieved');
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const sheet = await attendanceService.getAttendanceById(req.user, req.params.id);
      if (!sheet) {
        return ResponseDto.error(res, 'Attendance record not found', 'NOT_FOUND', 404);
      }
      return ResponseDto.success(res, sheet, 'Attendance record details retrieved');
    } catch (err) {
      if (err.statusCode) {
        return ResponseDto.error(res, err.message, err.code, err.statusCode);
      }
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const created = await attendanceService.markAttendance(req.user, req.body);
      return ResponseDto.success(res, created, 'Attendance submitted successfully', 201);
    } catch (err) {
      if (err.statusCode) {
        return ResponseDto.error(res, err.message, err.code, err.statusCode);
      }
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const updated = await attendanceService.updateAttendance(req.user, req.params.id, req.body);
      return ResponseDto.success(res, updated, 'Attendance updated successfully');
    } catch (err) {
      if (err.statusCode) {
        return ResponseDto.error(res, err.message, err.code, err.statusCode);
      }
      next(err);
    }
  }
}

module.exports = new AttendanceController();
