import mongoose from 'mongoose';

const schema = new mongoose.Schema({}, { strict: false, timestamps: true });

const TestResult = mongoose.models.TestResult || mongoose.model('TestResult', schema);

export default TestResult;
