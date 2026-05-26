import express from 'express';
const router = express.Router();
import {  verifyToken  } from '../middleware/auth.js';

router.get('/dashboard', verifyToken(['parent']), (req, res) => {
  res.json({ message: 'Parent dashboard - to be implemented' });
});

router.get('/child/attendance', verifyToken(['parent']), (req, res) => {
  res.json({ message: 'Child attendance - to be implemented' });
});

router.get('/child/marks', verifyToken(['parent']), (req, res) => {
  res.json({ message: 'Child marks - to be implemented' });
});

router.get('/child/fees', verifyToken(['parent']), (req, res) => {
  res.json({ message: 'Child fees - to be implemented' });
});

router.get('/notices', verifyToken(['parent']), (req, res) => {
  res.json({ message: 'Parent notices - to be implemented' });
});

export default router;
