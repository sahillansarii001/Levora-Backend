import prisma from '../config/prisma.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/responseHelper.js';

const getCourses = async (req, res) => {
  try {
    const { category, mode, batch, facultyId, page = 1, limit = 10 } = req.query;
    const where = { status: 'active' };

    if (category) where.category = category;
    if (mode) where.mode = mode;
    if (batch) where.batches = { has: batch }; // PostgreSQL handles array inclusion with `has` in Prisma
    if (facultyId) where.facultyId = facultyId;

    const offset = (page - 1) * limit;
    
    const count = await prisma.course.count({ where });
    const courses = await prisma.course.findMany({
      where,
      skip: offset,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    // Attach completed lessons count from LectureLog
    for (let course of courses) {
      const baseSubject = course.title.split(/[-\s]+/)[0].trim();
      
      const logsCount = await prisma.lectureLog.count({
        where: { subject: { contains: baseSubject, mode: 'insensitive' } }
      });
      
      const latestLog = await prisma.lectureLog.findFirst({
        where: { subject: { contains: baseSubject, mode: 'insensitive' } },
        orderBy: { date: 'desc' }
      });
        
      course.completedLessons = logsCount;
      course.totalLessons = course.totalLessons || 30; // Default to 30 if not specified
      
      let facultyName = null;
      if (course.facultyId) {
        // Fetch faculty name manually because we didn't include it in relations yet
        // In prisma we'd do include: { faculty: true } if schema has relation
        // Let's assume we fetch it if we have ID
        const faculty = await prisma.faculty.findUnique({ where: { id: course.facultyId } });
        facultyName = faculty?.name || null;
      }

      if (!facultyName && latestLog && latestLog.facultyId) {
        const logFaculty = await prisma.faculty.findUnique({ where: { id: latestLog.facultyId } });
        facultyName = logFaculty?.name || null;
      }
      
      course.facultyName = facultyName;
    }

    paginatedResponse(res, courses, page, limit, count, 'Courses fetched successfully');
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

const getCourseBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const course = await prisma.course.findFirst({
      where: { courseCode: slug, status: 'active' }
    });
    if (!course) {
      return errorResponse(res, 'Course not found', [], 404);
    }

    successResponse(res, 'Course fetched successfully', course);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

const createCourse = async (req, res) => {
  try {
    const { title, courseCode, description, category, duration, fee, mode, batches, facultyId, totalStudents } = req.body;

    const existingCourse = await prisma.course.findUnique({ where: { courseCode } });
    if (existingCourse) {
      return errorResponse(res, 'Course code already exists', [], 400);
    }

    const course = await prisma.course.create({
      data: {
        title: title || '',
        courseCode,
        description: description || '',
        category: category || '',
        duration: duration || '',
        fee: fee ? parseFloat(fee) : 0,
        mode: mode || '',
        batches: batches || [],
        facultyId: facultyId || null,
        totalStudents: totalStudents || 0,
        status: 'active'
      }
    });

    successResponse(res, 'Course created successfully', course, 201);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    if (updates.fee !== undefined) updates.fee = parseFloat(updates.fee);

    const course = await prisma.course.update({
      where: { id },
      data: updates
    });

    successResponse(res, 'Course updated successfully', course);
  } catch (error) {
    if (error.code === 'P2025') {
      return errorResponse(res, 'Course not found', [], 404);
    }
    errorResponse(res, error.message, [], 500);
  }
};

const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.course.delete({ where: { id } });

    successResponse(res, 'Course deleted successfully', {});
  } catch (error) {
    if (error.code === 'P2025') {
      return errorResponse(res, 'Course not found', [], 404);
    }
    errorResponse(res, error.message, [], 500);
  }
};

export {
  getCourses,
  getCourseBySlug,
  createCourse,
  updateCourse,
  deleteCourse,
};
