const express = require('express');
const router = express.Router();

const { authenticateFaculty } = require('../middleware/authMiddleware');
const { verifySubjectOwnership, verifyClassOwnership } = require('../middleware/permissionMiddleware');

const facultyController = require('../controllers/facultyController');
const studentController = require('../controllers/studentController');
const attendanceController = require('../controllers/attendanceController');
const timetableController = require('../controllers/timetableController');
const contentController = require('../controllers/contentController');
const assignmentController = require('../controllers/assignmentController');
const assessmentController = require('../controllers/assessmentController');
const examController = require('../controllers/examController');
const noticeController = require('../controllers/noticeController');
const reportController = require('../controllers/reportController');

const {
  validateStudentInput,
  validateAttendanceInput,
  validateAssignmentInput,
  validateAssessmentInput,
  validateContentInput,
  validateTimetableInput,
  validateNoticeInput
} = require('../validators/commonValidators');

// Protect all faculty routes with authentication & role check
router.use(authenticateFaculty);

// --- Dashboard & Profile & Subjects ---
router.get('/dashboard', (req, res, next) => facultyController.getDashboardSummary(req, res, next));
router.get('/profile', (req, res, next) => facultyController.getProfile(req, res, next));
router.put('/profile', (req, res, next) => facultyController.updateProfile(req, res, next));
router.get('/subjects', (req, res, next) => facultyController.getSubjects(req, res, next));

// --- Students ---
router.get('/students', (req, res, next) => studentController.getAll(req, res, next));
router.post('/students', validateStudentInput, (req, res, next) => studentController.create(req, res, next));
router.get('/students/:id', (req, res, next) => studentController.getById(req, res, next));
router.put('/students/:id', validateStudentInput, (req, res, next) => studentController.update(req, res, next));
router.delete('/students/:id', (req, res, next) => studentController.delete(req, res, next));

// --- Attendance ---
router.get('/attendance', (req, res, next) => attendanceController.getAll(req, res, next));
router.post('/attendance', validateAttendanceInput, (req, res, next) => attendanceController.create(req, res, next));
router.get('/attendance/:id', (req, res, next) => attendanceController.getById(req, res, next));
router.put('/attendance/:id', validateAttendanceInput, (req, res, next) => attendanceController.update(req, res, next));

// --- Timetable ---
router.get('/timetable', (req, res, next) => timetableController.getAll(req, res, next));
router.get('/timetable/today', (req, res, next) => timetableController.getToday(req, res, next));
router.post('/timetable', validateTimetableInput, (req, res, next) => timetableController.create(req, res, next));
router.put('/timetable/:id', validateTimetableInput, (req, res, next) => timetableController.update(req, res, next));
router.delete('/timetable/:id', (req, res, next) => timetableController.delete(req, res, next));

// --- Subject Content ---
router.get('/content', (req, res, next) => contentController.getAll(req, res, next));
router.post('/content', validateContentInput, (req, res, next) => contentController.create(req, res, next));
router.get('/content/:id', (req, res, next) => contentController.getById(req, res, next));
router.put('/content/:id', validateContentInput, (req, res, next) => contentController.update(req, res, next));
router.delete('/content/:id', (req, res, next) => contentController.delete(req, res, next));

// --- Assignments ---
router.get('/assignments', (req, res, next) => assignmentController.getAll(req, res, next));
router.post('/assignments', validateAssignmentInput, (req, res, next) => assignmentController.create(req, res, next));
router.get('/assignments/:id', (req, res, next) => assignmentController.getById(req, res, next));
router.put('/assignments/:id', validateAssignmentInput, (req, res, next) => assignmentController.update(req, res, next));
router.delete('/assignments/:id', (req, res, next) => assignmentController.delete(req, res, next));
router.post('/assignments/:id/submissions/:subId/grade', (req, res, next) => assignmentController.gradeSubmission(req, res, next));

// --- Assessments ---
router.get('/assessments', (req, res, next) => assessmentController.getAll(req, res, next));
router.post('/assessments', validateAssessmentInput, (req, res, next) => assessmentController.create(req, res, next));
router.get('/assessments/:id', (req, res, next) => assessmentController.getById(req, res, next));
router.put('/assessments/:id', validateAssessmentInput, (req, res, next) => assessmentController.update(req, res, next));
router.delete('/assessments/:id', (req, res, next) => assessmentController.delete(req, res, next));
router.put('/assessments/:id/marks', (req, res, next) => assessmentController.updateMarks(req, res, next));

// --- Exam Scores ---
router.get('/exams', (req, res, next) => examController.getAll(req, res, next));
router.get('/exams/:id/scores', (req, res, next) => examController.getScores(req, res, next));
router.post('/exams/:id/scores', (req, res, next) => examController.saveScores(req, res, next));
router.put('/exams/:id/scores/:scoreId', (req, res, next) => examController.updateSingleScore(req, res, next));
router.post('/exams/:id/scores/submit', (req, res, next) => examController.submitScores(req, res, next));

// --- Notices ---
router.get('/notices', (req, res, next) => noticeController.getAll(req, res, next));
router.post('/notices', validateNoticeInput, (req, res, next) => noticeController.create(req, res, next));
router.get('/notices/:id', (req, res, next) => noticeController.getById(req, res, next));
router.put('/notices/:id', validateNoticeInput, (req, res, next) => noticeController.update(req, res, next));
router.delete('/notices/:id', (req, res, next) => noticeController.delete(req, res, next));

// --- Reports ---
router.get('/reports/attendance', (req, res, next) => reportController.getAttendanceReport(req, res, next));
router.get('/reports/marks', (req, res, next) => reportController.getMarksReport(req, res, next));
router.get('/reports/assignments', (req, res, next) => reportController.getAssignmentReport(req, res, next));
router.get('/reports/assessments', (req, res, next) => reportController.getAssessmentReport(req, res, next));
router.get('/reports/student-performance', (req, res, next) => reportController.getStudentPerformanceReport(req, res, next));
router.get('/reports/subject-performance', (req, res, next) => reportController.getSubjectPerformanceReport(req, res, next));

module.exports = router;
