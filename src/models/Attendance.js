import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  userType: { type: String, enum: ['student', 'faculty'], required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
  date: { type: Date, required: true },
  status: { type: String, enum: ['Present', 'Absent', 'Late', 'Half Day'], required: true },
  remarks: { type: String }
}, {
  timestamps: true,
});

const Attendance = mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);
export default Attendance;
