const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { verifyAdmin } = require('../middleware/auth');

router.get('/dashboard', verifyAdmin, dashboardController.getDashboardStats);

module.exports = router;
