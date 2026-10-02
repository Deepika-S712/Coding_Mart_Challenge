const express = require('express');
const router = express.Router();
const receiptController = require('../controllers/receiptController');

router.get('/', receiptController.getReceipts);
router.get('/:id', receiptController.getReceipt);

module.exports = router;
