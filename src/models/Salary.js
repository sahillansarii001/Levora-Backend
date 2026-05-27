import mongoose from 'mongoose';

const salarySchema = new mongoose.Schema({
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
  amount: { type: Number, required: true },
  paymentDate: { type: Date, required: true },
  month: { type: String, required: true }, // e.g., 'October 2024'
  paymentMethod: { type: String, enum: ['Bank Transfer', 'Cash', 'Cheque', 'Other'], default: 'Bank Transfer' },
  status: { type: String, enum: ['Paid', 'Pending'], default: 'Paid' },
  remarks: { type: String },
  transactionId: { type: String }
}, {
  timestamps: true,
});

const Salary = mongoose.models.Salary || mongoose.model('Salary', salarySchema);
export default Salary;
