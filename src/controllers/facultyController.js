import prisma from '../config/prisma.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/responseHelper.js';
import bcrypt from 'bcryptjs';

const getFaculties = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const count = await prisma.faculty.count({ where: { status: 'active' } });
    const faculties = await prisma.faculty.findMany({
      where: { status: 'active' },
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        facultyId: true,
        name: true,
        email: true,
        phone: true,
        subject: true,
        experience: true,
        qualification: true,
        status: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    paginatedResponse(res, faculties, page, limit, count, 'Faculties fetched successfully');
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

const getFacultyById = async (req, res) => {
  try {
    const { id } = req.params;

    const faculty = await prisma.faculty.findUnique({
      where: { id },
      select: {
        id: true,
        facultyId: true,
        name: true,
        email: true,
        phone: true,
        subject: true,
        experience: true,
        qualification: true,
        status: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

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

    const existingFaculty = await prisma.faculty.findUnique({ where: { email } });
    if (existingFaculty) {
      return errorResponse(res, 'Email already exists', [], 400);
    }

    const newPassword = password || process.env.DEFAULT_PASSWORD || 'Levora123!';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const faculty = await prisma.faculty.create({
      data: {
        facultyId: 'FAC' + Date.now().toString().slice(-6),
        name,
        email,
        phone,
        subject,
        experience: experience || '',
        qualification: qualification || '',
        password: hashedPassword,
        status: 'active',
        role: 'faculty'
      }
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
    const updates = { ...req.body };

    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    }

    const faculty = await prisma.faculty.update({
      where: { id },
      data: updates,
      select: {
        id: true,
        facultyId: true,
        name: true,
        email: true,
        phone: true,
        subject: true,
        experience: true,
        qualification: true,
        status: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    successResponse(res, 'Faculty updated successfully', faculty);
  } catch (error) {
    if (error.code === 'P2025') {
      return errorResponse(res, 'Faculty not found', [], 404);
    }
    errorResponse(res, error.message, [], 500);
  }
};

const deleteFaculty = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.faculty.update({
      where: { id },
      data: { status: 'inactive' }
    });

    successResponse(res, 'Faculty deleted successfully', {});
  } catch (error) {
    if (error.code === 'P2025') {
      return errorResponse(res, 'Faculty not found', [], 404);
    }
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
