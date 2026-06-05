import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema({
  className: {
    type: String, // e.g. '12th', '10th', 'Other' (for generic courses)
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String, // e.g. '09:00 AM'
    required: true
  },
  endTime: {
    type: String, // e.g. '10:30 AM'
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  topic: {
    type: String,
    required: true
  },
  instructor: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Online', 'Offline'],
    required: true
  },
  location: {
    type: String, // Room number or Meeting Link
    required: true
  },
  color: {
    type: String, // Tailwind color for UI (e.g. 'blue', 'emerald', 'rose')
    default: 'blue'
  }
}, { timestamps: true });

export default mongoose.model('Schedule', scheduleSchema);
