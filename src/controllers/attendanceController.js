import prisma from '../config/prisma.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/responseHelper.js';

const getAttendance = async (req, res) => {
  try {
    const { page = 1, limit = 1000, userType, date, fromDate, toDate, studentId, facultyId } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (userType) filter.userType = userType;
    if (studentId && studentId !== 'undefined') filter.studentId = studentId;
    if (facultyId && facultyId !== 'undefined') filter.facultyId = facultyId;

    if (req.user && req.user.role === 'student') {
      filter.userType = 'student';
      filter.studentId = req.user.id;
    } else if (studentId === 'undefined' && req.user && (req.user.role === 'admin' || req.user.role === 'superadmin')) {
      delete filter.studentId;
    }

    if (date) {
      filter.date = new Date(date);
    } else if (fromDate || toDate) {
      filter.date = {};
      if (fromDate) filter.date.gte = new Date(fromDate);
      if (toDate) {
        let endDate = new Date(toDate);
        endDate.setHours(23, 59, 59, 999);
        filter.date.lte = endDate;
      }
    }

    const count = await prisma.attendance.count({ where: filter });
    
    // Using simple query since raw studentId/facultyId will be returned by default in Prisma.
    // If we wanted to "populate", we would need relationships setup in schema.prisma.
    // Since there are no relations defined for attendance -> student/faculty in schema.prisma yet,
    // we'll fetch them manually if needed or just return raw ids.
    // To keep it simple, we'll return raw for now.
    const records = await prisma.attendance.findMany({
      where: filter,
      skip,
      take: parseInt(limit),
      orderBy: { date: 'desc' }
    });

    paginatedResponse(res, records, page, limit, count, 'Attendance records fetched successfully');
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

const createAttendance = async (req, res) => {
  try {
    const { userType, studentId, facultyId, date, status, remarks } = req.body;

    const newRecord = await prisma.attendance.create({
      data: {
        userType,
        studentId: userType === 'student' ? studentId : null,
        facultyId: userType === 'faculty' ? facultyId : null,
        date: date ? new Date(date) : new Date(),
        status,
        remarks: remarks || ''
      }
    });

    successResponse(res, 'Attendance marked successfully', newRecord, 201);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (updates.date) updates.date = new Date(updates.date);

    const record = await prisma.attendance.update({
      where: { id },
      data: updates
    });

    successResponse(res, 'Attendance updated successfully', record);
  } catch (error) {
    if (error.code === 'P2025') {
      return errorResponse(res, 'Record not found', [], 404);
    }
    errorResponse(res, error.message, [], 500);
  }
};

const deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.attendance.delete({ where: { id } });

    successResponse(res, 'Attendance deleted successfully', {});
  } catch (error) {
    if (error.code === 'P2025') {
      return errorResponse(res, 'Record not found', [], 404);
    }
    errorResponse(res, error.message, [], 500);
  }
};

export { getAttendance, createAttendance, updateAttendance, deleteAttendance };
