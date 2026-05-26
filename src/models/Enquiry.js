import mongoose from 'mongoose';

const schema = new mongoose.Schema({}, { strict: false, timestamps: true });

const Enquiry = mongoose.models.Enquiry || mongoose.model('Enquiry', schema);

export default Enquiry;
