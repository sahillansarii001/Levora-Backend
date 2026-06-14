import express from 'express';
const router = express.Router();
import { 
  submitAdmission,
  submitPublicAdmission,
  getAdmissions,
  updateAdmissionStatus,
  deleteAdmission,
  getAdmissionsHero,
  getAdmissionsPrograms,
  getAdmissionsSteps,
  getAdmissionsFaqs
 } from '../controllers/admissionController.js';
import {  verifyToken  } from '../middleware/auth.js';

router.post('/', submitAdmission);
router.get('/', verifyToken(['admin', 'superadmin']), getAdmissions);
router.put('/:id/status', verifyToken(['admin', 'superadmin']), updateAdmissionStatus);
router.delete('/:id', verifyToken(['admin', 'superadmin']), deleteAdmission);

// Public API routes for Admissions Page
router.post('/public', submitPublicAdmission);
router.get('/hero', getAdmissionsHero);
router.get('/programs', getAdmissionsPrograms);
router.get('/steps', getAdmissionsSteps);
router.get('/faqs', getAdmissionsFaqs);

export default router;
