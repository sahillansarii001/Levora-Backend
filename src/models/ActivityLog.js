import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['user', 'system', 'content', 'admin'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  desc: {
    type: String,
    required: true
  }
}, { timestamps: true });

export default mongoose.model('ActivityLog', activityLogSchema);
