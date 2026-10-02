import { facultyService } from '../services/facultyService.js';

export const facultyController = {
  async getDashboard(req, res, next) {
    try {
      const data = facultyService.getDashboard(req.user.id);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async getProfile(req, res, next) {
    try {
      const data = facultyService.getProfile(req.user.id);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async updateProfile(req, res, next) {
    try {
      const data = facultyService.updateProfile(req.user.id, req.body);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async getSubjects(req, res, next) {
    try {
      const data = facultyService.getSubjects(req.user.id);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  // Students CRUD
  async getStudents(req, res, next) {
    try {
      const data = facultyService.getStudents(req.query);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async createStudent(req, res, next) {
    try {
      const data = facultyService.createStudent(req.body);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async updateStudent(req, res, next) {
    try {
      const data = facultyService.updateStudent(req.params.id, req.body);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async deleteStudent(req, res, next) {
    try {
      const data = facultyService.deleteStudent(req.params.id);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  // Attendance
  async getAttendance(req, res, next) {
    try {
      const data = facultyService.getAttendance({ ...req.query, facultyId: req.user.id });
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async saveAttendance(req, res, next) {
    try {
      const data = facultyService.saveAttendance({ ...req.body, facultyId: req.user.id });
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async updateAttendance(req, res, next) {
    try {
      const data = facultyService.updateAttendance(req.params.id, req.body);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  // Timetable
  async getTimetable(req, res, next) {
    try {
      const data = facultyService.getTimetable({ ...req.query, facultyId: req.user.id });
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async createTimetableSlot(req, res, next) {
    try {
      const data = facultyService.createTimetableSlot({ ...req.body, facultyId: req.user.id });
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async updateTimetableSlot(req, res, next) {
    try {
      const data = facultyService.updateTimetableSlot(req.params.id, req.body);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async deleteTimetableSlot(req, res, next) {
    try {
      const data = facultyService.deleteTimetableSlot(req.params.id);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  // Content
  async getContent(req, res, next) {
    try {
      const data = facultyService.getContent({ ...req.query, facultyId: req.user.id });
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async createContent(req, res, next) {
    try {
      const data = facultyService.createContent({ ...req.body, facultyId: req.user.id });
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async updateContent(req, res, next) {
    try {
      const data = facultyService.updateContent(req.params.id, req.body);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async deleteContent(req, res, next) {
    try {
      const data = facultyService.deleteContent(req.params.id);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  // Assignments
  async getAssignments(req, res, next) {
    try {
      const data = facultyService.getAssignments({ ...req.query, facultyId: req.user.id });
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async createAssignment(req, res, next) {
    try {
      const data = facultyService.createAssignment({ ...req.body, facultyId: req.user.id });
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async updateAssignment(req, res, next) {
    try {
      const data = facultyService.updateAssignment(req.params.id, req.body);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async deleteAssignment(req, res, next) {
    try {
      const data = facultyService.deleteAssignment(req.params.id);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async gradeSubmission(req, res, next) {
    try {
      const { id, submissionId } = req.params;
      const data = facultyService.gradeSubmission(id, submissionId, req.body);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  // Assessments
  async getAssessments(req, res, next) {
    try {
      const data = facultyService.getAssessments({ ...req.query, facultyId: req.user.id });
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async createAssessment(req, res, next) {
    try {
      const data = facultyService.createAssessment({ ...req.body, facultyId: req.user.id });
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async updateAssessment(req, res, next) {
    try {
      const data = facultyService.updateAssessment(req.params.id, req.body);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async updateAssessmentMarks(req, res, next) {
    try {
      const data = facultyService.updateAssessmentMarks(req.params.id, req.body.marks);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async deleteAssessment(req, res, next) {
    try {
      const data = facultyService.deleteAssessment(req.params.id);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  // Exam Scores
  async getExams(req, res, next) {
    try {
      const data = facultyService.getExams(req.user.id);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async getExamScores(req, res, next) {
    try {
      const data = facultyService.getExamScoresById(req.params.id);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async saveDraftScores(req, res, next) {
    try {
      const data = facultyService.saveDraftExamScores(req.params.id, req.body.scores);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async updateSingleScore(req, res, next) {
    try {
      const { id, studentId } = req.params;
      const data = facultyService.updateSingleExamScore(id, studentId, req.body);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async submitFinalScores(req, res, next) {
    try {
      const data = facultyService.submitFinalExamScores(req.params.id);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  // Notices
  async getNotices(req, res, next) {
    try {
      const data = facultyService.getNotices({ ...req.query, facultyId: req.user.id });
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async createNotice(req, res, next) {
    try {
      const data = facultyService.createNotice({
        ...req.body,
        facultyId: req.user.id,
        facultyName: req.user.name
      });
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async updateNotice(req, res, next) {
    try {
      const data = facultyService.updateNotice(req.params.id, req.body);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async toggleNoticePin(req, res, next) {
    try {
      const data = facultyService.toggleNoticePin(req.params.id);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async deleteNotice(req, res, next) {
    try {
      const data = facultyService.deleteNotice(req.params.id);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  // Reports
  async getReports(req, res, next) {
    try {
      const data = facultyService.getReports(req.user.id);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
};
