import {  Course, LectureLog  } from '../models.js';
import {  successResponse, errorResponse, paginatedResponse  } from '../utils/responseHelper.js';

const getCourses = async (req, res) => {
  try {
    const { category, mode, batch, facultyId, page = 1, limit = 10 } = req.query;
    const where = { status: 'active' };

    if (category) where.category = category;
    if (mode) where.mode = mode;
    if (batch) where.batches = batch; // MongoDB handles array inclusion automatically
    if (facultyId) where.facultyId = facultyId;

    const offset = (page - 1) * limit;
    
    const count = await Course.countDocuments(where);
    const courses = await Course.find(where)
      .skip(offset)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .populate('facultyId', 'name email')
      .lean();

    // Attach completed lessons count from LectureLog
    for (let course of courses) {
      const baseSubject = course.title.split(/[-\s]+/)[0].trim();
      const logQuery = { subject: new RegExp(baseSubject, 'i') };
      
      const logsCount = await LectureLog.countDocuments(logQuery);
      const latestLog = await LectureLog.findOne(logQuery)
        .sort({ date: -1 })
        .populate('facultyId', 'name');
        
      course.completedLessons = logsCount;
      course.totalLessons = course.totalLessons || 30; // Default to 30 if not specified
      
      // Prefer the directly assigned facultyName if available, else fallback to latestLog
      if (course.facultyId && course.facultyId.name) {
        course.facultyName = course.facultyId.name;
      } else {
        course.facultyName = latestLog?.facultyId?.name || null;
      }
    }

    paginatedResponse(res, courses, page, limit, count, 'Courses fetched successfully');
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

const getCourseBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const course = await Course.findOne({ courseCode: slug, status: 'active' });
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

    const existingCourse = await Course.findOne({ courseCode });
    if (existingCourse) {
      return errorResponse(res, 'Course code already exists', [], 400);
    }

    const course = await Course.create({
      title,
      courseCode,
      description,
      category,
      duration,
      fee,
      mode,
      batches: batches || [],
      facultyId: facultyId || null,
      totalStudents: totalStudents || 0,
    });

    successResponse(res, 'Course created successfully', course, 201);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const course = await Course.findByIdAndUpdate(id, updates, { new: true });
    if (!course) {
      return errorResponse(res, 'Course not found', [], 404);
    }

    successResponse(res, 'Course updated successfully', course);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findByIdAndDelete(id);
    if (!course) {
      return errorResponse(res, 'Course not found', [], 404);
    }

    successResponse(res, 'Course deleted successfully', {});
  } catch (error) {
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
