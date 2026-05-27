import { Attendance, Student, Faculty } from '../models.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/responseHelper.js';

const getAttendance = async (req, res) => {
  try {
    const { page = 1, limit = 10, userType } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (userType) filter.userType = userType;

    const count = await Attendance.countDocuments(filter);
    const records = await Attendance.find(filter)
      .populate('studentId', 'name studentId className batch')
      .populate('facultyId', 'name email subject')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ date: -1 });

    paginatedResponse(res, records, page, limit, count, 'Attendance records fetched successfully');
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

const createAttendance = async (req, res) => {
  try {
    const { userType, studentId, facultyId, date, status, remarks } = req.body;

    const newRecord = new Attendance({
      userType,
      studentId: userType === 'student' ? studentId : undefined,
      facultyId: userType === 'faculty' ? facultyId : undefined,
      date,
      status,
      remarks
    });

    await newRecord.save();
    successResponse(res, 'Attendance marked successfully', newRecord, 201);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const record = await Attendance.findByIdAndUpdate(id, updates, { new: true });
    if (!record) return errorResponse(res, 'Record not found', [], 404);

    successResponse(res, 'Attendance updated successfully', record);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

const deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await Attendance.findByIdAndDelete(id);
    if (!record) return errorResponse(res, 'Record not found', [], 404);

    successResponse(res, 'Attendance deleted successfully', {});
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

export { getAttendance, createAttendance, updateAttendance, deleteAttendance };
