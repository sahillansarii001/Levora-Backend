import prisma from '../config/prisma.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/responseHelper.js';

const getFeeRecords = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const count = await prisma.feeRecord.count();
    
    // We can't automatically populate 'studentId' unless relations are defined in Prisma.
    // For now we just return the raw records.
    const records = await prisma.feeRecord.findMany({
      skip,
      take: parseInt(limit),
      orderBy: { paymentDate: 'desc' }
    });

    paginatedResponse(res, records, page, limit, count, 'Fee records fetched successfully');
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

const createFeeRecord = async (req, res) => {
  try {
    const { studentId, amount, paymentDate, paymentMethod, status, remarks } = req.body;

    const receiptId = 'REC-' + Math.floor(100000 + Math.random() * 900000);

    const newRecord = await prisma.feeRecord.create({
      data: {
        studentId,
        amount: parseFloat(amount),
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        paymentMethod: paymentMethod || 'Cash',
        status: status || 'Paid',
        remarks: remarks || '',
        receiptId
      }
    });

    successResponse(res, 'Fee record created successfully', newRecord, 201);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

const updateFeeRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (updates.paymentDate) {
      updates.paymentDate = new Date(updates.paymentDate);
    }
    if (updates.amount) {
      updates.amount = parseFloat(updates.amount);
    }

    const record = await prisma.feeRecord.update({
      where: { id },
      data: updates
    });

    successResponse(res, 'Fee record updated successfully', record);
  } catch (error) {
    if (error.code === 'P2025') {
      return errorResponse(res, 'Record not found', [], 404);
    }
    errorResponse(res, error.message, [], 500);
  }
};

const deleteFeeRecord = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.feeRecord.delete({ where: { id } });

    successResponse(res, 'Fee record deleted successfully', {});
  } catch (error) {
    if (error.code === 'P2025') {
      return errorResponse(res, 'Record not found', [], 404);
    }
    errorResponse(res, error.message, [], 500);
  }
};

export { getFeeRecords, createFeeRecord, updateFeeRecord, deleteFeeRecord };
