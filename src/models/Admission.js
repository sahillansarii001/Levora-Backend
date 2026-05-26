import mongoose from 'mongoose';

const schema = new mongoose.Schema({}, { strict: false, timestamps: true });

const Admission = mongoose.models.Admission || mongoose.model('Admission', schema);

export default Admission;
