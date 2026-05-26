import mongoose from 'mongoose';

const schema = new mongoose.Schema({}, { strict: false, timestamps: true });

const Attendance = mongoose.models.Attendance || mongoose.model('Attendance', schema);

export default Attendance;
