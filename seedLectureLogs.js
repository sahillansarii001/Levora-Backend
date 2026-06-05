import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { LectureLog } from './src/models.js';
import Faculty from './src/models/Faculty.js';

dotenv.config();

const seedLectureLogs = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');

    const faculties = await Faculty.find();
    if (faculties.length === 0) {
      console.log('No faculty found. Creating a dummy faculty...');
      // Depending on your setup, you might need a faculty to proceed.
      // Assuming at least one exists from previous seeding.
    }
    const facultyId = faculties.length > 0 ? faculties[0]._id : new mongoose.Types.ObjectId();

    console.log('Creating sample lecture logs...');

    await LectureLog.deleteMany();

    await LectureLog.create({
      facultyId,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      subject: 'Physics',
      lesson: 'Chapter 4: Laws of Motion',
      topics: '1. Newton\'s First Law\n2. Inertia and Mass\n3. Momentum'
    });

    await LectureLog.create({
      facultyId,
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      subject: 'Physics',
      lesson: 'Chapter 4: Laws of Motion',
      topics: '1. Newton\'s Second Law\n2. Impulse\n3. Conservation of Momentum'
    });

    await LectureLog.create({
      facultyId,
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      subject: 'Mathematics',
      lesson: 'Calculus: Derivatives',
      topics: '1. Introduction to Limits\n2. The Derivative as a Function'
    });

    console.log('Successfully seeded Lecture Logs!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedLectureLogs();
