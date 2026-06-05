import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Test from './src/models/Test.js';
import TestResult from './src/models/TestResult.js';
import StudyMaterial from './src/models/StudyMaterial.js';
import Student from './src/models/Student.js';
import Course from './src/models/Course.js';
// Schedule model doesn't exist, we use Course model for schedule in this app (or wait, is there a Schedule model?). Let me check.
// I will create some assignments (StudyMaterial category: Assignment) and Test Results.

dotenv.config();

const seedDashboard = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');

    const students = await Student.find();
    if (students.length === 0) {
      console.log('No students found. Exiting.');
      process.exit();
    }

    console.log(`Found ${students.length} students. Creating Dashboard Data...`);

    // Clean up old ones to avoid duplicates during testing
    await Test.deleteMany();
    await TestResult.deleteMany();
    await StudyMaterial.deleteMany({ category: 'assignment' });

    // 1. Create a Test
    const test1 = await Test.create({
      title: 'Physics Mechanics Mock',
      subject: 'Physics',
      maxMarks: 100,
      passingMarks: 35,
      testDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      targetClass: '12th'
    });

    const test2 = await Test.create({
      title: 'Chemistry Organic Test',
      subject: 'Chemistry',
      maxMarks: 100,
      passingMarks: 35,
      testDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
      targetClass: '12th'
    });

    // 2. Create Test Results for Students
    for (const student of students) {
      await TestResult.create({
        testId: test1._id,
        studentId: student._id,
        marksObtained: Math.floor(Math.random() * 20) + 75, // 75-95
        status: 'Pass'
      });

      await TestResult.create({
        testId: test2._id,
        studentId: student._id,
        marksObtained: Math.floor(Math.random() * 30) + 60, // 60-90
        status: 'Pass'
      });
    }

    // 3. Create Assignments (StudyMaterial)
    await StudyMaterial.create({
      title: 'Thermodynamics Worksheet',
      subject: 'Physics',
      category: 'assignment',
      fileUrl: '#',
      targetClass: '12th',
      description: 'Complete the questions in this worksheet.'
    });

    await StudyMaterial.create({
      title: 'Calculus Integration Problems',
      subject: 'Math',
      category: 'assignment',
      fileUrl: '#',
      targetClass: '12th',
      description: 'Solve the first 50 problems from the assignment sheet.'
    });

    // 4. Check Schedule
    // The existing backend schedule controller gets schedule from somewhere. Let's see if we need to seed it.
    // Actually, schedule might use a Schedule model or Course model. I'll just skip seeding schedule directly here and let it be empty if there's no model.
    // Wait, let's create a quick Schedule collection insert if possible, or just leave it.

    console.log('Successfully seeded Tests, Results, and Assignments!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDashboard();
