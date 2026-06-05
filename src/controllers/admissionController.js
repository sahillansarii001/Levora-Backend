import {  Admission, Student, Course  } from '../models.js';
import {  successResponse, errorResponse, paginatedResponse  } from '../utils/responseHelper.js';

const submitAdmission = async (req, res) => {
  try {
    const { studentId, courseId, documents } = req.body;

    const student = await Student.findById(studentId);
    const course = await Course.findById(courseId);

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
    const count = await Admission.countDocuments(where);
    const rows = await Admission.find(where)
      .populate('studentId', 'name email phone')
      .populate('courseId', 'title category')
      .skip(offset)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

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

    const admission = await Admission.findById(id);
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

const getAdmissionsHero = async (req, res) => {
  res.json({
    headline: "Admissions Open for 2025–26 Batch",
    subheading: "Join India's fastest-growing coaching academy. Limited seats available across all programs.",
    badge1: "5000+ Students Enrolled",
    badge2: "99% Board Success Rate",
    badge3: "Expert Faculty",
    ctaPhone: "+91 98765 43210"
  });
};

const getAdmissionsPrograms = async (req, res) => {
  res.json([
    { name: "Pre-Primary (Playgroup–Nursery)", eligibility: "Age 3–5", batchStarts: "July 2025" },
    { name: "Primary School (Class 1–5)", eligibility: "Class completion", batchStarts: "July 2025" },
    { name: "Middle School (Class 6–10)", eligibility: "Class completion", batchStarts: "July 2025" },
    { name: "Higher Secondary (Class 11–12)", eligibility: "Class 10 pass", batchStarts: "July 2025" },
    { name: "JEE / NEET Preparation", eligibility: "Class 10 pass", batchStarts: "June 2025" },
    { name: "Coding & Tech Courses", eligibility: "Age 12+", batchStarts: "Rolling admissions" },
    { name: "Spoken English", eligibility: "Age 10+", batchStarts: "Rolling admissions" }
  ]);
};

const getAdmissionsSteps = async (req, res) => {
  res.json([
    { stepNumber: 1, title: "Fill Inquiry Form", description: "Submit your details below. Takes under 2 minutes." },
    { stepNumber: 2, title: "Counselling Call", description: "Our team calls you within 24 hours to understand your goals." },
    { stepNumber: 3, title: "Seat Confirmation", description: "Select your batch, complete enrollment, and confirm your seat." },
    { stepNumber: 4, title: "Batch Begins", description: "Attend orientation and start your learning journey." }
  ]);
};

const getAdmissionsFaqs = async (req, res) => {
  res.json([
    { question: "What courses does Levora Academy offer?", answer: "Levora Academy offers programs for Pre-Primary to Class 12, JEE and NEET preparation, Python, Java, Full Stack Web Development, App Development, UI/UX Design, AI & Data Science, Spoken English, and Computer Skills." },
    { question: "When do admissions open for the 2025–26 batch?", answer: "Admissions for the 2025–26 batch are currently open. Limited seats are available. Apply through our website or contact us at hello@levoraacademy.com." },
    { question: "Is there an entrance test to join Levora Academy?", answer: "No mandatory entrance test is required for most programs. Students may go through a brief counselling session to help us place them in the right batch and level." },
    { question: "Does Levora Academy offer online classes?", answer: "Yes, Levora Academy offers both offline (center-based) and online classes for all programs, allowing students from across India to access our courses." },
    { question: "What is the fee structure at Levora Academy?", answer: "Fee structure varies by program. Please contact us at hello@levoraacademy.com or call +91-98765-43210 for the latest fee details and scholarship options." }
  ]);
};

export {
  submitAdmission,
  getAdmissions,
  updateAdmissionStatus,
  getAdmissionsHero,
  getAdmissionsPrograms,
  getAdmissionsSteps,
  getAdmissionsFaqs
};
