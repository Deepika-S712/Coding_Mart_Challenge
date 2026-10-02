import { Router } from 'express';
import { facultyController } from '../controllers/facultyController.js';
import { authenticate, authorizeRoles } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate, authorizeRoles('FACULTY'));

// Dashboard & Profile
router.get('/dashboard', facultyController.getDashboard);
router.get('/profile', facultyController.getProfile);
router.put('/profile', facultyController.updateProfile);
router.get('/subjects', facultyController.getSubjects);

// Students CRUD
router.get('/students', facultyController.getStudents);
router.post('/students', facultyController.createStudent);
router.put('/students/:id', facultyController.updateStudent);
router.delete('/students/:id', facultyController.deleteStudent);

// Attendance
router.get('/attendance', facultyController.getAttendance);
router.post('/attendance', facultyController.saveAttendance);
router.put('/attendance/:id', facultyController.updateAttendance);

// Timetable CRUD
router.get('/timetable', facultyController.getTimetable);
router.post('/timetable', facultyController.createTimetableSlot);
router.put('/timetable/:id', facultyController.updateTimetableSlot);
router.delete('/timetable/:id', facultyController.deleteTimetableSlot);

// Content CRUD
router.get('/content', facultyController.getContent);
router.post('/content', facultyController.createContent);
router.put('/content/:id', facultyController.updateContent);
router.delete('/content/:id', facultyController.deleteContent);

// Assignments CRUD & Grading
router.get('/assignments', facultyController.getAssignments);
router.post('/assignments', facultyController.createAssignment);
router.put('/assignments/:id', facultyController.updateAssignment);
router.delete('/assignments/:id', facultyController.deleteAssignment);
router.post('/assignments/:id/submissions/:submissionId/grade', facultyController.gradeSubmission);

// Assessments CRUD & Marks
router.get('/assessments', facultyController.getAssessments);
router.post('/assessments', facultyController.createAssessment);
router.put('/assessments/:id', facultyController.updateAssessment);
router.delete('/assessments/:id', facultyController.deleteAssessment);
router.put('/assessments/:id/marks', facultyController.updateAssessmentMarks);

// Exam Scores & Submission
router.get('/exams', facultyController.getExams);
router.get('/exams/:id/scores', facultyController.getExamScores);
router.post('/exams/:id/scores', facultyController.saveDraftScores);
router.put('/exams/:id/scores/:studentId', facultyController.updateSingleScore);
router.post('/exams/:id/scores/submit', facultyController.submitFinalScores);

// Notices CRUD & Pinning
router.get('/notices', facultyController.getNotices);
router.post('/notices', facultyController.createNotice);
router.put('/notices/:id', facultyController.updateNotice);
router.put('/notices/:id/pin', facultyController.toggleNoticePin);
router.delete('/notices/:id', facultyController.deleteNotice);

// Reports
router.get('/reports', facultyController.getReports);

export default router;
