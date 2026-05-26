import express from 'express';
const router = express.Router();
import {  verifyToken  } from '../middleware/auth.js';

router.get('/', (req, res) => {
  res.json({ message: 'Get blog posts - to be implemented' });
});

router.get('/:slug', (req, res) => {
  res.json({ message: 'Get blog post by slug - to be implemented' });
});

router.post('/', verifyToken(['admin']), (req, res) => {
  res.json({ message: 'Create blog post - to be implemented' });
});

router.put('/:id', verifyToken(['admin']), (req, res) => {
  res.json({ message: 'Update blog post - to be implemented' });
});

router.delete('/:id', verifyToken(['admin']), (req, res) => {
  res.json({ message: 'Delete blog post - to be implemented' });
});

export default router;
