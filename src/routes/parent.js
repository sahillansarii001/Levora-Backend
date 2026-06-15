import express from 'express';
const router = express.Router();
import { verifyToken } from '../middleware/auth.js';
import {
  getParents,
  getParentById,
  createParent,
  updateParent,
  deleteParent,
  getParentDashboard,
  getChildAttendance,
  getChildFees
} from '../controllers/parentController.js';

// Parent dashboard and features (allowed for admins for preview purposes)
router.get('/dashboard', verifyToken(['parent', 'admin', 'superadmin']), getParentDashboard);

router.get('/child/attendance', verifyToken(['parent', 'admin', 'superadmin']), getChildAttendance);

router.get('/child/marks', verifyToken(['parent', 'admin', 'superadmin']), (req, res) => {
  res.json({ message: 'Child marks - to be implemented' });
});

router.get('/child/fees', verifyToken(['parent', 'admin', 'superadmin']), getChildFees);

router.get('/notices', verifyToken(['parent']), (req, res) => {
  res.json({ message: 'Parent notices - to be implemented' });
});

// Admin routes for managing parents
router.get('/', verifyToken(['admin', 'superadmin']), getParents);
router.post('/', verifyToken(['admin', 'superadmin']), createParent);
router.get('/:id', verifyToken(['admin', 'superadmin']), getParentById);
router.put('/:id', verifyToken(['admin', 'superadmin']), updateParent);
router.delete('/:id', verifyToken(['admin', 'superadmin']), deleteParent);

export default router;
