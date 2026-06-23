import prisma from '../config/prisma.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/responseHelper.js';

const submitAdmission = async (req, res) => {
  try {
    const { studentId, courseId, documents } = req.body;

    const student = await prisma.student.findUnique({ where: { id: studentId } });
    const course = await prisma.course.findUnique({ where: { id: courseId } });

    if (!student || !course) {
      return errorResponse(res, 'Student or Course not found', [], 404);
    }

    const admission = await prisma.admission.create({
      data: {
        data: {
          studentId,
          courseId,
          documents: documents || [],
          status: 'pending',
          type: 'internal'
        }
      }
    });

    successResponse(res, 'Admission submitted successfully', { id: admission.id, ...admission.data }, 201);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

const submitPublicAdmission = async (req, res) => {
  try {
    const { name, phone, email, program, grade, inquiryType, message } = req.body;

    if (!name || !phone) {
      return errorResponse(res, 'Name and phone are required', [], 400);
    }

    const enquiry = await prisma.enquiry.create({
      data: {
        data: {
          inquiryType: inquiryType || 'Take Admission',
          name,
          phone,
          email: email || '',
          program: program || '',
          grade: grade || '',
          message: message || '',
          status: 'pending',
          type: 'public_inquiry'
        }
      }
    });

    successResponse(res, 'Inquiry submitted successfully', { id: enquiry.id, ...enquiry.data }, 201);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

const getAdmissions = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const admissions = await prisma.admission.findMany();
    const enquiries = await prisma.enquiry.findMany();

    const allRows = [...admissions, ...enquiries].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const formattedRows = allRows.map(row => {
      const docData = typeof row.data === 'object' && row.data !== null ? row.data : {};
      return {
        id: row.id,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        ...docData
      };
    });

    let filteredRows = formattedRows;
    if (status) {
      filteredRows = filteredRows.filter(r => r.status === status);
    }

    const count = filteredRows.length;
    const offset = (page - 1) * limit;
    const paginated = filteredRows.slice(offset, offset + parseInt(limit));

    paginatedResponse(res, paginated, page, limit, count, 'Admissions fetched successfully');
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

    let record = await prisma.enquiry.findUnique({ where: { id } });
    let model = prisma.enquiry;
    
    if (!record) {
      record = await prisma.admission.findUnique({ where: { id } });
      model = prisma.admission;
    }

    if (!record) {
      return errorResponse(res, 'Admission/Enquiry not found', [], 404);
    }

    const docData = typeof record.data === 'object' && record.data !== null ? record.data : {};
    docData.status = status;
    docData.remarks = remarks || '';
    if (status === 'approved') {
      docData.approvedAt = new Date();
    }

    const updated = await model.update({
      where: { id },
      data: { data: docData }
    });

    successResponse(res, 'Admission status updated successfully', { id: updated.id, ...docData });
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

const deleteAdmission = async (req, res) => {
  try {
    const { id } = req.params;
    
    let record = await prisma.enquiry.findUnique({ where: { id } });
    if (record) {
      await prisma.enquiry.delete({ where: { id } });
    } else {
      record = await prisma.admission.findUnique({ where: { id } });
      if (record) {
        await prisma.admission.delete({ where: { id } });
      } else {
        return errorResponse(res, 'Admission/Enquiry not found', [], 404);
      }
    }

    successResponse(res, 'Admission deleted successfully', null);
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
  submitPublicAdmission,
  getAdmissions,
  updateAdmissionStatus,
  deleteAdmission,
  getAdmissionsHero,
  getAdmissionsPrograms,
  getAdmissionsSteps,
  getAdmissionsFaqs
};
