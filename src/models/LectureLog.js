import mongoose from 'mongoose';

const lectureLogSchema = new mongoose.Schema({
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  subject: {
    type: String,
    required: true
  },
  topics: {
    type: String,
    required: true
  },
  lesson: {
    type: String,
    required: true
  }
}, { timestamps: true });

export default mongoose.model('LectureLog', lectureLogSchema);
