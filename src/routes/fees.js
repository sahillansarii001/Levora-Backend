import express from 'express';
const router = express.Router();
import { verifyToken } from '../middleware/auth.js';
import {
  getFeeRecords,
  createFeeRecord,
  updateFeeRecord,
  deleteFeeRecord
} from '../controllers/feeController.js';

// Admin routes for managing fees
router.get('/', verifyToken(['admin', 'superadmin']), getFeeRecords);
router.post('/', verifyToken(['admin', 'superadmin']), createFeeRecord);
router.put('/:id', verifyToken(['admin', 'superadmin']), updateFeeRecord);
router.delete('/:id', verifyToken(['admin', 'superadmin']), deleteFeeRecord);

export default router;
