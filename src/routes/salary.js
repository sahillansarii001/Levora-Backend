import express from 'express';
const router = express.Router();
import { verifyToken } from '../middleware/auth.js';
import {
  getSalaryRecords,
  createSalaryRecord,
  updateSalaryRecord,
  deleteSalaryRecord,
  getMySalary
} from '../controllers/salaryController.js';

// Faculty route for checking their own salary
router.get('/my-salary', verifyToken(['faculty']), getMySalary);

// Admin routes for managing salaries
router.get('/', verifyToken(['admin', 'superadmin']), getSalaryRecords);
router.post('/', verifyToken(['admin', 'superadmin']), createSalaryRecord);
router.put('/:id', verifyToken(['admin', 'superadmin']), updateSalaryRecord);
router.delete('/:id', verifyToken(['admin', 'superadmin']), deleteSalaryRecord);

export default router;
