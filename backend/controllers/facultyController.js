const facultyRepository = require('../repositories/facultyRepository');
const studentService = require('../services/studentService');
const timetableService = require('../services/timetableService');
const assignmentService = require('../services/assignmentService');
const ResponseDto = require('../dto/responseDto');

class FacultyController {
  async getProfile(req, res, next) {
    try {
      const faculty = req.user;
      const subjects = await facultyRepository.getSubjectsByFaculty(faculty.id);
      return ResponseDto.success(res, {
        ...faculty,
        subjects
      }, 'Faculty profile retrieved');
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const { phone, office, qualification } = req.body;
      const updated = await facultyRepository.updateProfile(req.user.id, {
        phone,
        office,
        qualification
      });
      return ResponseDto.success(res, updated, 'Faculty profile updated successfully');
    } catch (err) {
      next(err);
    }
  }

  async getSubjects(req, res, next) {
    try {
      const subjects = await facultyRepository.getSubjectsByFaculty(req.user.id);
      return ResponseDto.success(res, subjects, 'Assigned subjects retrieved');
    } catch (err) {
      next(err);
    }
  }

  async getDashboardSummary(req, res, next) {
    try {
      const faculty = req.user;
      const subjects = await facultyRepository.getSubjectsByFaculty(faculty.id);
      const students = await studentService.getStudentsForFaculty(faculty);
      const todayClasses = await timetableService.getTodayClasses(faculty);
      const assignments = await assignmentService.getAssignments(faculty);

      // Pending grading tasks
      const pendingGradingCount = assignments.reduce((acc, a) => acc + (a.submittedCount - a.gradedCount), 0);

      const stats = {
        mySubjectsCount: subjects.length,
        totalStudentsCount: students.length,
        todayClassesCount: todayClasses.length,
        pendingTasksCount: pendingGradingCount + 1 // +1 for pending attendance/lesson planning
      };

      const recentActivities = [
        {
          id: 'ACT-1',
          type: 'assignment',
          action: 'Assignment Created',
          description: 'Published Assignment 1: Heap Sort & Priority Queues for CSE-3A',
          timestamp: '2 hours ago'
        },
        {
          id: 'ACT-2',
          type: 'attendance',
          action: 'Attendance Submitted',
          description: 'Marked attendance for Web Technologies & Architecture (IT-3A) - 75% present',
          timestamp: 'Yesterday at 3:45 PM'
        },
        {
          id: 'ACT-3',
          type: 'marks',
          action: 'Marks Finalized',
          description: 'Submitted Mid-Semester exam marks for Database Management Systems',
          timestamp: '2 days ago'
        },
        {
          id: 'ACT-4',
          type: 'content',
          action: 'Study Material Uploaded',
          description: 'Uploaded React Hooks Guide for IT-3A',
          timestamp: '3 days ago'
        },
        {
          id: 'ACT-5',
          type: 'assessment',
          action: 'Assessment Scheduled',
          description: 'Scheduled Quiz 2: Non-Linear Data Structures for Oct 14',
          timestamp: '4 days ago'
        }
      ];

      return ResponseDto.success(res, {
        faculty: {
          id: faculty.id,
          name: faculty.name,
          email: faculty.email,
          designation: faculty.designation,
          department: faculty.department
        },
        stats,
        todayClasses,
        recentActivities
      }, 'Dashboard summary loaded successfully');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new FacultyController();
