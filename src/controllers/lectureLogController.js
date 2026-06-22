import prisma from '../config/prisma.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/responseHelper.js';

export const getLectureLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, facultyId, date, subject } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (facultyId) filter.facultyId = facultyId;
    if (subject) {
      const baseSubject = subject.split(/[-\s]+/)[0].trim();
      filter.subject = { contains: baseSubject, mode: 'insensitive' };
    }
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      filter.date = { gte: startOfDay, lte: endOfDay };
    }

    const count = await prisma.lectureLog.count({ where: filter });
    
    // Can't automatically populate 'facultyId' unless relation is defined in Prisma schema
    const logs = await prisma.lectureLog.findMany({
      where: filter,
      skip,
      take: parseInt(limit),
      orderBy: [
        { date: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    paginatedResponse(res, logs, page, limit, count, 'Lecture logs fetched successfully');
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

export const createLectureLog = async (req, res) => {
  try {
    // If faculty is logged in, their ID might be in req.user, but we'll allow passing it
    const { facultyId, date, subject, topics, lesson } = req.body;

    const newLog = await prisma.lectureLog.create({
      data: {
        facultyId,
        date: date ? new Date(date) : new Date(),
        subject,
        topics: topics || '',
        lesson: lesson || ''
      }
    });

    successResponse(res, 'Lecture log created successfully', newLog, 201);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

// Intentionally omitted edit/update and delete controllers as per requirements (read-only once submitted)
