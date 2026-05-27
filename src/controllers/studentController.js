import { Student } from '../models.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/responseHelper.js';
import bcrypt from 'bcryptjs';

const getStudents = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const count = await Student.countDocuments({ status: 'active' });
    const students = await Student.find({ status: 'active' })
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    paginatedResponse(res, students, page, limit, count, 'Students fetched successfully');
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findById(id).select('-password');

    if (!student || student.status !== 'active') {
      return errorResponse(res, 'Student not found', [], 404);
    }

    successResponse(res, 'Student fetched successfully', student);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

const createStudent = async (req, res) => {
  try {
    const { name, email, phone, password, className, board, course, batch, parentName, schoolName, collegeName } = req.body;

    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return errorResponse(res, 'Email already exists', [], 400);
    }

    const newPassword = password || process.env.DEFAULT_PASSWORD || 'Levora123!';
    const studentId = 'STU-' + Math.floor(1000 + Math.random() * 9000);

    const student = new Student({
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
      password: newPassword,
      status: 'active'
    });

    await student.save();

    successResponse(res, 'Student created successfully', {
      id: student._id,
      studentId: student.studentId,
      name: student.name,
      email: student.email,
    }, 201);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    }

    const student = await Student.findByIdAndUpdate(id, updates, { new: true }).select('-password');
    if (!student) {
      return errorResponse(res, 'Student not found', [], 404);
    }

    successResponse(res, 'Student updated successfully', student);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id);
    if (!student) {
      return errorResponse(res, 'Student not found', [], 404);
    }

    student.status = 'inactive';
    await student.save();

    successResponse(res, 'Student deleted successfully', {});
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

export {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
};
