import {  Admission, Student, Course  } from '../models.js';
import {  successResponse, errorResponse, paginatedResponse  } from '../utils/responseHelper.js';

const submitAdmission = async (req, res) => {
  try {
    const { studentId, courseId, documents } = req.body;

    const student = await Student.findByPk(studentId);
    const course = await Course.findByPk(courseId);

    if (!student || !course) {
      return errorResponse(res, 'Student or Course not found', [], 404);
    }

    const admission = await Admission.create({
      studentId,
      courseId,
      documents,
      status: 'pending',
    });

    successResponse(res, 'Admission submitted successfully', admission, 201);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

const getAdmissions = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const where = {};

    if (status) where.status = status;

    const offset = (page - 1) * limit;
    const { rows, count } = await Admission.findAndCountAll({
      where,
      include: [
        { model: Student, attributes: ['name', 'email', 'phone'] },
        { model: Course, attributes: ['title', 'category'] },
      ],
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']],
    });

    paginatedResponse(res, rows, page, limit, count, 'Admissions fetched successfully');
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

const updateAdmissionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return errorResponse(res, 'Invalid status', [], 400);
    }

    const admission = await Admission.findByPk(id);
    if (!admission) {
      return errorResponse(res, 'Admission not found', [], 404);
    }

    admission.status = status;
    admission.remarks = remarks;
    if (status === 'approved') {
      admission.approvedAt = new Date();
    }

    await admission.save();
    successResponse(res, 'Admission status updated successfully', admission);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

module.exports = {
  submitAdmission,
  getAdmissions,
  updateAdmissionStatus,
};
