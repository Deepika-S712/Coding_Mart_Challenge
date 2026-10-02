const express = require('express');
const router = express.Router();
const facultyController = require('../controllers/facultyController');
const { verifyAdmin } = require('../middleware/auth');

router.use(verifyAdmin);

router.get('/faculty', facultyController.getFaculty);
router.get('/faculty/:id', facultyController.getFacultyById);
router.post('/faculty', facultyController.createFaculty);
router.put('/faculty/:id', facultyController.updateFaculty);
router.delete('/faculty/:id', facultyController.deleteFaculty);

module.exports = router;
