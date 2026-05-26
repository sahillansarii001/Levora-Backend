import express from 'express';
const router = express.Router();
import { 
  submitAdmission,
  getAdmissions,
  updateAdmissionStatus,
 } from '../controllers/admissionController.js';
import {  verifyToken  } from '../middleware/auth.js';

router.post('/', submitAdmission);
router.get('/', verifyToken(['admin']), getAdmissions);
router.put('/:id/status', verifyToken(['admin']), updateAdmissionStatus);

export default router;
