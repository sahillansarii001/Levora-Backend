import express from 'express';
const router = express.Router();
import { verifyToken } from '../middleware/auth.js';
import { getDashboardStats } from '../controllers/adminController.js';

router.get('/dashboard', verifyToken(['admin', 'superadmin']), getDashboardStats);

router.get('/stats', verifyToken(['admin']), (req, res) => {
  res.json({ message: 'Get admin stats - to be implemented' });
});

router.get('/analytics/revenue', verifyToken(['admin']), (req, res) => {
  res.json({ message: 'Revenue analytics - to be implemented' });
});

router.get('/analytics/attendance', verifyToken(['admin']), (req, res) => {
  res.json({ message: 'Attendance analytics - to be implemented' });
});

router.get('/analytics/performance', verifyToken(['admin']), (req, res) => {
  res.json({ message: 'Performance analytics - to be implemented' });
});

export default router;
