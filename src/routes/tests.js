import express from 'express';
const router = express.Router();
import {  verifyToken  } from '../middleware/auth.js';

router.get('/', (req, res) => {
  res.json({ message: 'Get tests - to be implemented' });
});

router.post('/', verifyToken(['admin', 'faculty']), (req, res) => {
  res.json({ message: 'Create test - to be implemented' });
});

router.get('/:id', (req, res) => {
  res.json({ message: 'Get test by ID - to be implemented' });
});

router.post('/:id/submit', verifyToken(['student']), (req, res) => {
  res.json({ message: 'Submit test - to be implemented' });
});

router.get('/:id/results', verifyToken(['admin']), (req, res) => {
  res.json({ message: 'Test results - to be implemented' });
});

router.get('/:id/leaderboard', (req, res) => {
  res.json({ message: 'Test leaderboard - to be implemented' });
});

export default router;
