import ExamResult from '../models/ExamResult.js';
import Student from '../models/Student.js';
import Parent from '../models/Parent.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/responseHelper.js';

export const createResult = async (req, res) => {
  try {
    const { studentId, examName, subject, marksObtained, totalMarks, remarks, examDate } = req.body;

    if (!studentId || !examName || !subject || marksObtained === undefined || !totalMarks) {
      return errorResponse(res, 'All required fields must be provided', [], 400);
    }

    const result = await ExamResult.create({
      studentId,
      examName,
      subject,
      marksObtained,
      totalMarks,
      remarks,
      examDate
    });

    const populatedResult = await ExamResult.findById(result._id).populate('studentId', 'name studentId');
    successResponse(res, 'Exam result logged successfully', populatedResult, 201);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

export const getAllResults = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;

    let filter = {};
    if (search) {
      // Find students matching the search to filter results
      const students = await Student.find({ name: { $regex: search, $options: 'i' } });
      const studentIds = students.map(s => s._id);
      filter.studentId = { $in: studentIds };
    }

    const count = await ExamResult.countDocuments(filter);
    const results = await ExamResult.find(filter)
      .populate('studentId', 'name studentId className')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    paginatedResponse(res, results, page, limit, count, 'Exam results fetched successfully');
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

export const getStudentResults = async (req, res) => {
  try {
    const role = req.user.role;
    let studentIdToFetch = null;

    if (role === 'student') {
      studentIdToFetch = req.user.id;
    } else if (role === 'parent') {
      const parent = await Parent.findById(req.user.id).populate('childrenIds');
      if (!parent || !parent.childrenIds || parent.childrenIds.length === 0) {
        return successResponse(res, 'No student linked to this parent account', []);
      }
      studentIdToFetch = parent.childrenIds[0]._id;
    } else if (role === 'admin' || role === 'superadmin') {
       const results = await ExamResult.find().populate('studentId', 'name studentId className').sort({ createdAt: -1 }).limit(10);
       return successResponse(res, 'Admin Preview: Results fetched successfully', results);
    }

    if (!studentIdToFetch) {
      return errorResponse(res, 'Unauthorized to view these results', [], 403);
    }

    const results = await ExamResult.find({ studentId: studentIdToFetch })
      .populate('studentId', 'name studentId className')
      .sort({ examDate: -1, createdAt: -1 });

    successResponse(res, 'Student results fetched successfully', results);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

export const updateResult = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const result = await ExamResult.findByIdAndUpdate(id, updates, { new: true }).populate('studentId', 'name studentId');
    if (!result) {
      return errorResponse(res, 'Result not found', [], 404);
    }

    successResponse(res, 'Result updated successfully', result);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

export const deleteResult = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await ExamResult.findByIdAndDelete(id);
    if (!result) {
      return errorResponse(res, 'Result not found', [], 404);
    }
    successResponse(res, 'Result deleted successfully', null);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};
