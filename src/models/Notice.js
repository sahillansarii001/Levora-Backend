import mongoose from 'mongoose';

const noticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['general', 'exam', 'holiday', 'result'],
    default: 'general'
  },
  targetAudience: {
    type: String,
    enum: ['all', 'students', 'parents'],
    default: 'all'
  }
}, { timestamps: true });

export default mongoose.model('Notice', noticeSchema);
