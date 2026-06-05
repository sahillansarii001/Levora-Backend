import express from 'express';
const router = express.Router();
import { 
  getCourses,
  getCourseBySlug,
  createCourse,
  updateCourse,
  deleteCourse,
 } from '../controllers/courseController.js';
import {  verifyToken  } from '../middleware/auth.js';

router.get('/', getCourses);
router.get('/:slug', getCourseBySlug);
router.post('/', verifyToken(['admin', 'superadmin']), createCourse);
router.put('/:id', verifyToken(['admin', 'superadmin']), updateCourse);
router.delete('/:id', verifyToken(['admin', 'superadmin']), deleteCourse);

export default router;
