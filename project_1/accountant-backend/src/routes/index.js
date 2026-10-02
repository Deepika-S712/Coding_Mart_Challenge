const express = require('express');
const router = express.Router();

const dashboardRoutes = require('./dashboardRoutes');
const feeStructureRoutes = require('./feeStructureRoutes');
const studentFeeRoutes = require('./studentFeeRoutes');
const paymentRoutes = require('./paymentRoutes');
const receiptRoutes = require('./receiptRoutes');
const reportRoutes = require('./reportRoutes');
const authRoutes = require('./authRoutes');

const studentFeeController = require('../controllers/studentFeeController');
const commonController = require('../controllers/commonController');

// Authentication routes (public)
router.use('/auth', authRoutes);

// Core Accountant Module Routes (as specified in CMS spec #13)
// GET /api/accountant/dashboard
router.use('/dashboard', dashboardRoutes);

// /api/accountant/fee-structures
router.use('/fee-structures', feeStructureRoutes);

// /api/accountant/student-fees
router.use('/student-fees', studentFeeRoutes);

// /api/accountant/payments
router.use('/payments', paymentRoutes);

// /api/accountant/receipts
router.use('/receipts', receiptRoutes);

// /api/accountant/pending-fees
router.get('/pending-fees', studentFeeController.getPendingFees);

// /api/accountant/reports
router.use('/reports', reportRoutes);

// Auxiliary shared lookup endpoints for Accountant UI dropdowns
router.get('/departments', commonController.getDepartments);
router.get('/students', commonController.getStudents);
router.get('/students/:studentId/pending-fees', commonController.getStudentFeesForPayment);

module.exports = router;
