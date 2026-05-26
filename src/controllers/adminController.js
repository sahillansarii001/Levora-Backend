import Student from '../models/Student.js';
import Course from '../models/Course.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';

export const getDashboardStats = async (req, res) => {
  try {
    const studentCount = await Student.countDocuments();
    const courseCount = await Course.countDocuments();

    const recentStudents = await Student.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email className createdAt status');

    // For now, mock revenue and attendance since models aren't fully built
    const revenue = '₹2.4M'; 
    const attendance = '89%';

    const data = {
      studentCount,
      courseCount,
      revenue,
      attendance,
      recentEnrollments: recentStudents.map(s => ({
        name: s.name,
        email: s.email,
        course: s.className || 'General',
        date: new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: s.status || 'Active'
      }))
    };

    successResponse(res, 'Dashboard stats fetched successfully', data);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};
