import TestResult from '../models/TestResult.js';
import Test from '../models/Test.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';

export const getStudentTestResults = async (req, res) => {
  try {
    const studentId = req.user.id;

    const results = await TestResult.find({ studentId })
      .populate('testId', 'title subject maxMarks passingMarks testDate')
      .sort({ createdAt: -1 })
      .limit(5);

    // Transform data for the frontend
    const formattedResults = results.map(r => ({
      _id: r._id,
      name: r.testId?.title || 'Unknown Test',
      date: r.testId?.testDate ? new Date(r.testId.testDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'N/A',
      score: r.marksObtained,
      total: r.testId?.maxMarks || 100,
      status: r.status // e.g. Pass/Fail or Grade
    }));

    successResponse(res, 'Test results fetched successfully', formattedResults);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};
