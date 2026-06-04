import { LectureLog } from '../models.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/responseHelper.js';

export const getLectureLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, facultyId, date } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (facultyId) filter.facultyId = facultyId;
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      filter.date = { $gte: startOfDay, $lte: endOfDay };
    }

    const count = await LectureLog.countDocuments(filter);
    const logs = await LectureLog.find(filter)
      .populate('facultyId', 'name subject email')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ date: -1, createdAt: -1 });

    paginatedResponse(res, logs, page, limit, count, 'Lecture logs fetched successfully');
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

export const createLectureLog = async (req, res) => {
  try {
    // If faculty is logged in, their ID might be in req.user, but we'll allow passing it
    const { facultyId, date, subject, topics, lesson } = req.body;

    const newLog = new LectureLog({
      facultyId,
      date: date || new Date(),
      subject,
      topics,
      lesson
    });

    await newLog.save();
    successResponse(res, 'Lecture log created successfully', newLog, 201);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

// Intentionally omitted edit/update and delete controllers as per requirements (read-only once submitted)
