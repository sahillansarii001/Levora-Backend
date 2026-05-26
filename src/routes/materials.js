import express from 'express';
const router = express.Router();
import {  verifyToken  } from '../middleware/auth.js';

// Placeholder for materials controllers
router.get('/', (req, res) => {
  res.json({ message: 'Get materials - to be implemented' });
});

router.get('/:id', (req, res) => {
  res.json({ message: 'Get material by ID - to be implemented' });
});

router.post('/', verifyToken(['admin', 'faculty']), (req, res) => {
  res.json({ message: 'Create material - to be implemented' });
});

router.put('/:id', verifyToken(['admin', 'faculty']), (req, res) => {
  res.json({ message: 'Update material - to be implemented' });
});

router.delete('/:id', verifyToken(['admin']), (req, res) => {
  res.json({ message: 'Delete material - to be implemented' });
});

router.get('/:id/download', (req, res) => {
  res.json({ message: 'Download material - to be implemented' });
});

export default router;
