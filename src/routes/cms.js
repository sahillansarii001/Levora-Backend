import express from 'express';
const router = express.Router();
import { verifyToken } from '../middleware/auth.js';
import * as cmsController from '../controllers/cmsController.js';
import multer from 'multer';
import path from 'path';

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'cms-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

const requireSuperAdmin = verifyToken(['superadmin']);

// File Upload
router.post('/upload', requireSuperAdmin, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    res.status(200).json({ success: true, url: imageUrl });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Notices
router.get('/notices', requireSuperAdmin, cmsController.getAllNotices);
router.post('/notices', requireSuperAdmin, cmsController.createNotice);
router.put('/notices/:id', requireSuperAdmin, cmsController.updateNotice);
router.delete('/notices/:id', requireSuperAdmin, cmsController.deleteNotice);

// Website Content
router.get('/content', cmsController.getContent); // Public
router.put('/content', requireSuperAdmin, cmsController.updateContent);

// Courses
router.get('/courses', cmsController.getCourses); // Public
router.post('/courses', requireSuperAdmin, cmsController.createCourse);
router.put('/courses/:id', requireSuperAdmin, cmsController.updateCourse);
router.delete('/courses/:id', requireSuperAdmin, cmsController.deleteCourse);

// Faculty
router.get('/faculty', cmsController.getFaculty); // Public
router.post('/faculty', requireSuperAdmin, cmsController.createFaculty);
router.put('/faculty/:id', requireSuperAdmin, cmsController.updateFaculty);
router.delete('/faculty/:id', requireSuperAdmin, cmsController.deleteFaculty);

// Study Materials
router.get('/materials', cmsController.getMaterials); // Public
router.post('/materials', requireSuperAdmin, cmsController.createMaterial);
router.put('/materials/:id', requireSuperAdmin, cmsController.updateMaterial);
router.delete('/materials/:id', requireSuperAdmin, cmsController.deleteMaterial);

// Results
router.get('/results', cmsController.getResults); // Public
router.post('/results', requireSuperAdmin, cmsController.createResult);
router.put('/results/:id', requireSuperAdmin, cmsController.updateResult);
router.delete('/results/:id', requireSuperAdmin, cmsController.deleteResult);

import * as testimonialController from '../controllers/testimonialController.js';
// Testimonials
router.get('/testimonials', testimonialController.getTestimonials); // Public
router.post('/testimonials', requireSuperAdmin, testimonialController.createTestimonial);
router.put('/testimonials/:id', requireSuperAdmin, testimonialController.updateTestimonial);
router.delete('/testimonials/:id', requireSuperAdmin, testimonialController.deleteTestimonial);

export default router;
