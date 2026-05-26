import mongoose from 'mongoose';

const schema = new mongoose.Schema({}, { strict: false, timestamps: true });

const Test = mongoose.models.Test || mongoose.model('Test', schema);

export default Test;
