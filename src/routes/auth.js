import express from 'express';
const router = express.Router();
import { 
  registerUser,
  studentLogin,
  adminLogin,
  sendOTPCode,
  verifyOTPCode,
 } from '../controllers/authController.js';
import {  authLimiter  } from '../middleware/rateLimiter.js';

router.post('/register', authLimiter, registerUser);
router.post('/student/login', authLimiter, studentLogin);
router.post('/admin/login', authLimiter, adminLogin);
router.post('/send-otp', sendOTPCode);
router.post('/verify-otp', verifyOTPCode);

export default router;
