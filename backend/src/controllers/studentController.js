import { studentService } from '../services/studentService.js';

export const studentController = {
  async getDashboard(req, res, next) {
    try {
      const data = studentService.getDashboard(req.user.id);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async getProfile(req, res, next) {
    try {
      const data = studentService.getProfile(req.user.id);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async getAttendance(req, res, next) {
    try {
      const data = studentService.getAttendance(req.user.id);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async getTimetable(req, res, next) {
    try {
      const data = studentService.getTimetable(req.user.id);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async getFees(req, res, next) {
    try {
      const data = studentService.getFees(req.user.id);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async getAnnouncements(req, res, next) {
    try {
      const data = studentService.getAnnouncements(req.query);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async verifyResults(req, res, next) {
    try {
      const { password } = req.body;
      const data = studentService.verifyResultsPassword(password);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async getResults(req, res, next) {
    try {
      const data = studentService.getResults(req.user.id);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async getExams(req, res, next) {
    try {
      const data = studentService.getExams();
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
};
