import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admission from '../models/Admission.js';

dotenv.config();

const demoAdmissions = [
  {
    inquiryType: 'Take Admission',
    name: 'Aarav Sharma',
    phone: '+91 98765 11111',
    email: 'aarav.sharma@example.com',
    program: 'JEE / NEET Preparation',
    grade: 'Class 11',
    message: 'I am interested in joining the new weekend batch.',
    status: 'pending',
  },
  {
    inquiryType: 'Need Counselling',
    name: 'Priya Patel',
    phone: '+91 98765 22222',
    email: 'priya.patel@example.com',
    program: 'Primary School (Class 1–5)',
    grade: 'Class 4',
    message: 'What are the timings for the primary school program?',
    status: 'pending',
  },
  {
    inquiryType: 'Take Admission',
    name: 'Rahul Singh',
    phone: '+91 98765 33333',
    email: 'rahul.s@example.com',
    program: 'Coding & Tech Courses',
    grade: 'Class 8',
    message: 'Do you teach Python and AI?',
    status: 'pending',
  },
  {
    inquiryType: 'Need Counselling',
    name: 'Ananya Gupta',
    phone: '+91 98765 44444',
    email: 'ananya.g@example.com',
    program: 'Spoken English',
    grade: 'Class 12',
    message: '',
    status: 'pending',
  }
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/levora_academy';
    console.log('Connecting to:', mongoUri);
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    await Admission.insertMany(demoAdmissions);
    console.log(`Seeded ${demoAdmissions.length} demo admissions!`);

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDB();
