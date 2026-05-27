import ActivityLog from '../models/ActivityLog.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';

// Helper for other controllers to use
export const logActivity = async (type, title, desc) => {
  try {
    await ActivityLog.create({ type, title, desc });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

export const getLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(100);
    return successResponse(res, 'Logs fetched successfully', logs);
  } catch (error) {
    return errorResponse(res, 'Failed to fetch logs', error);
  }
};

export const deleteLog = async (req, res) => {
  try {
    const { id } = req.params;
    await ActivityLog.findByIdAndDelete(id);
    return successResponse(res, 'Log deleted successfully');
  } catch (error) {
    return errorResponse(res, 'Failed to delete log', error);
  }
};
