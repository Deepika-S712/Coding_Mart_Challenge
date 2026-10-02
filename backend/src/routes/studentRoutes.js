import { Router } from 'express';
import { studentController } from '../controllers/studentController.js';
import { authenticate, authorizeRoles } from '../middleware/authMiddleware.js';

const router = Router();

// All student routes are protected and restricted to STUDENT role
router.use(authenticate, authorizeRoles('STUDENT'));

router.get('/dashboard', studentController.getDashboard);
router.get('/profile', studentController.getProfile);
router.get('/attendance', studentController.getAttendance);
router.get('/timetable', studentController.getTimetable);
router.get('/fees', studentController.getFees);
router.get('/announcements', studentController.getAnnouncements);
router.post('/results/verify', studentController.verifyResults);
router.get('/results', studentController.getResults);
router.get('/exams', studentController.getExams);

export default router;
