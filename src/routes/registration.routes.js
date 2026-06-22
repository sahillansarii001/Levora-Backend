import express from 'express';
import { getPendingRegistrations, updateRegistrationStatus } from '../controllers/registrationController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Admin and Super Admin routes
router.get('/', verifyToken(['admin', 'superadmin']), getPendingRegistrations);
router.put('/:id/status', verifyToken(['admin', 'superadmin']), updateRegistrationStatus);

export default router;
