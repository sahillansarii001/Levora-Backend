import express from 'express';
import {
  createAssignment,
  getAdminAssignments,
  deleteAssignment,
  getStudentAssignments,
  markAssignmentCompleted,
  getFacultyAssignments
} from '../controllers/assignmentController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Admin and Faculty routes
router.post('/', verifyToken(['admin', 'superadmin', 'faculty']), createAssignment);
router.get('/admin', verifyToken(['admin', 'superadmin']), getAdminAssignments);
router.get('/faculty', verifyToken(['faculty']), getFacultyAssignments);
router.delete('/:id', verifyToken(['admin', 'superadmin', 'faculty']), deleteAssignment);

// Student and Parent routes
router.get('/student', verifyToken(['student', 'parent', 'admin', 'superadmin']), getStudentAssignments);
router.put('/:id/complete', verifyToken(['student']), markAssignmentCompleted);

export default router;
