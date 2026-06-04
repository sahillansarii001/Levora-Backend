import {  Course  } from '../models.js';
import {  successResponse, errorResponse, paginatedResponse  } from '../utils/responseHelper.js';

const getCourses = async (req, res) => {
  try {
    const { category, mode, page = 1, limit = 10 } = req.query;
    const where = { status: 'active' };

    if (category) where.category = category;
    if (mode) where.mode = mode;

    const offset = (page - 1) * limit;
    
    const count = await Course.countDocuments(where);
    const rows = await Course.find(where)
      .skip(offset)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    paginatedResponse(res, rows, page, limit, count, 'Courses fetched successfully');
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
    const { title, courseCode, description, category, duration, fee, mode } = req.body;

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
