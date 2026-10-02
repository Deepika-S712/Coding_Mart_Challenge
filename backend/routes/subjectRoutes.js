const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subjectController');
const { verifyAdmin } = require('../middleware/auth');

router.use(verifyAdmin);

router.get('/subjects', subjectController.getSubjects);
router.post('/subjects', subjectController.createSubject);
router.put('/subjects/:id', subjectController.updateSubject);
router.delete('/subjects/:id', subjectController.deleteSubject);

module.exports = router;
