import prisma from '../config/prisma.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';

// Get Schedule based on student's class
export const getSchedule = async (req, res) => {
  try {
    const { className, date } = req.query;
    
    let filter = {};
    if (className) filter.className = className;
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      filter.date = { gte: startOfDay, lte: endOfDay };
    }
    
    // If student is logged in, restrict to their class
    if (req.user && req.user.role === 'student' && req.user.className) {
      filter.className = req.user.className;
    } else if (req.user && req.user.role === 'parent') {
      const parent = await prisma.parent.findUnique({ where: { id: req.user.id } });
      if (!parent) return successResponse(res, 'Parent not found', []);
      
      let child = null;
      if (parent.childrenIds && parent.childrenIds.length > 0) {
        child = await prisma.student.findUnique({ where: { id: parent.childrenIds[0] } });
      } else if (parent.parentOf) {
        child = await prisma.student.findUnique({ where: { studentId: parent.parentOf } });
      }

      if (child) {
        filter.className = child.className;
      } else {
        return successResponse(res, 'No linked student found', []);
      }
    } else if (req.user && req.user.role === 'faculty') {
      filter.instructor = req.user.name; // Assuming faculty see their own classes, or could see all
    }

    const schedule = await prisma.schedule.findMany({
      where: filter,
      orderBy: { startTime: 'asc' }
    });
    successResponse(res, 'Schedule fetched successfully', schedule);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

// Admin/Faculty can add schedule
export const createSchedule = async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.date) data.date = new Date(data.date);

    const newSchedule = await prisma.schedule.create({ data });
    successResponse(res, 'Schedule created successfully', newSchedule, 201);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

export const updateSchedule = async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.date) data.date = new Date(data.date);

    const updatedSchedule = await prisma.schedule.update({
      where: { id: req.params.id },
      data
    });
    
    successResponse(res, 'Schedule updated successfully', updatedSchedule);
  } catch (error) {
    if (error.code === 'P2025') {
      return errorResponse(res, 'Schedule not found', [], 404);
    }
    errorResponse(res, error.message, [], 500);
  }
};

export const deleteSchedule = async (req, res) => {
  try {
    await prisma.schedule.delete({ where: { id: req.params.id } });
    successResponse(res, 'Schedule deleted successfully', null);
  } catch (error) {
    if (error.code === 'P2025') {
      return errorResponse(res, 'Schedule not found', [], 404);
    }
    errorResponse(res, error.message, [], 500);
  }
};
