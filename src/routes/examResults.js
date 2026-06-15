import express from 'express';
import { 
  createResult, 
  getAllResults, 
  getStudentResults, 
  updateResult, 
  deleteResult 
} from '../controllers/examResultController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Admin / Superadmin routes to manage all results
router.post('/', verifyToken(['admin', 'superadmin']), createResult);
router.get('/', verifyToken(['admin', 'superadmin']), getAllResults);
router.put('/:id', verifyToken(['admin', 'superadmin']), updateResult);
router.delete('/:id', verifyToken(['admin', 'superadmin']), deleteResult);

// Shared route for specific user (Student/Parent) or admin preview
router.get('/student', verifyToken(['student', 'parent', 'admin', 'superadmin']), getStudentResults);

export default router;
