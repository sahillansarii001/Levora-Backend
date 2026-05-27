import express from 'express';
import { getLogs, deleteLog } from '../controllers/activityController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken(['admin', 'superadmin']));

router.get('/', getLogs);
router.delete('/:id', deleteLog);

export default router;
