import express from 'express';
const router = express.Router();
import { verifyToken } from '../middleware/auth.js';
import { getSettings, updateSettings, getPublicSettings } from '../controllers/settingsController.js';

router.get('/public', getPublicSettings);
router.get('/', verifyToken(['admin', 'superadmin', 'faculty', 'student']), getSettings);
router.put('/', verifyToken(['admin', 'superadmin']), updateSettings);

export default router;
