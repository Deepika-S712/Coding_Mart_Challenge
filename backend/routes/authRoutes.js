const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyAdmin } = require('../middleware/auth');

router.post('/login', authController.login);
router.get('/me', verifyAdmin, authController.getMe);
router.put('/profile', verifyAdmin, authController.updateProfile);

module.exports = router;
