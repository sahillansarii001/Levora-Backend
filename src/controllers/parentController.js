import { Parent } from '../models.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/responseHelper.js';
import bcrypt from 'bcryptjs';

const getParents = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const count = await Parent.countDocuments();
    const parents = await Parent.find()
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    paginatedResponse(res, parents, page, limit, count, 'Parents fetched successfully');
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

const getParentById = async (req, res) => {
  try {
    const { id } = req.params;
    const parent = await Parent.findById(id).select('-password');

    if (!parent) {
      return errorResponse(res, 'Parent not found', [], 404);
    }

    successResponse(res, 'Parent fetched successfully', parent);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

const createParent = async (req, res) => {
  try {
    const { name, email, phone, password, parentOf } = req.body;

    const existingParent = await Parent.findOne({ email });
    if (existingParent) {
      return errorResponse(res, 'Email already exists', [], 400);
    }

    const newPassword = password || process.env.DEFAULT_PASSWORD || 'Levora123!';

    const parent = new Parent({
      name,
      email,
      phone,
      password: newPassword,
      parentOf
    });

    await parent.save();

    successResponse(res, 'Parent created successfully', {
      id: parent._id,
      name: parent.name,
      email: parent.email,
    }, 201);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

const updateParent = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    }

    const parent = await Parent.findByIdAndUpdate(id, updates, { new: true }).select('-password');
    if (!parent) {
      return errorResponse(res, 'Parent not found', [], 404);
    }

    successResponse(res, 'Parent updated successfully', parent);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

const deleteParent = async (req, res) => {
  try {
    const { id } = req.params;

    const parent = await Parent.findByIdAndDelete(id);
    if (!parent) {
      return errorResponse(res, 'Parent not found', [], 404);
    }

    successResponse(res, 'Parent deleted successfully', {});
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

export {
  getParents,
  getParentById,
  createParent,
  updateParent,
  deleteParent,
};
