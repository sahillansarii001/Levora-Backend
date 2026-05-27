import express from 'express';
const router = express.Router();
import { verifyToken } from '../middleware/auth.js';
import {
  getSalaryRecords,
  createSalaryRecord,
  updateSalaryRecord,
  deleteSalaryRecord
} from '../controllers/salaryController.js';

// Admin routes for managing salaries
router.get('/', verifyToken(['admin', 'superadmin']), getSalaryRecords);
router.post('/', verifyToken(['admin', 'superadmin']), createSalaryRecord);
router.put('/:id', verifyToken(['admin', 'superadmin']), updateSalaryRecord);
router.delete('/:id', verifyToken(['admin', 'superadmin']), deleteSalaryRecord);

export default router;
