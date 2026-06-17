import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const studentSchema = new mongoose.Schema({
  studentId: { type: String, unique: true },
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  dob: { type: Date },
  parentName: { type: String },
  parentPhone: { type: String },
  address: { type: String },
  schoolName: { type: String },
  collegeName: { type: String },
  board: { type: String, enum: ['CBSE', 'ICSE', 'State', 'Other'] },
  className: { type: String },
  course: { type: String },
  batch: { type: String },
  profileImage: { type: String },
  documents: { type: Array, default: [] },
  totalFees: { type: Number, default: 0 },
  admissionDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  isSubscribed: { type: Boolean, default: false },
  subscriptionExpiry: { type: Date },
}, {
  timestamps: true,
});

studentSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

studentSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Student = mongoose.model('Student', studentSchema);

export default Student;
