import express from 'express';
const router = express.Router();
import {  verifyToken  } from '../middleware/auth.js';

router.post('/', (req, res) => {
  res.json({ message: 'Submit enquiry - to be implemented' });
});

router.get('/', verifyToken(['admin']), (req, res) => {
  res.json({ message: 'Get all enquiries - to be implemented' });
});

router.put('/:id/status', verifyToken(['admin']), (req, res) => {
  res.json({ message: 'Update enquiry status - to be implemented' });
});

export default router;
