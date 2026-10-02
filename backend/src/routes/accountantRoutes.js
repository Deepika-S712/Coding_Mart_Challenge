import { Router } from 'express';
import { accountantController } from '../controllers/accountantController.js';
import { authenticate, authorizeRoles } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate, authorizeRoles('ACCOUNTANT'));

// Dashboard
router.get('/dashboard', accountantController.getDashboard);

// Fee Structures CRUD
router.get('/fee-structures', accountantController.getFeeStructures);
router.post('/fee-structures', accountantController.createFeeStructure);
router.get('/fee-structures/:id', accountantController.getFeeStructureById);
router.put('/fee-structures/:id', accountantController.updateFeeStructure);
router.delete('/fee-structures/:id', accountantController.deleteFeeStructure);

// Student Fees Ledger
router.get('/student-fees', accountantController.getStudentFees);
router.get('/student-fees/:studentId', accountantController.getStudentFeeById);

// Payments & Receipts
router.get('/payments', accountantController.getPayments);
router.post('/payments', accountantController.recordPayment);
router.get('/payments/:id', accountantController.getPaymentById);

router.get('/receipts', accountantController.getReceipts);
router.get('/receipts/:id', accountantController.getReceiptById);

// Pending Fees
router.get('/pending-fees', accountantController.getPendingFees);

// Financial Reports
router.get('/reports', accountantController.getReports);

export default router;
