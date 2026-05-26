import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: false, // Allow loading images from different origins if needed
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Import routes
import authRoutes from './routes/auth.js';
import cmsRoutes from './routes/cms.js';
/*
import courseRoutes from './routes/courses.js';
import facultyRoutes from './routes/faculty.js';
import materialRoutes from './routes/materials.js';
import admissionRoutes from './routes/admissions.js';
import studentRoutes from './routes/student.js';
import parentRoutes from './routes/parent.js';
import attendanceRoutes from './routes/attendance.js';
import testRoutes from './routes/tests.js';
import feeRoutes from './routes/fees.js';
import blogRoutes from './routes/blog.js';
import adminRoutes from './routes/admin.js';
import contactRoutes from './routes/contact.js';
import noticeRoutes from './routes/notices.js';
*/

import { generalLimiter } from './middleware/rateLimiter.js';
app.use(generalLimiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/cms', cmsRoutes);

/*
app.use('/api/courses', courseRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/admissions', admissionRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/parent', parentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/notices', noticeRoutes);
*/

// Health check route
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running with MongoDB and ES Modules',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handler
// import errorHandler from './middleware/errorHandler.js';
// app.use(errorHandler);

export default app;
