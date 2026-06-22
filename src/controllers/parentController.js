import prisma from '../config/prisma.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/responseHelper.js';
import bcrypt from 'bcryptjs';

const getParents = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const count = await prisma.parent.count();
    const parents = await prisma.parent.findMany({
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    const parentsWithoutPassword = parents.map(({ password, ...rest }) => rest);

    paginatedResponse(res, parentsWithoutPassword, page, limit, count, 'Parents fetched successfully');
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

const getParentById = async (req, res) => {
  try {
    const { id } = req.params;
    const parent = await prisma.parent.findUnique({ where: { id } });

    if (!parent) {
      return errorResponse(res, 'Parent not found', [], 404);
    }

    const { password, ...parentWithoutPassword } = parent;
    successResponse(res, 'Parent fetched successfully', parentWithoutPassword);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

const createParent = async (req, res) => {
  try {
    const { name, email, phone, password, parentOf } = req.body;

    const existingParent = await prisma.parent.findUnique({ where: { email } });
    if (existingParent) {
      return errorResponse(res, 'Email already exists', [], 400);
    }

    const newPassword = password || process.env.DEFAULT_PASSWORD || 'Levora123!';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const parent = await prisma.parent.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        parentOf: parentOf || ''
      }
    });

    successResponse(res, 'Parent created successfully', {
      id: parent.id,
      name: parent.name,
      email: parent.email,
    }, 201);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

const updateParent = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    }

    const parent = await prisma.parent.update({
      where: { id },
      data: updates
    });

    const { password, ...parentWithoutPassword } = parent;
    successResponse(res, 'Parent updated successfully', parentWithoutPassword);
  } catch (error) {
    if (error.code === 'P2025') {
      return errorResponse(res, 'Parent not found', [], 404);
    }
    errorResponse(res, error.message, [], 500);
  }
};

const deleteParent = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.parent.delete({ where: { id } });

    successResponse(res, 'Parent deleted successfully', {});
  } catch (error) {
    if (error.code === 'P2025') {
      return errorResponse(res, 'Parent not found', [], 404);
    }
    errorResponse(res, error.message, [], 500);
  }
};

