const timetableService = require('../services/timetableService');
const ResponseDto = require('../dto/responseDto');

class TimetableController {
  async getAll(req, res, next) {
    try {
      const schedule = await timetableService.getWeeklyTimetable(req.user);
      return ResponseDto.success(res, schedule, 'Weekly timetable retrieved');
    } catch (err) {
      next(err);
    }
  }

  async getToday(req, res, next) {
    try {
      const classes = await timetableService.getTodayClasses(req.user);
      return ResponseDto.success(res, classes, "Today's classes retrieved");
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const created = await timetableService.addSchedule(req.user, req.body);
      return ResponseDto.success(res, created, 'Schedule slot added successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const updated = await timetableService.updateSchedule(req.user, req.params.id, req.body);
      return ResponseDto.success(res, updated, 'Schedule slot updated successfully');
    } catch (err) {
      if (err.statusCode) {
        return ResponseDto.error(res, err.message, err.code, err.statusCode);
      }
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      await timetableService.deleteSchedule(req.user, req.params.id);
      return ResponseDto.success(res, null, 'Schedule slot removed successfully');
    } catch (err) {
      if (err.statusCode) {
        return ResponseDto.error(res, err.message, err.code, err.statusCode);
      }
      next(err);
    }
  }
}

module.exports = new TimetableController();
