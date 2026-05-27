import Student from '../models/Student.js';
import Course from '../models/Course.js';
import Faculty from '../models/Faculty.js';
import Parent from '../models/Parent.js';
import FeeRecord from '../models/FeeRecord.js';
import Attendance from '../models/Attendance.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';

export const getDashboardStats = async (req, res) => {
  try {
    const studentCount = await Student.countDocuments();
    const courseCount = await Course.countDocuments();
    const facultyCount = await Faculty.countDocuments();
    const parentCount = await Parent.countDocuments();

    const recentStudents = await Student.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email className createdAt status');
    
    // Real revenue calculation (Total Paid Fees)
    const paidFees = await FeeRecord.aggregate([
      { $match: { status: 'Paid' } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalRevenue = paidFees.length > 0 ? paidFees[0].total : 0;
    const revenueStr = '₹' + totalRevenue.toLocaleString();

    // Real attendance calculation
    const totalAttendance = await Attendance.countDocuments();
    const presentAttendance = await Attendance.countDocuments({ status: 'Present' });
    const attendancePercentage = totalAttendance > 0 
      ? Math.round((presentAttendance / totalAttendance) * 100) + '%' 
      : '0%';

    const data = {
      studentCount,
      courseCount,
      facultyCount,
      parentCount,
      revenue: revenueStr,
      attendance: attendancePercentage,
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
