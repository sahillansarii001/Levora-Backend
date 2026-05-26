import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  photo: { type: String },
  rank: { type: Number },
  score: { type: Number },
  percentage: { type: Number },
  course: { type: String },
  year: { type: Number },
  board: { type: String, enum: ['CBSE', 'ICSE', 'State', 'Competitive', 'All'], default: 'All' },
  achievement: { type: String }
}, {
  timestamps: true,
});

export default mongoose.model('Result', resultSchema);
