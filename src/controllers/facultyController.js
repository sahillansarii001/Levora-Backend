import {  Faculty  } from '../models.js';
import {  successResponse, errorResponse, paginatedResponse  } from '../utils/responseHelper.js';
import bcrypt from 'bcryptjs';

const getFaculties = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { rows, count } = await Faculty.findAndCountAll({
      where: { isActive: true },
      attributes: { exclude: ['password'] },
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']],
    });

    paginatedResponse(res, rows, page, limit, count, 'Faculties fetched successfully');
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

const getFacultyById = async (req, res) => {
  try {
    const { id } = req.params;

    const faculty = await Faculty.findByPk(id, {
      attributes: { exclude: ['password'] },
    });

    if (!faculty || !faculty.isActive) {
      return errorResponse(res, 'Faculty not found', [], 404);
    }

    successResponse(res, 'Faculty fetched successfully', faculty);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

const createFaculty = async (req, res) => {
  try {
    const { name, email, phone, subject, experience, qualification, bio } = req.body;

    const existingFaculty = await Faculty.findOne({ where: { email } });
    if (existingFaculty) {
      return errorResponse(res, 'Email already exists', [], 400);
    }

    const hashedPassword = await bcrypt.hash(process.env.DEFAULT_PASSWORD || 'Password123', 12);

    const faculty = await Faculty.create({
      name,
      email,
      phone,
      subject,
      experience,
      qualification,
      bio,
      password: hashedPassword,
    });

    successResponse(res, 'Faculty created successfully', {
      id: faculty.id,
      name,
      email,
      subject,
    }, 201);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

const updateFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const faculty = await Faculty.findByPk(id);
    if (!faculty) {
      return errorResponse(res, 'Faculty not found', [], 404);
    }

    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 12);
    }

    await faculty.update(updates);
    successResponse(res, 'Faculty updated successfully', faculty);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

const deleteFaculty = async (req, res) => {
  try {
    const { id } = req.params;

    const faculty = await Faculty.findByPk(id);
    if (!faculty) {
      return errorResponse(res, 'Faculty not found', [], 404);
    }

    faculty.isActive = false;
    await faculty.save();

    successResponse(res, 'Faculty deleted successfully', {});
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

export {
  getFaculties,
  getFacultyById,
  createFaculty,
  updateFaculty,
  deleteFaculty,
};
