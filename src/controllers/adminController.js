import prisma from '../config/prisma.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

export const getDashboardStats = async (req, res) => {
  try {
    const studentCount = await prisma.student.count();
    const courseCount = await prisma.course.count();
    const facultyCount = await prisma.faculty.count();
    const parentCount = await prisma.parent.count();

    const noticeCount = await prisma.notice.count();
    const materialCount = await prisma.studyMaterial.count();
    const blogCount = await prisma.blogPost.count();
    const cmsCount = courseCount + noticeCount + materialCount + blogCount;

    const recentStudents = await prisma.student.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { name: true, email: true, className: true, createdAt: true, status: true }
    });
    
    // Real revenue calculation (Total Paid Fees)
    const paidFees = await prisma.feeRecord.findMany({ where: { status: 'Paid' } });
    const totalRevenue = paidFees.reduce((sum, f) => sum + f.amount, 0);
    const revenueStr = '₹' + totalRevenue.toLocaleString();

    // Real attendance calculation
    const totalAttendance = await prisma.attendance.count();
    const presentAttendance = await prisma.attendance.count({ where: { status: 'Present' } });
    const attendancePercentage = totalAttendance > 0 
      ? Math.round((presentAttendance / totalAttendance) * 100) + '%' 
      : '0%';

    // Prisma doesn't have direct DB size like Mongoose. Use dummy or generic placeholder for PostgreSQL size.
    let dbSizeStr = 'PostgreSQL DB Size N/A';

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
