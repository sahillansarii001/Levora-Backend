import mongoose from 'mongoose';

const feeRecordSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  amount: { type: Number, required: true },
  paymentDate: { type: Date, required: true },
  paymentMethod: { type: String, enum: ['Cash', 'Bank Transfer', 'UPI', 'Cheque', 'Other'], default: 'Cash' },
  status: { type: String, enum: ['Paid', 'Pending', 'Overdue'], default: 'Paid' },
  remarks: { type: String },
  receiptId: { type: String, unique: true }
}, {
  timestamps: true,
});

const FeeRecord = mongoose.models.FeeRecord || mongoose.model('FeeRecord', feeRecordSchema);
export default FeeRecord;
