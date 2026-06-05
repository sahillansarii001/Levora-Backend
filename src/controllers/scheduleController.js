import Schedule from '../models/Schedule.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';

// Get Schedule based on student's class
export const getSchedule = async (req, res) => {
  try {
    const { className, date } = req.query;
    
    let filter = {};
    if (className) filter.className = className;
    if (date) filter.date = new Date(date);
    
    // If student is logged in, restrict to their class
    if (req.user && req.user.role === 'student' && req.user.className) {
      filter.className = req.user.className;
    }

    const schedule = await Schedule.find(filter).sort({ startTime: 1 });
    successResponse(res, 'Schedule fetched successfully', schedule);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

// Admin/Faculty can add schedule
export const createSchedule = async (req, res) => {
  try {
    const newSchedule = new Schedule(req.body);
    await newSchedule.save();
    successResponse(res, 'Schedule created successfully', newSchedule, 201);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};
