import prisma from '../config/prisma.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/responseHelper.js';

const getSalaryRecords = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const count = await prisma.salary.count();
    const records = await prisma.salary.findMany({
      skip,
      take: parseInt(limit),
      orderBy: { paymentDate: 'desc' }
    });

    paginatedResponse(res, records, page, limit, count, 'Salary records fetched successfully');
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

const createSalaryRecord = async (req, res) => {
  try {
    const { facultyId, amount, paymentDate, month, paymentMethod, status, remarks } = req.body;

    const transactionId = 'TXN-' + Math.floor(100000 + Math.random() * 900000);

    const newRecord = await prisma.salary.create({
      data: {
        facultyId,
        amount: parseFloat(amount),
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        month: month || '',
        paymentMethod: paymentMethod || '',
        status: status || '',
        remarks: remarks || '',
        transactionId
      }
    });

    successResponse(res, 'Salary record created successfully', newRecord, 201);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

const updateSalaryRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (updates.paymentDate) updates.paymentDate = new Date(updates.paymentDate);
    if (updates.amount !== undefined) updates.amount = parseFloat(updates.amount);

    const record = await prisma.salary.update({
      where: { id },
      data: updates
    });

    successResponse(res, 'Salary record updated successfully', record);
  } catch (error) {
    if (error.code === 'P2025') {
      return errorResponse(res, 'Record not found', [], 404);
    }
    errorResponse(res, error.message, [], 500);
  }
};

const deleteSalaryRecord = async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.salary.delete({ where: { id } });

    successResponse(res, 'Salary record deleted successfully', {});
  } catch (error) {
    if (error.code === 'P2025') {
      return errorResponse(res, 'Record not found', [], 404);
    }
    errorResponse(res, error.message, [], 500);
  }
};

const getMySalary = async (req, res) => {
  try {
    const facultyId = req.user.id;
    const records = await prisma.salary.findMany({ 
      where: { facultyId },
      orderBy: { paymentDate: 'desc' }
    });
    successResponse(res, 'Salary records fetched successfully', records);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

export { getSalaryRecords, createSalaryRecord, updateSalaryRecord, deleteSalaryRecord, getMySalary };
