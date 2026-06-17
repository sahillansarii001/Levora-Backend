import jwt from 'jsonwebtoken';
import Student from '../models/Student.js';

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

// @desc    Auth student & get token
// @route   POST /api/auth/student/login
// @access  Public
export const authStudent = async (req, res) => {
  try {
    const { email, password } = req.body;

    const student = await Student.findOne({ email });

    if (student && (await student.matchPassword(password))) {
      res.json({
        success: true,
        data: {
          _id: student._id,
          name: student.name,
          email: student.email,
          className: student.className,
          isSubscribed: student.isSubscribed,
          token: generateToken(student._id),
        }
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Register a new student
// @route   POST /api/auth/student/register
// @access  Public
export const registerStudent = async (req, res) => {
  try {
    const { name, email, phone, password, className } = req.body;

    const studentExists = await Student.findOne({ email });

    if (studentExists) {
      return res.status(400).json({ success: false, message: 'Student already exists' });
    }

    const student = await Student.create({
      name,
      email,
      phone,
      password,
      className,
      studentId: `STU${Math.floor(1000 + Math.random() * 9000)}`, // Generate random ID
    });

    if (student) {
      res.status(201).json({
        success: true,
        data: {
          _id: student._id,
          name: student.name,
          email: student.email,
          className: student.className,
          isSubscribed: student.isSubscribed,
          token: generateToken(student._id),
        }
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid student data' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get student profile
// @route   GET /api/auth/student/profile
// @access  Private
export const getStudentProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.user._id).select('-password');

    if (student) {
      res.json({
        success: true,
        data: student
      });
    } else {
      res.status(404).json({ success: false, message: 'Student not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
