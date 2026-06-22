import prisma from '../config/prisma.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';

// Helper for other controllers to use
export const logActivity = async (type, title, desc) => {
  try {
    await prisma.activityLog.create({ data: { type, title, desc } });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

export const getLogs = async (req, res) => {
  try {
    const logs = await prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    return successResponse(res, 'Logs fetched successfully', logs);
  } catch (error) {
    return errorResponse(res, 'Failed to fetch logs', error);
  }
};

export const deleteLog = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.activityLog.delete({ where: { id } });
    return successResponse(res, 'Log deleted successfully');
  } catch (error) {
    if (error.code === 'P2025') {
      return errorResponse(res, 'Log not found', error);
    }
    return errorResponse(res, 'Failed to delete log', error);
  }
};
