import prisma from '../config/prisma.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';

// Admin endpoints
export const createAssignment = async (req, res) => {
  try {
    const { title, description, subject, className, dueDate, fileUrl } = req.body;
    
    if (!title || !subject || !className || !dueDate) {
      return errorResponse(res, 'Title, subject, class, and due date are required', [], 400);
    }

    const assignmentData = {
      title,
      description,
      subject,
      className,
      dueDate: new Date(dueDate),
      fileUrl: fileUrl || '',
      status: 'active',
      submissions: []
    };

    if (req.user && req.user.role === 'faculty') {
      assignmentData.facultyId = req.user.id;
    }

    const assignment = await prisma.assignment.create({
      data: assignmentData
    });

    successResponse(res, 'Assignment created successfully', assignment, 201);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

export const getAdminAssignments = async (req, res) => {
  try {
    const assignments = await prisma.assignment.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    // We cannot populate `submissions.studentId` automatically since submissions is a JSON field.
    // For admin assignments we might fetch all students and map them if needed, or simply return raw submissions.
    // We'll return raw for now.
    successResponse(res, 'Assignments fetched successfully', assignments);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

export const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.assignment.delete({ where: { id } });
    successResponse(res, 'Assignment deleted successfully', null);
  } catch (error) {
    if (error.code === 'P2025') {
      return errorResponse(res, 'Assignment not found', [], 404);
    }
    errorResponse(res, error.message, [], 500);
  }
};

// Faculty endpoints
export const getFacultyAssignments = async (req, res) => {
  try {
    const facultyId = req.user.id;
    const assignments = await prisma.assignment.findMany({
      where: { facultyId },
      orderBy: { createdAt: 'desc' }
    });
    
    const courses = await prisma.course.findMany({ where: { facultyId } });
    
    // Try to get student names. Since submissions is JSON, we can fetch all students to map names.
    const allStudents = await prisma.student.findMany({ select: { id: true, name: true } });
    const studentMap = {};
    allStudents.forEach(s => studentMap[s.id] = s.name);

    const mappedAssignments = assignments.map(a => {
      const submissionsArr = Array.isArray(a.submissions) ? a.submissions : [];
      const completedSubmissions = submissionsArr.filter(s => s.status === 'completed');
      const submissionsCount = completedSubmissions.length;
      
      const submittedStudents = completedSubmissions.map(s => studentMap[s.studentId] || 'Unknown');
      
      const course = courses.find(c => c.title === a.subject);
      const total = course ? (course.totalStudents || 0) : 0;
      
      return {
        _id: a.id,
        title: a.title,
        description: a.description,
        subject: a.subject,
        dueDate: a.dueDate,
        fileUrl: a.fileUrl,
        class: a.className,
        status: a.status,
        submissions: submissionsCount,
        submittedStudents,
        total
      };
    });

    successResponse(res, 'Faculty assignments fetched successfully', mappedAssignments);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

// Student/Parent endpoints
export const getStudentAssignments = async (req, res) => {
  try {
    let studentId;
    let className;

    if (req.user.role === 'student') {
      studentId = req.user.id;
      const student = await prisma.student.findUnique({ where: { id: studentId } });
      if (!student) return errorResponse(res, 'Student not found', [], 404);
      className = student.className;
    } else if (req.user.role === 'parent') {
      const parent = await prisma.parent.findUnique({ where: { id: req.user.id } });
      if (!parent) return errorResponse(res, 'Parent not found', [], 404);
      
      let child = null;
      if (parent.childrenIds && parent.childrenIds.length > 0) {
        child = await prisma.student.findUnique({ where: { id: parent.childrenIds[0] } });
      } else if (parent.parentOf) {
        child = await prisma.student.findUnique({ where: { studentId: parent.parentOf } });
      }

      if (!child) return errorResponse(res, 'Linked student not found', [], 404);
      studentId = child.id;
      className = child.className;
    } else if (['admin', 'superadmin'].includes(req.user.role)) {
      const assignments = await prisma.assignment.findMany({
        where: { status: 'active' },
        orderBy: { dueDate: 'asc' },
        take: 10
      });
      const mappedAssignments = assignments.map(a => ({
        _id: a.id,
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

    const assignments = await prisma.assignment.findMany({
      where: { className, status: 'active' },
      orderBy: { dueDate: 'asc' }
    });
    
    const mappedAssignments = assignments.map(a => {
      const submissionsArr = Array.isArray(a.submissions) ? a.submissions : [];
      const isCompleted = submissionsArr.some(s => String(s.studentId) === String(studentId) && s.status === 'completed');
      return {
        _id: a.id,
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
    
    if (req.user.role !== 'student') {
      return errorResponse(res, 'Only students can complete assignments', [], 403);
    }

    const assignment = await prisma.assignment.findUnique({ where: { id } });
    if (!assignment) {
      return errorResponse(res, 'Assignment not found', [], 404);
    }

    let submissionsArr = Array.isArray(assignment.submissions) ? assignment.submissions : [];
    
    const existingSubmission = submissionsArr.find(s => String(s.studentId) === String(req.user.id));
    if (existingSubmission) {
      if (existingSubmission.status === 'completed') {
        return successResponse(res, 'Assignment already marked as completed', assignment);
      }
      existingSubmission.status = 'completed';
      existingSubmission.completedAt = new Date().toISOString();
    } else {
      submissionsArr.push({
        studentId: req.user.id,
        status: 'completed',
        completedAt: new Date().toISOString()
      });
    }

    const updatedAssignment = await prisma.assignment.update({
      where: { id },
      data: { submissions: submissionsArr }
    });

    successResponse(res, 'Assignment marked as completed', updatedAssignment);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};
