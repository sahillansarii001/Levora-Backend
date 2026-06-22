import prisma from '../config/prisma.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';

export const getNotices = async (req, res) => {
  try {
    const userRole = req.user.role; // 'student', 'parent', 'faculty', 'admin'
    const className = req.query.className || 'All';

    let filter = {};
    if (userRole === 'student') {
      filter = {
        OR: [
          {
            targetAudience: { in: ['students', 'all'] },
            targetClass: { in: [className, 'All'] }
          }
        ]
      };
    } else if (userRole === 'parent') {
      filter = {
        OR: [
          {
            targetAudience: { in: ['parents', 'all'] },
            targetClass: { in: [className, 'All'] }
          }
        ]
      };
    } else if (userRole === 'faculty') {
      filter = {
        targetAudience: { in: ['faculty', 'all'] }
      };
    }

    const notices = await prisma.notice.findMany({
      where: filter,
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    successResponse(res, 'Notices fetched successfully', notices);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};
