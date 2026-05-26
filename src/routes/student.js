import express from 'express';
const router = express.Router();
import {  verifyToken  } from '../middleware/auth.js';

router.get('/dashboard', verifyToken(['student']), (req, res) => {
  res.json({ message: 'Student dashboard - to be implemented' });
});

router.get('/attendance', verifyToken(['student']), (req, res) => {
  res.json({ message: 'Student attendance - to be implemented' });
});

router.get('/fees', verifyToken(['student']), (req, res) => {
  res.json({ message: 'Student fees - to be implemented' });
});

router.get('/materials', verifyToken(['student']), (req, res) => {
  res.json({ message: 'Student materials - to be implemented' });
});

router.get('/tests', verifyToken(['student']), (req, res) => {
  res.json({ message: 'Student tests - to be implemented' });
});

router.get('/results', verifyToken(['student']), (req, res) => {
  res.json({ message: 'Student results - to be implemented' });
});

router.put('/profile', verifyToken(['student']), (req, res) => {
  res.json({ message: 'Update student profile - to be implemented' });
});

export default router;
