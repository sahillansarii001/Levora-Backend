import Notice from '../models/Notice.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';

export const getNotices = async (req, res) => {
  try {
    const userRole = req.user.role; // 'student', 'parent', 'faculty', 'admin'
    const className = req.query.className || 'All';

    let filter = {};
    if (userRole === 'student') {
      filter = {
        $or: [{ targetAudience: 'students' }, { targetAudience: 'all' }],
        $or: [{ targetClass: className }, { targetClass: 'All' }]
      };
    } else if (userRole === 'parent') {
      filter = {
        $or: [{ targetAudience: 'parents' }, { targetAudience: 'all' }],
        $or: [{ targetClass: className }, { targetClass: 'All' }]
      };
    } else if (userRole === 'faculty') {
      filter = {
        $or: [{ targetAudience: 'faculty' }, { targetAudience: 'all' }]
      };
    }

    const notices = await Notice.find(filter).sort({ createdAt: -1 }).limit(10);
    successResponse(res, 'Notices fetched successfully', notices);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};
