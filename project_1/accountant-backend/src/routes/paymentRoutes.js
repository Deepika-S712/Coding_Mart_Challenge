const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { validatePayment } = require('../validators/paymentValidator');

router.get('/', paymentController.getPayments);
router.get('/:id', paymentController.getPayment);
router.post('/', validatePayment, paymentController.createPayment);

module.exports = router;
