import express from 'express';
import { getLectureLogs, createLectureLog } from '../controllers/lectureLogController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(verifyToken(['superadmin', 'admin', 'faculty', 'head', 'student']), getLectureLogs)
  .post(verifyToken(['faculty', 'head']), createLectureLog);

export default router;
