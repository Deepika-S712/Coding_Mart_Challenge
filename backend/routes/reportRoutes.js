const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { verifyAdmin } = require('../middleware/auth');

router.use(verifyAdmin);

router.get('/reports', reportController.getReports);
router.get('/reports/export/:entity', reportController.exportCsv);

module.exports = router;
