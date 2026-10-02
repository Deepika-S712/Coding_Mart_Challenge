const express = require('express');
const router = express.Router();
const timetableController = require('../controllers/timetableController');
const { verifyAdmin } = require('../middleware/auth');

router.use(verifyAdmin);

router.get('/timetable', timetableController.getTimetable);
router.post('/timetable', timetableController.createTimetable);
router.put('/timetable/:id', timetableController.updateTimetable);
router.delete('/timetable/:id', timetableController.deleteTimetable);

module.exports = router;
