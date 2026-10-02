const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// GET /api/accountant/dashboard
router.get('/', dashboardController.getDashboard);

module.exports = router;
