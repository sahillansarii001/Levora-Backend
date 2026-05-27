import { FeeRecord, Student } from '../models.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/responseHelper.js';

const getFeeRecords = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const count = await FeeRecord.countDocuments();
    const records = await FeeRecord.find()
      .populate('studentId', 'name studentId className batch')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ paymentDate: -1 });

    paginatedResponse(res, records, page, limit, count, 'Fee records fetched successfully');
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

const createFeeRecord = async (req, res) => {
  try {
    const { studentId, amount, paymentDate, paymentMethod, status, remarks } = req.body;

    const receiptId = 'REC-' + Math.floor(100000 + Math.random() * 900000);

    const newRecord = new FeeRecord({
      studentId,
      amount,
      paymentDate,
      paymentMethod,
      status,
      remarks,
      receiptId
    });

    await newRecord.save();
    successResponse(res, 'Fee record created successfully', newRecord, 201);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

const updateFeeRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const record = await FeeRecord.findByIdAndUpdate(id, updates, { new: true });
    if (!record) return errorResponse(res, 'Record not found', [], 404);

    successResponse(res, 'Fee record updated successfully', record);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

const deleteFeeRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await FeeRecord.findByIdAndDelete(id);
    if (!record) return errorResponse(res, 'Record not found', [], 404);

    successResponse(res, 'Fee record deleted successfully', {});
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

export { getFeeRecords, createFeeRecord, updateFeeRecord, deleteFeeRecord };
