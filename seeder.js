import mongoose from 'mongoose';
import 'dotenv/config';
import Course from './src/models/Course.js';
import StudyMaterial from './src/models/StudyMaterial.js';
import Schedule from './src/models/Schedule.js';
import connectDB from './src/config/database.js';

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('Connected to DB...');

    // Clear existing data
    await Course.deleteMany({});
    await StudyMaterial.deleteMany({});
    await Schedule.deleteMany({});
    console.log('Cleared existing data.');

    // Seed Courses
    const courses = [
      { courseCode: 'PHY-JEE', title: 'Physics Mechanics (JEE Advanced)', description: 'Advanced Physics', category: 'JEE', fee: 15000, mode: 'online' },
      { courseCode: 'CHEM-ORG', title: 'Organic Chemistry Masterclass', description: 'Master Organic Chem', category: 'Foundation', fee: 12000, mode: 'offline' },
      { courseCode: 'MATH-CALC', title: 'Mathematics - Calculus', description: 'Calculus made easy', category: 'JEE', fee: 14000, mode: 'hybrid' }
    ];
    await Course.insertMany(courses);

    // Seed Materials
    const materials = [
      { title: 'Thermodynamics Final Notes', subject: 'Physics', category: 'notes', fileUrl: 'http://example.com/file1.pdf', type: 'PDF' },
      { title: 'Organic Chemistry Pyqs', subject: 'Chemistry', category: 'pyqs', fileUrl: 'http://example.com/file2.pdf', type: 'PDF' },
      { title: 'Calculus Formula Sheet', subject: 'Math', category: 'formula', fileUrl: 'http://example.com/file3.pdf', type: 'PDF' }
    ];
    await StudyMaterial.insertMany(materials);

    // Seed Schedule
    const today = new Date();
    today.setHours(0,0,0,0);
    const schedules = [
      { className: '12th', date: today, startTime: '09:00 AM', endTime: '10:30 AM', subject: 'Physics', topic: 'Rotational Dynamics', instructor: 'Dr. Sharma', type: 'Offline', location: 'Room 204', color: 'blue' },
      { className: '12th', date: today, startTime: '11:00 AM', endTime: '12:30 PM', subject: 'Chemistry', topic: 'Organic', instructor: 'Prof. Desai', type: 'Online', location: 'Zoom', color: 'emerald' },
      { className: 'Other', date: today, startTime: '02:00 PM', endTime: '03:30 PM', subject: 'Math', topic: 'Calculus', instructor: 'Dr. Patel', type: 'Offline', location: 'Room 102', color: 'rose' }
    ];
    await Schedule.insertMany(schedules);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
};

seedDatabase();
