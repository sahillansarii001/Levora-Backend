import express from 'express';
const router = express.Router();
import { 
  submitAdmission,
  getAdmissions,
  updateAdmissionStatus,
  getAdmissionsHero,
  getAdmissionsPrograms,
  getAdmissionsSteps,
  getAdmissionsFaqs
 } from '../controllers/admissionController.js';
import {  verifyToken  } from '../middleware/auth.js';

router.post('/', submitAdmission);
router.get('/', verifyToken(['admin']), getAdmissions);
router.put('/:id/status', verifyToken(['admin']), updateAdmissionStatus);

// Public API routes for Admissions Page
router.get('/hero', getAdmissionsHero);
router.get('/programs', getAdmissionsPrograms);
router.get('/steps', getAdmissionsSteps);
router.get('/faqs', getAdmissionsFaqs);

export default router;
