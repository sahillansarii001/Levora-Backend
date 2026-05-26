import mongoose from 'mongoose';

const schema = new mongoose.Schema({}, { strict: false, timestamps: true });

const FeeRecord = mongoose.models.FeeRecord || mongoose.model('FeeRecord', schema);

export default FeeRecord;
