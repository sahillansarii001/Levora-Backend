import express from 'express';
import { getSchedule, createSchedule, updateSchedule, deleteSchedule } from '../controllers/scheduleController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', verifyToken(['student', 'parent', 'faculty', 'admin', 'superadmin']), getSchedule);
router.post('/', verifyToken(['admin', 'superadmin']), createSchedule);
router.put('/:id', verifyToken(['admin', 'superadmin']), updateSchedule);
router.delete('/:id', verifyToken(['admin', 'superadmin']), deleteSchedule);

export default router;
