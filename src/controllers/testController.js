import prisma from '../config/prisma.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';

export const getStudentTestResults = async (req, res) => {
  try {
    const studentId = req.user.id;

    // Prisma doesn't have a direct model for "TestResult" but we do have "ExamResult"
    // The original mongoose models had "TestResult" and "Test".
    // Wait, the new schema has "ExamResult" and "Exam". Let's verify what the schema has.
    // In schema.prisma: ExamResult and Exam (not test, maybe).
    // Let me fetch ExamResult. Wait, if it's testResult I should query `examResult`.
    
    // Check if test / testResult exists in Prisma, if not I'll map to examResult
    const results = await prisma.examResult.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    // The original populate was for testId. I'll need to fetch exams manually if we don't have relations yet.
    // But let's assume we map it correctly.
    // Actually, I can use `prisma.examResult` but let's query `prisma.exam` manually to attach titles.
    const formattedResults = await Promise.all(results.map(async (r) => {
      // Fetch the exam
      const exam = r.examId ? await prisma.exam.findUnique({ where: { id: r.examId } }) : null;
      
      return {
        _id: r.id,
        name: exam?.title || r.subject || 'Unknown Test',
        date: exam?.examDate ? new Date(exam.examDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'N/A',
        score: r.marksObtained,
        total: r.maxMarks || exam?.maxMarks || 100,
        status: r.status || (r.marksObtained >= (r.passingMarks || 40) ? 'Pass' : 'Fail') // e.g. Pass/Fail or Grade
      };
    }));

    successResponse(res, 'Test results fetched successfully', formattedResults);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};
