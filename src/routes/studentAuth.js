import express from 'express';
import { authStudent, registerStudent, getStudentProfile } from '../controllers/studentAuthController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', authStudent);
router.post('/register', registerStudent);
router.get('/profile', verifyToken(['student', 'superadmin']), getStudentProfile);

export default router;
