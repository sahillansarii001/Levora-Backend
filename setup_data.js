import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Faculty from './src/models/Faculty.js';
import Course from './src/models/Course.js';
import StudyMaterial from './src/models/StudyMaterial.js';
import Result from './src/models/Result.js';

const mockFaculty = [
  { facultyId: "FAC001", name: "Dr. A. Sharma", subject: "Physics", email: "asharma@levora.edu", phone: "9876543210", password: "password123", role: "faculty", experience: 15, qualification: "JEE Advanced Expert" },
  { facultyId: "FAC002", name: "Prof. R. Verma", subject: "Mathematics", email: "rverma@levora.edu", phone: "9876543211", password: "password123", role: "faculty", experience: 12, qualification: "Olympiad Mentor" },
  { facultyId: "FAC003", name: "Mrs. S. Gupta", subject: "Chemistry", email: "sgupta@levora.edu", phone: "9876543212", password: "password123", role: "faculty", experience: 10, qualification: "NEET Top Ranker Maker" },
  { facultyId: "FAC004", name: "Mr. K. Iyer", subject: "Computer Science", email: "kiyer@levora.edu", phone: "9876543213", password: "password123", role: "faculty", experience: 8, qualification: "Python & AI Expert" },
  { facultyId: "FAC005", name: "Dr. P. Desai", subject: "Biology", email: "pdesai@levora.edu", phone: "9876543214", password: "password123", role: "faculty", experience: 20, qualification: "NEET Botany Expert" },
  { facultyId: "FAC006", name: "Mr. M. Singh", subject: "Web Development", email: "msingh@levora.edu", phone: "9876543215", password: "password123", role: "faculty", experience: 6, qualification: "Full Stack MERN" }
];

const mockCourses = [
  { courseCode: "JEE-001", title: "JEE Prep", category: "JEE", fee: 50000, description: "Complete JEE prep", duration: "2 Years" },
  { courseCode: "PY-101", title: "Python Basics", category: "Other", fee: 10000, description: "Python from scratch", duration: "3 Months" }
];

const mockMaterials = [
  { title: "Physics Kinematics Notes", category: "notes", subject: "Physics", board: "CBSE", isPremium: false, fileUrl: "/dummy/physics.pdf" },
  { title: "Chemistry Organic Reactions", category: "formula", subject: "Chemistry", board: "ICSE", isPremium: true, fileUrl: "/dummy/chemistry.pdf" },
  { title: "Math Calculus Integration PYQs", category: "pyqs", subject: "Mathematics", board: "State", isPremium: false, fileUrl: "/dummy/math.pdf" },
  { title: "Python Basics Cheatsheet", category: "notes", subject: "Computer", board: "All", isPremium: false, fileUrl: "/dummy/python.pdf" }
];

const mockResults = [
  { studentName: "Rahul Deshmukh", course: "JEE Advanced", rank: 45, score: 320, year: 2023, board: "Competitive" },
  { studentName: "Priya Sharma", course: "NEET UG", rank: 112, score: 710, year: 2023, board: "Competitive" },
  { studentName: "Amit Patel", course: "CBSE 12th", percentage: 99.2, year: 2023, board: "CBSE" },
  { studentName: "Sneha Reddy", course: "MHT CET", rank: 3, percentage: 98.9, year: 2023, board: "State" },
  { studentName: "Kunal Singh", course: "JEE Main", percentage: 99.98, year: 2023, board: "Competitive" },
  { studentName: "Aditi Rao", course: "ICSE 10th", percentage: 98.8, year: 2023, board: "ICSE" }
];

async function setupData() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { family: 4 });
    console.log('Connected to MongoDB.');

    // Clear old data
    await Faculty.deleteMany({});
    await Course.deleteMany({});
    await StudyMaterial.deleteMany({});
    await Result.deleteMany({});
    
    // Insert new data
    await Faculty.insertMany(mockFaculty);
    await Course.insertMany(mockCourses);
    await StudyMaterial.insertMany(mockMaterials);
    await Result.insertMany(mockResults);
    
    console.log('Successfully injected all mock data!');
    process.exit(0);
  } catch (err) {
    console.error('Setup failed:', err);
    process.exit(1);
  }
}

setupData();
