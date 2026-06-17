import express from 'express';
import { getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial } from '../controllers/testimonialController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/public', getTestimonials); // Publicly accessible without token
router.get('/', verifyToken(['admin', 'superadmin']), getTestimonials);
router.post('/', verifyToken(['admin', 'superadmin']), createTestimonial);
router.put('/:id', verifyToken(['admin', 'superadmin']), updateTestimonial);
router.delete('/:id', verifyToken(['admin', 'superadmin']), deleteTestimonial);

export default router;
