import express from 'express';
const router = express.Router();
import {  verifyToken  } from '../middleware/auth.js';

router.get('/', verifyToken(['admin', 'faculty']), (req, res) => {
  res.json({ message: 'Get attendance - to be implemented' });
});

router.post('/mark', verifyToken(['faculty']), (req, res) => {
  res.json({ message: 'Mark attendance - to be implemented' });
});

router.get('/report/:courseId', verifyToken(['admin']), (req, res) => {
  res.json({ message: 'Attendance report - to be implemented' });
});

export default router;
