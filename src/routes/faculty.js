import express from 'express';
const router = express.Router();
import { 
  getFaculties,
  getFacultyById,
  createFaculty,
  updateFaculty,
  deleteFaculty,
 } from '../controllers/facultyController.js';
import {  verifyToken  } from '../middleware/auth.js';

router.get('/', getFaculties);
router.get('/:id', getFacultyById);
router.post('/', verifyToken(['admin']), createFaculty);
router.put('/:id', verifyToken(['admin']), updateFaculty);
router.delete('/:id', verifyToken(['admin']), deleteFaculty);

export default router;
