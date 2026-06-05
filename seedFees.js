import mongoose from 'mongoose';
import dotenv from 'dotenv';
import FeeRecord from './src/models/FeeRecord.js';
import Notice from './src/models/Notice.js';
import Student from './src/models/Student.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');

    const students = await Student.find();
    if (students.length === 0) {
      console.log('No students found. Run seeder.js first to create students.');
      process.exit();
    }

    console.log(`Found ${students.length} students. Creating fee records and notices...`);

    // Clear existing fees and notices
    await FeeRecord.deleteMany();
    await Notice.deleteMany();

    // Create Fee Records
    for (const student of students) {
      const feeStatuses = ['Paid', 'Pending'];
      const status = feeStatuses[Math.floor(Math.random() * feeStatuses.length)];
      const amount = Math.floor(Math.random() * 5000) + 1000;

      await FeeRecord.create({
        studentId: student._id,
        amount: amount,
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        paymentDate: new Date(),
        status: status,
        receiptId: `REC${Math.floor(10000 + Math.random() * 90000)}`
      });
    }

    // Create Notices
    await Notice.create({
      title: 'Upcoming Mock Exams',
      content: 'Mock exams will start next week. Please refer to the study material portal.',
      targetAudience: 'all',
      targetClass: 'All',
      date: new Date()
    });

    await Notice.create({
      title: 'Fee Submission Deadline',
      content: 'The last date to submit the pending term fees is the 15th of this month.',
      targetAudience: 'parents',
      targetClass: 'All',
      date: new Date()
    });

    console.log('Successfully seeded Fee Records and Notices!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedData();
