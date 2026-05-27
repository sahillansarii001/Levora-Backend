import express from 'express';
const router = express.Router();
import { verifyToken } from '../middleware/auth.js';
import {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} from '../controllers/studentController.js';

// Admin routes for managing students
router.get('/', verifyToken(['admin', 'superadmin']), getStudents);
router.get('/:id', verifyToken(['admin', 'superadmin']), getStudentById);
router.post('/', verifyToken(['admin', 'superadmin']), createStudent);
router.put('/:id', verifyToken(['admin', 'superadmin']), updateStudent);
router.delete('/:id', verifyToken(['admin', 'superadmin']), deleteStudent);
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
