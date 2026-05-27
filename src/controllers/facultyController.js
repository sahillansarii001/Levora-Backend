import { Faculty } from '../models.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/responseHelper.js';
import bcrypt from 'bcryptjs';

const getFaculties = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const count = await Faculty.countDocuments({ status: 'active' });
    const faculties = await Faculty.find({ status: 'active' })
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    paginatedResponse(res, faculties, page, limit, count, 'Faculties fetched successfully');
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

const getFacultyById = async (req, res) => {
  try {
    const { id } = req.params;

    const faculty = await Faculty.findById(id).select('-password');

    if (!faculty || faculty.status !== 'active') {
      return errorResponse(res, 'Faculty not found', [], 404);
    }

    successResponse(res, 'Faculty fetched successfully', faculty);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

const createFaculty = async (req, res) => {
  try {
    const { name, email, phone, subject, experience, qualification, password } = req.body;

    const existingFaculty = await Faculty.findOne({ email });
    if (existingFaculty) {
      return errorResponse(res, 'Email already exists', [], 400);
    }

    const newPassword = password || process.env.DEFAULT_PASSWORD || 'Levora123!';

    const faculty = new Faculty({
      facultyId: 'FAC' + Date.now().toString().slice(-6),
      name,
      email,
      phone,
      subject,
      experience,
      qualification,
      password: newPassword,
      status: 'active',
      role: 'faculty'
    });

    await faculty.save();

    successResponse(res, 'Faculty created successfully', {
      id: faculty._id,
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

    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    }

    const faculty = await Faculty.findByIdAndUpdate(id, updates, { new: true }).select('-password');
    if (!faculty) {
      return errorResponse(res, 'Faculty not found', [], 404);
    }

    successResponse(res, 'Faculty updated successfully', faculty);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

const deleteFaculty = async (req, res) => {
  try {
    const { id } = req.params;

    const faculty = await Faculty.findById(id);
    if (!faculty) {
      return errorResponse(res, 'Faculty not found', [], 404);
    }

    faculty.status = 'inactive';
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
