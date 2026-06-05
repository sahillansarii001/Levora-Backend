import { Parent, Student, Attendance, FeeRecord, Notice } from '../models.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/responseHelper.js';
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
    const totalAttendance = await Attendance.countDocuments({ studentId: child._id });
    const presentAttendance = await Attendance.countDocuments({ studentId: child._id, status: 'Present' });
    const attendancePercentage = totalAttendance > 0 
      ? Math.round((presentAttendance / totalAttendance) * 100) + '%' 
      : '0%';

    // Calculate Fee Dues
    const pendingFees = await FeeRecord.aggregate([
      { $match: { studentId: child._id, status: 'Pending' } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalDue = pendingFees.length > 0 ? pendingFees[0].total : 0;
    const feeDueStr = '₹' + totalDue.toLocaleString();

    // Fetch Alerts (Notices relevant to the child's class)
    const alerts = await Notice.find({ 
      $or: [{ targetAudience: 'parents' }, { targetAudience: 'all' }],
      $or: [{ targetClass: child.className }, { targetClass: 'All' }]
    }).sort({ createdAt: -1 }).limit(3);

    // Mock Average Score (since Test Score model doesn't exist yet)
    const mockAvgScore = '85%'; 

    const data = {
      childName: child.name,
      className: child.className,
      attendanceScore: attendancePercentage,
      avgScore: mockAvgScore,
      feeDue: feeDueStr,
      alerts: alerts.map(a => a.title)
    };

    successResponse(res, 'Parent dashboard data fetched successfully', data);
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
  getParentDashboard
};
