import prisma from '../config/prisma.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/responseHelper.js';

export const createResult = async (req, res) => {
  try {
    const { studentId, examName, subject, marksObtained, totalMarks, remarks, examDate } = req.body;

    if (!studentId || !examName || !subject || marksObtained === undefined || !totalMarks) {
      return errorResponse(res, 'All required fields must be provided', [], 400);
    }

    const result = await prisma.examResult.create({
      data: {
        studentId,
        examName,
        subject,
        marksObtained: parseFloat(marksObtained),
        totalMarks: parseFloat(totalMarks),
        remarks: remarks || '',
        examDate: examDate ? new Date(examDate) : new Date()
      }
    });

    const populatedResult = await prisma.examResult.findUnique({
      where: { id: result.id },
      include: {
        // Assume student relation is configured in Prisma schema (we might just fetch it manually if it fails)
      }
    });

    successResponse(res, 'Exam result logged successfully', populatedResult || result, 201);
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
      const students = await prisma.student.findMany({
        where: { name: { contains: search, mode: 'insensitive' } },
        select: { id: true }
      });
      const studentIds = students.map(s => s.id);
      filter.studentId = { in: studentIds };
    }

    const count = await prisma.examResult.count({ where: filter });
    const results = await prisma.examResult.findMany({
      where: filter,
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

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
      const parent = await prisma.parent.findUnique({ where: { id: req.user.id } });
      if (!parent || !parent.childrenIds || parent.childrenIds.length === 0) {
        return successResponse(res, 'No student linked to this parent account', []);
      }
      studentIdToFetch = parent.childrenIds[0];
    } else if (role === 'admin' || role === 'superadmin') {
       const results = await prisma.examResult.findMany({
         orderBy: { createdAt: 'desc' },
         take: 10
       });
       return successResponse(res, 'Admin Preview: Results fetched successfully', results);
    }

    if (!studentIdToFetch) {
      return errorResponse(res, 'Unauthorized to view these results', [], 403);
    }

    const results = await prisma.examResult.findMany({
      where: { studentId: studentIdToFetch },
      orderBy: [
        { examDate: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    successResponse(res, 'Student results fetched successfully', results);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

export const updateResult = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };
    if (updates.marksObtained !== undefined) updates.marksObtained = parseFloat(updates.marksObtained);
    if (updates.totalMarks !== undefined) updates.totalMarks = parseFloat(updates.totalMarks);
    if (updates.examDate) updates.examDate = new Date(updates.examDate);

    const result = await prisma.examResult.update({
      where: { id },
      data: updates
    });

    successResponse(res, 'Result updated successfully', result);
  } catch (error) {
    if (error.code === 'P2025') {
      return errorResponse(res, 'Result not found', [], 404);
    }
    errorResponse(res, error.message, [], 500);
  }
};

export const deleteResult = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.examResult.delete({ where: { id } });
    
    successResponse(res, 'Result deleted successfully', null);
  } catch (error) {
    if (error.code === 'P2025') {
      return errorResponse(res, 'Result not found', [], 404);
    }
    errorResponse(res, error.message, [], 500);
  }
};
