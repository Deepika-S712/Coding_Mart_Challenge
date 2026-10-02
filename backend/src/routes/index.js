import { Router } from 'express';
import authRoutes from './authRoutes.js';
import studentRoutes from './studentRoutes.js';
import facultyRoutes from './facultyRoutes.js';
import accountantRoutes from './accountantRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/student', studentRoutes);
router.use('/faculty', facultyRoutes);
router.use('/accountant', accountantRoutes);

export default router;
