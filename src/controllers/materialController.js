import StudyMaterial from '../models/StudyMaterial.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';

export const getMaterials = async (req, res) => {
  try {
    const { category, board, subject } = req.query;
    
    let filter = {};
    if (category && category !== 'All') filter.category = category;
    if (board && board !== 'All') filter.board = board;
    if (subject && subject !== 'All') filter.subject = subject;

    // If the requester is a student, only show materials for their specific class batch
    if (req.user && req.user.role === 'student' && req.user.className) {
      filter.className = req.user.className;
    }

    const materials = await StudyMaterial.find(filter).sort({ createdAt: -1 });
    successResponse(res, 'Materials fetched successfully', materials);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

export const createMaterial = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'No file uploaded', [], 400);
    }
    
    const fileUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/uploads/${req.file.filename}`;
    
    const newMaterial = new StudyMaterial({
      ...req.body,
      fileUrl,
      originalFilename: req.file.originalname,
      uploadedBy: req.user ? (req.user.name || req.user.email) : 'Admin',
    });
    
    await newMaterial.save();
    successResponse(res, 'Material created successfully', newMaterial, 201);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};
