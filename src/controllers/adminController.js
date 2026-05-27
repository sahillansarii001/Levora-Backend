import Student from '../models/Student.js';
import Course from '../models/Course.js';
import Faculty from '../models/Faculty.js';
import Parent from '../models/Parent.js';
import FeeRecord from '../models/FeeRecord.js';
import Attendance from '../models/Attendance.js';
import Notice from '../models/Notice.js';
import StudyMaterial from '../models/StudyMaterial.js';
import BlogPost from '../models/BlogPost.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';
import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

export const getDashboardStats = async (req, res) => {
  try {
    const studentCount = await Student.countDocuments();
    const courseCount = await Course.countDocuments();
    const facultyCount = await Faculty.countDocuments();
    const parentCount = await Parent.countDocuments();

    const noticeCount = await Notice.countDocuments();
    const materialCount = await StudyMaterial.countDocuments();
    const blogCount = await BlogPost.countDocuments();
    const cmsCount = courseCount + noticeCount + materialCount + blogCount;

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

    // Real DB Size
    const dbStats = await mongoose.connection.db.stats();
    let dbSizeStr = (dbStats.dataSize / 1024).toFixed(2) + ' KB';
    if (dbStats.dataSize > 1024 * 1024) {
      dbSizeStr = (dbStats.dataSize / (1024 * 1024)).toFixed(2) + ' MB';
    }

    // Real Uploads Size
    let uploadDirSize = 0;
    try {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const uploadDir = path.join(__dirname, '../../../public/uploads');
      const files = await fs.readdir(uploadDir);
      for (const file of files) {
        const stat = await fs.stat(path.join(uploadDir, file));
        if (stat.isFile()) uploadDirSize += stat.size;
      }
    } catch (e) {}
    let uploadSizeStr = (uploadDirSize / 1024).toFixed(2) + ' KB';
    if (uploadDirSize > 1024 * 1024) {
      uploadSizeStr = (uploadDirSize / (1024 * 1024)).toFixed(2) + ' MB';
    }

    // Real Server Memory
    const memUsed = ((os.totalmem() - os.freemem()) / (1024*1024*1024)).toFixed(2);
    const memTotal = (os.totalmem() / (1024*1024*1024)).toFixed(2);
    const memPercent = Math.round(((os.totalmem() - os.freemem()) / os.totalmem()) * 100);

    const data = {
      studentCount,
      courseCount,
      facultyCount,
      parentCount,
      revenue: revenueStr,
      attendance: attendancePercentage,
      cmsCount: cmsCount,
      dbSize: dbSizeStr,
      uploadSize: uploadSizeStr,
      memory: { used: memUsed, total: memTotal, percent: memPercent },
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
