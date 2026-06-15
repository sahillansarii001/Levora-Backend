import Schedule from '../models/Schedule.js';
import mongoose from 'mongoose';
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
    } else if (req.user && req.user.role === 'parent') {
      const parent = await mongoose.model('Parent').findById(req.user.id).populate('childrenIds');
      if (!parent) return successResponse(res, 'Parent not found', []);
      
      let child = null;
      if (parent.childrenIds && parent.childrenIds.length > 0) {
        child = parent.childrenIds[0];
      } else if (parent.parentOf) {
        child = await mongoose.model('Student').findOne({ studentId: parent.parentOf });
      }

      if (child) {
        filter.className = child.className;
      } else {
        return successResponse(res, 'No linked student found', []);
      }
    } else if (req.user && req.user.role === 'faculty') {
      filter.instructor = req.user.name; // Assuming faculty see their own classes, or could see all
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

export const updateSchedule = async (req, res) => {
  try {
    const updatedSchedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedSchedule) return errorResponse(res, 'Schedule not found', [], 404);
    successResponse(res, 'Schedule updated successfully', updatedSchedule);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

export const deleteSchedule = async (req, res) => {
  try {
    const deletedSchedule = await Schedule.findByIdAndDelete(req.params.id);
    if (!deletedSchedule) return errorResponse(res, 'Schedule not found', [], 404);
    successResponse(res, 'Schedule deleted successfully', null);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};
