import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  courseCode: { type: String, unique: true },
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String, enum: ['Foundation', 'JEE', 'NEET', 'Crash Course', 'Other'] },
  duration: { type: String },
  fee: { type: Number, required: true },
  mode: { type: String, enum: ['online', 'offline', 'hybrid'], default: 'offline' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
  batches: [{ type: String }], // e.g. ['11th', '12th', 'Foundation']
  totalStudents: { type: Number, default: 0 },
}, {
  timestamps: true,
});

const Course = mongoose.model('Course', courseSchema);

export default Course;
