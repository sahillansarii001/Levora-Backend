import express from 'express';
const router = express.Router();
import { 
  registerUser,
  studentLogin,
  adminLogin,
  login,
  sendOTPCode,
  verifyOTPCode,
 } from '../controllers/authController.js';
import {  authLimiter  } from '../middleware/rateLimiter.js';

router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, login);
router.post('/student/login', authLimiter, studentLogin);
router.post('/admin/login', authLimiter, adminLogin);
router.post('/send-otp', sendOTPCode);
router.post('/verify-otp', verifyOTPCode);

export default router;
