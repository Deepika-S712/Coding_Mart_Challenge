const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { verifyAdmin } = require('../middleware/auth');

router.use(verifyAdmin);

router.get('/courses', courseController.getCourses);
router.post('/courses', courseController.createCourse);
router.put('/courses/:id', courseController.updateCourse);
router.delete('/courses/:id', courseController.deleteCourse);

module.exports = router;
