import express from 'express';
import { getSchedule, createSchedule } from '../controllers/scheduleController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', verifyToken(['student', 'faculty', 'admin', 'superadmin']), getSchedule);
router.post('/', verifyToken(['faculty', 'admin', 'superadmin']), createSchedule);

export default router;
