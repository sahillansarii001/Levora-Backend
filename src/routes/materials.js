import express from 'express';
import { getMaterials, createMaterial } from '../controllers/materialController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', verifyToken(['student', 'admin', 'faculty', 'superadmin', 'parent']), getMaterials);
router.post('/', verifyToken(['admin', 'faculty', 'superadmin']), createMaterial);

// Keep the rest of the placeholders for now if needed, or remove them.
router.get('/:id', (req, res) => {
  res.json({ message: 'Get material by ID - to be implemented' });
});

router.put('/:id', verifyToken(['admin', 'faculty']), (req, res) => {
  res.json({ message: 'Update material - to be implemented' });
});

router.delete('/:id', verifyToken(['admin']), (req, res) => {
  res.json({ message: 'Delete material - to be implemented' });
});

router.get('/:id/download', (req, res) => {
  res.json({ message: 'Download material - to be implemented' });
});

export default router;
