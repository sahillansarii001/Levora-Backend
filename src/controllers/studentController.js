import prisma from '../config/prisma.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/responseHelper.js';
import bcrypt from 'bcryptjs';

const getStudents = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const count = await prisma.student.count({ where: { status: 'active' } });
    const students = await prisma.student.findMany({
      where: { status: 'active' },
      skip: skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    const studentsWithoutPassword = students.map(({ password, ...rest }) => rest);

    paginatedResponse(res, studentsWithoutPassword, page, limit, count, 'Students fetched successfully');
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await prisma.student.findUnique({ where: { id } });

    if (!student || student.status !== 'active') {
      return errorResponse(res, 'Student not found', [], 404);
    }

    const { password, ...studentWithoutPassword } = student;
    successResponse(res, 'Student fetched successfully', studentWithoutPassword);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

const getStudentProfile = async (req, res) => {
  try {
    const student = await prisma.student.findUnique({ where: { id: req.user.id } });

    if (!student || student.status !== 'active') {
      return errorResponse(res, 'Student not found', [], 404);
    }

    const { password, ...studentWithoutPassword } = student;
    successResponse(res, 'Student profile fetched successfully', studentWithoutPassword);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

const createStudent = async (req, res) => {
  try {
    const { name, email, phone, password, className, board, course, batch, parentName, schoolName, collegeName, totalFees } = req.body;

    const existingStudent = await prisma.student.findUnique({ where: { email } });
    if (existingStudent) {
      return errorResponse(res, 'Email already exists', [], 400);
    }

    const newPassword = password || process.env.DEFAULT_PASSWORD || 'Levora123!';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const studentId = 'STU-' + Math.floor(1000 + Math.random() * 9000);

    const student = await prisma.student.create({
      data: {
        studentId,
        name,
        email,
        phone,
        className,
        board,
        course,
        batch,
        parentName,
        schoolName,
        collegeName,
        password: hashedPassword,
        totalFees: totalFees ? parseFloat(totalFees) : 0,
        status: 'active'
      }
    });

    successResponse(res, 'Student created successfully', {
      id: student.id,
      studentId: student.studentId,
      name: student.name,
      email: student.email,
      totalFees: student.totalFees,
    }, 201);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    }

    const student = await prisma.student.update({
      where: { id },
      data: updates
    });

    const { password, ...studentWithoutPassword } = student;
    successResponse(res, 'Student updated successfully', studentWithoutPassword);
  } catch (error) {
    if (error.code === 'P2025') {
      return errorResponse(res, 'Student not found', [], 404);
    }
    errorResponse(res, error.message, [], 500);
  }
};

const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.student.update({
      where: { id },
      data: { status: 'inactive' }
    });

    successResponse(res, 'Student deleted successfully', {});
  } catch (error) {
    if (error.code === 'P2025') {
      return errorResponse(res, 'Student not found', [], 404);
    }
    errorResponse(res, error.message, [], 500);
  }
};

const getStudentFees = async (req, res) => {
  try {
    if (req.user.role === 'admin' || req.user.role === 'superadmin') {
      const fees = await prisma.feeRecord.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' }
      });
      return successResponse(res, 'Admin Preview: Fee records fetched', { totalCourseFee: 50000, records: fees });
    }

    const student = await prisma.student.findUnique({ where: { id: req.user.id } });
    const fees = await prisma.feeRecord.findMany({
      where: { studentId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });

    successResponse(res, 'Student fee records fetched successfully', {
      totalCourseFee: student?.totalFees || 0,
      records: fees
    });
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

export {
  getStudents,
  getStudentById,
  getStudentProfile,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentFees
};
