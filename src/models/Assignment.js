import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  subject: { type: String, required: true },
  className: { type: String, required: true },
  dueDate: { type: Date, required: true },
  fileUrl: { type: String }, // Optional attachment like PDF/Doc
  submissions: [
    {
      studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
      status: { type: String, enum: ['pending', 'completed'], default: 'completed' },
      completedAt: { type: Date, default: Date.now }
    }
  ],
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
}, {
  timestamps: true,
});

export default mongoose.model('Assignment', assignmentSchema);
