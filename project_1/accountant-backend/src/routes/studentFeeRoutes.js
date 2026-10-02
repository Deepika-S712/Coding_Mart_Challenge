const express = require('express');
const router = express.Router();
const studentFeeController = require('../controllers/studentFeeController');

router.get('/', studentFeeController.getStudentFees);
router.get('/:studentId', studentFeeController.getStudentFeeDetails);

module.exports = router;
