import express from 'express';
const router = express.Router();
import { verifyToken } from '../middleware/auth.js';
import {
  getParents,
  getParentById,
  createParent,
  updateParent,
  deleteParent,
  getParentDashboard
} from '../controllers/parentController.js';

// Admin routes for managing parents
router.get('/', verifyToken(['admin', 'superadmin']), getParents);
router.get('/:id', verifyToken(['admin', 'superadmin']), getParentById);
router.post('/', verifyToken(['admin', 'superadmin']), createParent);
router.put('/:id', verifyToken(['admin', 'superadmin']), updateParent);
router.delete('/:id', verifyToken(['admin', 'superadmin']), deleteParent);

// Parent dashboard
router.get('/dashboard', verifyToken(['parent']), getParentDashboard);

router.get('/child/attendance', verifyToken(['parent']), (req, res) => {
  res.json({ message: 'Child attendance - to be implemented' });
});

router.get('/child/marks', verifyToken(['parent']), (req, res) => {
  res.json({ message: 'Child marks - to be implemented' });
});

router.get('/child/fees', verifyToken(['parent']), (req, res) => {
  res.json({ message: 'Child fees - to be implemented' });
});

router.get('/notices', verifyToken(['parent']), (req, res) => {
  res.json({ message: 'Parent notices - to be implemented' });
});

export default router;
