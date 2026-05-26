import {  Course  } from '../models.js';
import {  successResponse, errorResponse, paginatedResponse  } from '../utils/responseHelper.js';

const getCourses = async (req, res) => {
  try {
    const { category, board, page = 1, limit = 10 } = req.query;
    const where = { isActive: true };

    if (category) where.category = category;
    if (board) where.board = board;

    const offset = (page - 1) * limit;
    const { rows, count } = await Course.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']],
    });

    paginatedResponse(res, rows, page, limit, count, 'Courses fetched successfully');
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

const getCourseBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const course = await Course.findOne({ where: { slug, isActive: true } });
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
    const { title, slug, description, category, duration, fees, thumbnailUrl } = req.body;

    const existingCourse = await Course.findOne({ where: { slug } });
    if (existingCourse) {
      return errorResponse(res, 'Course slug already exists', [], 400);
    }

    const course = await Course.create({
      title,
      slug,
      description,
      category,
      duration,
      fees,
      thumbnailUrl,
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

    const course = await Course.findByPk(id);
    if (!course) {
      return errorResponse(res, 'Course not found', [], 404);
    }

    await course.update(updates);
    successResponse(res, 'Course updated successfully', course);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findByPk(id);
    if (!course) {
      return errorResponse(res, 'Course not found', [], 404);
    }

    await course.destroy();
    successResponse(res, 'Course deleted successfully', {});
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

module.exports = {
  getCourses,
  getCourseBySlug,
  createCourse,
  updateCourse,
  deleteCourse,
};
