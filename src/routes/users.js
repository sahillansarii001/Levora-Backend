import express from 'express';
const router = express.Router();
import { verifyToken } from '../middleware/auth.js';
import { getAllUsers, createUser, deleteUser, toggleUserStatus } from '../controllers/userController.js';

// Get all note-purchaser users (admin/superadmin only)
router.get('/', verifyToken(['admin', 'superadmin']), getAllUsers);

// Create a new note-purchaser user (admin/superadmin only)
router.post('/', verifyToken(['admin', 'superadmin']), createUser);

// Delete a user (admin/superadmin only)
router.delete('/:id', verifyToken(['admin', 'superadmin']), deleteUser);

// Toggle user status (admin/superadmin only)
router.patch('/:id/status', verifyToken(['admin', 'superadmin']), toggleUserStatus);

export default router;
