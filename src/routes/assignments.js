import express from 'express';
import {
  createAssignment,
  getAdminAssignments,
  deleteAssignment,
  getStudentAssignments,
  markAssignmentCompleted
} from '../controllers/assignmentController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Admin routes
router.post('/', verifyToken(['admin', 'superadmin']), createAssignment);
router.get('/admin', verifyToken(['admin', 'superadmin']), getAdminAssignments);
router.delete('/:id', verifyToken(['admin', 'superadmin']), deleteAssignment);

// Student and Parent routes
router.get('/student', verifyToken(['student', 'parent', 'admin', 'superadmin']), getStudentAssignments);
router.put('/:id/complete', verifyToken(['student']), markAssignmentCompleted);

export default router;
