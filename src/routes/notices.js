import express from 'express';
const router = express.Router();
import {  verifyToken  } from '../middleware/auth.js';

router.get('/', (req, res) => {
  res.json({ message: 'Get notices - to be implemented' });
});

router.post('/', verifyToken(['admin']), (req, res) => {
  res.json({ message: 'Create notice - to be implemented' });
});

export default router;
