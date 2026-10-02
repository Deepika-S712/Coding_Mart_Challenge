const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { verifyAdmin } = require('../middleware/auth');

router.use(verifyAdmin);

router.get('/departments', departmentController.getDepartments);
router.post('/departments', departmentController.createDepartment);
router.put('/departments/:id', departmentController.updateDepartment);
router.delete('/departments/:id', departmentController.deleteDepartment);

module.exports = router;
