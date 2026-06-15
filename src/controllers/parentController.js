import { Parent, Student, Attendance, FeeRecord, Notice } from '../models.js';
import ExamResult from '../models/ExamResult.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/responseHelper.js';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const getParents = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const count = await Parent.countDocuments();
    const parents = await Parent.find()
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    paginatedResponse(res, parents, page, limit, count, 'Parents fetched successfully');
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

const getParentById = async (req, res) => {
  try {
    const { id } = req.params;
    const parent = await Parent.findById(id).select('-password');

    if (!parent) {
      return errorResponse(res, 'Parent not found', [], 404);
    }

    successResponse(res, 'Parent fetched successfully', parent);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

const createParent = async (req, res) => {
  try {
    const { name, email, phone, password, parentOf } = req.body;

    const existingParent = await Parent.findOne({ email });
    if (existingParent) {
      return errorResponse(res, 'Email already exists', [], 400);
    }

    const newPassword = password || process.env.DEFAULT_PASSWORD || 'Levora123!';

    const parent = new Parent({
      name,
      email,
      phone,
      password: newPassword,
      parentOf
    });

    await parent.save();

    successResponse(res, 'Parent created successfully', {
      id: parent._id,
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
    const updates = req.body;

    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    }

    const parent = await Parent.findByIdAndUpdate(id, updates, { new: true }).select('-password');
    if (!parent) {
      return errorResponse(res, 'Parent not found', [], 404);
    }

    successResponse(res, 'Parent updated successfully', parent);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

const deleteParent = async (req, res) => {
  try {
    const { id } = req.params;

    const parent = await Parent.findByIdAndDelete(id);
    if (!parent) {
      return errorResponse(res, 'Parent not found', [], 404);
    }

    successResponse(res, 'Parent deleted successfully', {});
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

const getParentDashboard = async (req, res) => {
  try {
    if (req.user.role === 'admin' || req.user.role === 'superadmin') {
      // Calculate global attendance
      const totalAttendance = await Attendance.countDocuments({ userType: 'student' });
      const presentAttendance = await Attendance.countDocuments({ userType: 'student', status: 'Present' });
      const attendancePercentage = totalAttendance > 0 
        ? Math.round((presentAttendance / totalAttendance) * 100) + '%' 
        : '0%';

      // Calculate global avg score
      const results = await ExamResult.find();
      let avgScore = '0%';
      if (results.length > 0) {
        const totalMarks = results.reduce((sum, r) => sum + r.totalMarks, 0);
        const obtainedMarks = results.reduce((sum, r) => sum + r.marksObtained, 0);
        avgScore = totalMarks > 0 ? Math.round((obtainedMarks / totalMarks) * 100) + '%' : '0%';
      }

      // Calculate global pending fees
      const students = await Student.find();
      let globalTotalCourseFees = students.reduce((sum, s) => sum + (s.totalFees || 0), 0);
      const paidFees = await FeeRecord.aggregate([
        { $match: { status: 'Paid' } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]);
      const totalPaid = paidFees.length > 0 ? paidFees[0].total : 0;
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
    const parent = await Parent.findById(parentId).populate('childrenIds');

    if (!parent) {
      return errorResponse(res, 'Parent not found', [], 404);
    }

    // Try to find the child using childrenIds or parentOf (studentId string)
    let child = null;
    if (parent.childrenIds && parent.childrenIds.length > 0) {
      child = parent.childrenIds[0]; // For MVP, assume 1 child
    } else if (parent.parentOf) {
      child = await Student.findOne({ studentId: parent.parentOf });
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

    // Calculate Attendance
    const childObjectId = new mongoose.Types.ObjectId(child._id);
    const totalAttendance = await Attendance.countDocuments({ studentId: childObjectId });
    const presentAttendance = await Attendance.countDocuments({ studentId: childObjectId, status: 'Present' });
    const attendancePercentage = totalAttendance > 0 
      ? Math.round((presentAttendance / totalAttendance) * 100) + '%' 
      : '0%';

    // Calculate Fee Dues
    const paidFees = await FeeRecord.aggregate([
      { $match: { studentId: child._id, status: 'Paid' } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalPaid = paidFees.length > 0 ? paidFees[0].total : 0;
    const totalDue = Math.max(0, (child.totalFees || 0) - totalPaid);
    const feeDueStr = '₹' + totalDue.toLocaleString();

    // Fetch Alerts (Notices relevant to the child's class)
    const alerts = await Notice.find({ 
      $or: [{ targetAudience: 'parents' }, { targetAudience: 'all' }],
      $or: [{ targetClass: child.className }, { targetClass: 'All' }]
    }).sort({ createdAt: -1 }).limit(3);

    // Calculate Average Score from ExamResults
    const results = await ExamResult.find({ studentId: child._id });
    let avgScore = '0%';
    if (results.length > 0) {
      const totalMarks = results.reduce((sum, r) => sum + r.totalMarks, 0);
      const obtainedMarks = results.reduce((sum, r) => sum + r.marksObtained, 0);
      avgScore = totalMarks > 0 ? Math.round((obtainedMarks / totalMarks) * 100) + '%' : '0%';
    }

    const data = {
      childName: child.name,
      className: child.className,
      attendanceScore: attendancePercentage,
      avgScore: avgScore,
      feeDue: feeDueStr,
      alerts: alerts.map(a => a.title)
    };

    successResponse(res, 'Parent dashboard data fetched successfully', data);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

const getChildAttendance = async (req, res) => {
  try {
    if (req.user.role === 'admin' || req.user.role === 'superadmin') {
      const attendance = await Attendance.find({ userType: 'student' }).sort({ date: -1 }).limit(20);
      return successResponse(res, 'Admin Preview: Global attendance data', attendance);
    }

    const parentId = req.user.id;
    const parent = await Parent.findById(parentId).populate('childrenIds');

    if (!parent) {
      return errorResponse(res, 'Parent not found', [], 404);
    }

    let child = null;
    if (parent.childrenIds && parent.childrenIds.length > 0) {
      child = parent.childrenIds[0];
    } else if (parent.parentOf) {
      child = await Student.findOne({ studentId: parent.parentOf });
    }

    if (!child) {
      return successResponse(res, 'No student linked to this parent account', []);
    }

    const attendance = await Attendance.find({ studentId: child._id }).sort({ date: -1 });
    successResponse(res, 'Child attendance fetched successfully', attendance);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

const getChildFees = async (req, res) => {
  try {
    if (req.user.role === 'admin' || req.user.role === 'superadmin') {
      const fees = await FeeRecord.find().populate('studentId', 'name studentId').limit(10).sort({ createdAt: -1 });
      return successResponse(res, 'Admin Preview: Global Fee Records', { totalCourseFee: 50000, records: fees });
    }

    const parentId = req.user.id;
    const parent = await Parent.findById(parentId).populate('childrenIds');

    if (!parent) return errorResponse(res, 'Parent not found', [], 404);

    let child = null;
    if (parent.childrenIds && parent.childrenIds.length > 0) {
      child = parent.childrenIds[0];
    } else if (parent.parentOf) {
      child = await Student.findOne({ studentId: parent.parentOf });
    }

    if (!child) return successResponse(res, 'No student linked to this parent account', []);

    const fees = await FeeRecord.find({ studentId: child._id }).sort({ createdAt: -1 });
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
