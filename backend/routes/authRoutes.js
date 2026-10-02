const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateLoginInput } = require('../validators/authValidator');
const { authenticateFaculty } = require('../middleware/authMiddleware');

// POST /api/auth/teacher/login
router.post('/login', validateLoginInput, (req, res, next) => authController.login(req, res, next));

// POST /api/auth/teacher/logout
router.post('/logout', authenticateFaculty, (req, res, next) => authController.logout(req, res, next));

// GET /api/auth/teacher/me
router.get('/me', authenticateFaculty, (req, res, next) => authController.getCurrentUser(req, res, next));

module.exports = router;
