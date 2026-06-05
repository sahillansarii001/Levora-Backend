import express from 'express';
const router = express.Router();
import { verifyToken } from '../middleware/auth.js';
import { getNotices } from '../controllers/noticeController.js';

router.get('/', verifyToken(['student', 'parent', 'faculty', 'admin', 'superadmin']), getNotices);

router.post('/', verifyToken(['admin']), (req, res) => {
  res.json({ message: 'Create notice - to be implemented' });
});

export default router;
