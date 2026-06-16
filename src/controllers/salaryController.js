import { Salary, Faculty } from '../models.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/responseHelper.js';

const getSalaryRecords = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const count = await Salary.countDocuments();
    const records = await Salary.find()
      .populate('facultyId', 'name email subject')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ paymentDate: -1 });

    paginatedResponse(res, records, page, limit, count, 'Salary records fetched successfully');
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

const createSalaryRecord = async (req, res) => {
  try {
    const { facultyId, amount, paymentDate, month, paymentMethod, status, remarks } = req.body;

    const transactionId = 'TXN-' + Math.floor(100000 + Math.random() * 900000);

    const newRecord = new Salary({
      facultyId,
      amount,
      paymentDate,
      month,
      paymentMethod,
      status,
      remarks,
      transactionId
    });

    await newRecord.save();
    successResponse(res, 'Salary record created successfully', newRecord, 201);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

const updateSalaryRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const record = await Salary.findByIdAndUpdate(id, updates, { new: true });
    if (!record) return errorResponse(res, 'Record not found', [], 404);

    successResponse(res, 'Salary record updated successfully', record);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

const deleteSalaryRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await Salary.findByIdAndDelete(id);
    if (!record) return errorResponse(res, 'Record not found', [], 404);

    successResponse(res, 'Salary record deleted successfully', {});
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

const getMySalary = async (req, res) => {
  try {
    const facultyId = req.user.id;
    const records = await Salary.find({ facultyId }).sort({ paymentDate: -1 });
    successResponse(res, 'Salary records fetched successfully', records);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

export { getSalaryRecords, createSalaryRecord, updateSalaryRecord, deleteSalaryRecord, getMySalary };
