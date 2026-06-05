import StudyMaterial from '../models/StudyMaterial.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';

export const getMaterials = async (req, res) => {
  try {
    const { category, board, subject } = req.query;
    
    let filter = {};
    if (category && category !== 'All') filter.category = category;
    if (board && board !== 'All') filter.board = board;
    if (subject && subject !== 'All') filter.subject = subject;

    const materials = await StudyMaterial.find(filter).sort({ createdAt: -1 });
    successResponse(res, 'Materials fetched successfully', materials);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

export const createMaterial = async (req, res) => {
  try {
    const newMaterial = new StudyMaterial(req.body);
    await newMaterial.save();
    successResponse(res, 'Material created successfully', newMaterial, 201);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};
