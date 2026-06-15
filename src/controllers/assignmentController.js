import Assignment from '../models/Assignment.js';
import Student from '../models/Student.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';
import mongoose from 'mongoose';

// Admin endpoints
export const createAssignment = async (req, res) => {
  try {
    const { title, description, subject, className, dueDate, fileUrl } = req.body;
    
    if (!title || !subject || !className || !dueDate) {
      return errorResponse(res, 'Title, subject, class, and due date are required', [], 400);
    }

    const assignment = new Assignment({
      title,
      description,
      subject,
      className,
      dueDate,
      fileUrl,
    });

    await assignment.save();
    successResponse(res, 'Assignment created successfully', assignment, 201);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

export const getAdminAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find().sort({ createdAt: -1 });
    successResponse(res, 'Assignments fetched successfully', assignments);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

export const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const assignment = await Assignment.findByIdAndDelete(id);
    if (!assignment) {
      return errorResponse(res, 'Assignment not found', [], 404);
    }
    successResponse(res, 'Assignment deleted successfully', null);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

// Student/Parent endpoints
export const getStudentAssignments = async (req, res) => {
  try {
    // Determine the student ID and className
    let studentId;
    let className;

    if (req.user.role === 'student') {
      studentId = req.user.id;
      const student = await Student.findById(studentId);
      if (!student) return errorResponse(res, 'Student not found', [], 404);
      className = student.className;
    } else if (req.user.role === 'parent') {
      const parent = await mongoose.model('Parent').findById(req.user.id).populate('studentId');
      if (!parent || !parent.studentId) return errorResponse(res, 'Linked student not found', [], 404);
      studentId = parent.studentId._id;
      className = parent.studentId.className;
    } else if (['admin', 'superadmin'].includes(req.user.role)) {
      // Allow admin/superadmin to preview the student assignments page
      const assignments = await Assignment.find({ status: 'active' }).sort({ dueDate: 1 }).limit(10);
      const mappedAssignments = assignments.map(a => ({
        _id: a._id,
        title: a.title,
        description: a.description,
        subject: a.subject,
        dueDate: a.dueDate,
        fileUrl: a.fileUrl,
        isCompleted: false
      }));
      return successResponse(res, 'Admin preview of student assignments', mappedAssignments);
    } else {
      return errorResponse(res, 'Unauthorized access', [], 403);
    }

    if (!className) {
      return successResponse(res, 'Assignments fetched', []);
    }

    const assignments = await Assignment.find({ className, status: 'active' }).sort({ dueDate: 1 });
    
    // Map to include a `isCompleted` flag for easy frontend rendering
    const mappedAssignments = assignments.map(a => {
      const isCompleted = a.submissions.some(s => s.studentId.toString() === studentId.toString() && s.status === 'completed');
      return {
        _id: a._id,
        title: a.title,
        description: a.description,
        subject: a.subject,
        dueDate: a.dueDate,
        fileUrl: a.fileUrl,
        isCompleted
      };
    });

    successResponse(res, 'Student assignments fetched successfully', mappedAssignments);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

export const markAssignmentCompleted = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Only students can mark as completed
    if (req.user.role !== 'student') {
      return errorResponse(res, 'Only students can complete assignments', [], 403);
    }

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return errorResponse(res, 'Assignment not found', [], 404);
    }

    // Check if already completed
    const existingSubmission = assignment.submissions.find(s => s.studentId.toString() === req.user.id.toString());
    if (existingSubmission) {
      if (existingSubmission.status === 'completed') {
        return successResponse(res, 'Assignment already marked as completed', assignment);
      }
      existingSubmission.status = 'completed';
      existingSubmission.completedAt = Date.now();
    } else {
      assignment.submissions.push({
        studentId: req.user.id,
        status: 'completed'
      });
    }

    await assignment.save();
    successResponse(res, 'Assignment marked as completed', assignment);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};
