import express from 'express';
const router = express.Router();
import { verifyToken } from '../middleware/auth.js';
import { getAllUsers, createUser } from '../controllers/userController.js';

// Get all note-purchaser users (admin/superadmin only)
router.get('/', verifyToken(['admin', 'superadmin']), getAllUsers);

// Create a new note-purchaser user (admin/superadmin only)
router.post('/', verifyToken(['admin', 'superadmin']), createUser);

export default router;
