import express from 'express';
const router = express.Router();
import { verifyToken } from '../middleware/auth.js';
import {
  getAttendance,
  createAttendance,
  updateAttendance,
  deleteAttendance
} from '../controllers/attendanceController.js';

// Admin routes for managing attendance
router.get('/', verifyToken(['admin', 'superadmin', 'faculty']), getAttendance);
router.post('/', verifyToken(['admin', 'superadmin', 'faculty']), createAttendance);
router.put('/:id', verifyToken(['admin', 'superadmin', 'faculty']), updateAttendance);
router.delete('/:id', verifyToken(['admin', 'superadmin']), deleteAttendance);

export default router;
