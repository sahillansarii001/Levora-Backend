import prisma from '../config/prisma.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';
import { sendEmail, approvalEmail, rejectionEmail } from '../utils/sendEmail.js';

export const getPendingRegistrations = async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      where: { status: 'pending' },
      select: { id: true, name: true, email: true, status: true, createdAt: true, phone: true }
    });
    const parents = await prisma.parent.findMany({
      where: { status: 'pending' },
      select: { id: true, name: true, email: true, status: true, createdAt: true, phone: true }
    });
    const faculties = await prisma.faculty.findMany({
      where: { status: 'pending' },
      select: { id: true, name: true, email: true, status: true, createdAt: true, phone: true }
    });

    const formattedStudents = students.map(s => ({ ...s, _id: s.id, role: 'student' }));
    const formattedParents = parents.map(p => ({ ...p, _id: p.id, role: 'parent' }));
    const formattedFaculties = faculties.map(f => ({ ...f, _id: f.id, role: 'faculty' }));

    const allPending = [...formattedStudents, ...formattedParents, ...formattedFaculties].sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    successResponse(res, 'Pending registrations fetched successfully', allPending);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

export const updateRegistrationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, role } = req.body;

    if (!['active', 'rejected'].includes(status)) {
      return errorResponse(res, 'Invalid status', [], 400);
    }
    
    if (!role || !['student', 'parent', 'faculty'].includes(role)) {
      return errorResponse(res, 'Invalid role', [], 400);
    }

    let user;
    if (role === 'student') {
      user = await prisma.student.update({
        where: { id },
        data: { status }
      });
    } else if (role === 'parent') {
      user = await prisma.parent.update({
        where: { id },
        data: { status }
      });
    } else if (role === 'faculty') {
      user = await prisma.faculty.update({
        where: { id },
        data: { status }
      });
    }

    // Send Email Notification
    if (status === 'active') {
      await sendEmail(user.email, 'Registration Approved - Levora Academy', approvalEmail(user.name));
    } else if (status === 'rejected') {
      await sendEmail(user.email, 'Registration Update - Levora Academy', rejectionEmail(user.name));
    }

    successResponse(res, `User registration ${status} successfully`, user);
  } catch (error) {
    if (error.code === 'P2025') {
      return errorResponse(res, 'User not found', [], 404);
    }
    errorResponse(res, error.message, [], 500);
  }
};
