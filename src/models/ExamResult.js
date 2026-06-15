import mongoose from 'mongoose';

const examResultSchema = new mongoose.Schema({
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Student', 
    required: true 
  },
  examName: { 
    type: String, 
    required: true 
  },
  subject: { 
    type: String, 
    required: true 
  },
  marksObtained: { 
    type: Number, 
    required: true 
  },
  totalMarks: { 
    type: Number, 
    required: true 
  },
  remarks: { 
    type: String 
  },
  examDate: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true,
});

export default mongoose.model('ExamResult', examResultSchema);