const getParentDashboard = async (req, res) => {
  try {
    if (req.user.role === 'admin' || req.user.role === 'superadmin') {
      const totalAttendance = await prisma.attendance.count({ where: { userType: 'student' } });
      const presentAttendance = await prisma.attendance.count({ where: { userType: 'student', status: 'Present' } });
      const attendancePercentage = totalAttendance > 0 
        ? Math.round((presentAttendance / totalAttendance) * 100) + '%' 
        : '0%';

      const results = await prisma.examResult.findMany();
      let avgScore = '0%';
      if (results.length > 0) {
        const totalMarks = results.reduce((sum, r) => sum + r.totalMarks, 0);
        const obtainedMarks = results.reduce((sum, r) => sum + r.marksObtained, 0);
        avgScore = totalMarks > 0 ? Math.round((obtainedMarks / totalMarks) * 100) + '%' : '0%';
      }

      const students = await prisma.student.findMany();
      let globalTotalCourseFees = students.reduce((sum, s) => sum + (s.totalFees || 0), 0);
      const paidFeesRecords = await prisma.feeRecord.findMany({ where: { status: 'Paid' } });
      const totalPaid = paidFeesRecords.reduce((sum, f) => sum + f.amount, 0);
      const globalTotalDue = Math.max(0, globalTotalCourseFees - totalPaid);

      return successResponse(res, 'Admin Preview Mode', {
        childName: 'Admin Preview',
        className: 'Global',
        attendanceScore: attendancePercentage,
        avgScore: avgScore,
        feeDue: '₹' + globalTotalDue.toLocaleString(),
        alerts: []
      });
    }

    const parentId = req.user.id;
    const parent = await prisma.parent.findUnique({ where: { id: parentId } });

    if (!parent) {
      return errorResponse(res, 'Parent not found', [], 404);
    }

    let child = null;
    if (parent.childrenIds && parent.childrenIds.length > 0) {
      child = await prisma.student.findUnique({ where: { id: parent.childrenIds[0] } });
    } else if (parent.parentOf) {
      child = await prisma.student.findUnique({ where: { studentId: parent.parentOf } });
    }

    if (!child) {
      return successResponse(res, 'No student linked to this parent account', { 
        childName: 'No Child Linked', 
        className: 'N/A', 
        attendanceScore: '0%', 
        avgScore: '0%', 
        feeDue: '₹0',
        alerts: []
      });
    }

    const totalAttendance = await prisma.attendance.count({ where: { studentId: child.id } });
    const presentAttendance = await prisma.attendance.count({ where: { studentId: child.id, status: 'Present' } });
    const attendancePercentage = totalAttendance > 0 
      ? Math.round((presentAttendance / totalAttendance) * 100) + '%' 
      : '0%';

    const paidFeesRecords = await prisma.feeRecord.findMany({ where: { studentId: child.id, status: 'Paid' } });
    const totalPaid = paidFeesRecords.reduce((sum, f) => sum + f.amount, 0);
    const totalDue = Math.max(0, (child.totalFees || 0) - totalPaid);
    const feeDueStr = '₹' + totalDue.toLocaleString();

    const alertsRaw = await prisma.notice.findMany({
      where: {
        OR: [
          { targetAudience: 'parents' },
          { targetAudience: 'all' }
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 3
    });
    const alerts = alertsRaw.map(a => a.title);

    const results = await prisma.examResult.findMany({ where: { studentId: child.id } });
    let avgScore = '0%';
    if (results.length > 0) {
      const totalMarks = results.reduce((sum, r) => sum + r.totalMarks, 0);
      const obtainedMarks = results.reduce((sum, r) => sum + r.marksObtained, 0);
      avgScore = totalMarks > 0 ? Math.round((obtainedMarks / totalMarks) * 100) + '%' : '0%';
    }

    const data = {
      childName: child.name,
      className: child.className || 'N/A',
      attendanceScore: attendancePercentage,
      avgScore: avgScore,
      feeDue: feeDueStr,
      alerts: alerts
    };

    successResponse(res, 'Parent dashboard data fetched successfully', data);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

const getChildAttendance = async (req, res) => {
  try {
    if (req.user.role === 'admin' || req.user.role === 'superadmin') {
      const attendance = await prisma.attendance.findMany({
        where: { userType: 'student' },
        orderBy: { date: 'desc' },
        take: 20
      });
      return successResponse(res, 'Admin Preview: Global attendance data', attendance);
    }

    const parentId = req.user.id;
    const parent = await prisma.parent.findUnique({ where: { id: parentId } });

    if (!parent) {
      return errorResponse(res, 'Parent not found', [], 404);
    }

    let child = null;
    if (parent.childrenIds && parent.childrenIds.length > 0) {
      child = await prisma.student.findUnique({ where: { id: parent.childrenIds[0] } });
    } else if (parent.parentOf) {
      child = await prisma.student.findUnique({ where: { studentId: parent.parentOf } });
    }

    if (!child) {
      return successResponse(res, 'No student linked to this parent account', []);
    }

    const attendance = await prisma.attendance.findMany({
      where: { studentId: child.id },
      orderBy: { date: 'desc' }
    });
    successResponse(res, 'Child attendance fetched successfully', attendance);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

const getChildFees = async (req, res) => {
  try {
    if (req.user.role === 'admin' || req.user.role === 'superadmin') {
      const fees = await prisma.feeRecord.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' }
      });
      return successResponse(res, 'Admin Preview: Global Fee Records', { totalCourseFee: 50000, records: fees });
    }

    const parentId = req.user.id;
    const parent = await prisma.parent.findUnique({ where: { id: parentId } });

    if (!parent) return errorResponse(res, 'Parent not found', [], 404);

    let child = null;
    if (parent.childrenIds && parent.childrenIds.length > 0) {
      child = await prisma.student.findUnique({ where: { id: parent.childrenIds[0] } });
    } else if (parent.parentOf) {
      child = await prisma.student.findUnique({ where: { studentId: parent.parentOf } });
    }

    if (!child) return successResponse(res, 'No student linked to this parent account', []);

    const fees = await prisma.feeRecord.findMany({
      where: { studentId: child.id },
      orderBy: { createdAt: 'desc' }
    });
    successResponse(res, 'Child fee records fetched successfully', {
      totalCourseFee: child?.totalFees || 0,
      records: fees
    });
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

export {
  getParents,
  getParentById,
  createParent,
  updateParent,
  deleteParent,
  getParentDashboard,
  getChildAttendance,
  getChildFees
};
