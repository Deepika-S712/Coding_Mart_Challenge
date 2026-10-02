const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const facultyRoutes = require('./facultyRoutes');

router.use('/auth/teacher', authRoutes);
router.use('/faculty', facultyRoutes);

module.exports = router;
