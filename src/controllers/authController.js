import jwt from 'jsonwebtoken';
import Student from '../models/Student.js';
import Parent from '../models/Parent.js';
import Faculty from '../models/Faculty.js';
import { generateOTP, verifyOTP } from '../utils/generateOTP.js';
import { sendEmail, otpEmail } from '../utils/sendEmail.js';
import generateStudentId from '../utils/generateStudentId.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';

// Helper to generate both tokens for a user
const generateTokens = (user, role) => {
  const payload = { id: user._id, email: user.email, role };
  const accessToken = createAccessToken(payload);
  const refreshToken = createRefreshToken(payload);
  return { accessToken, refreshToken };
};

export const registerUser = async (req, res) => {
  try {
    const { role, name, email, phone, password, otp, ...otherData } = req.body;

    if (!role || !['student', 'parent', 'faculty'].includes(role)) {
      return errorResponse(res, 'Invalid or missing role', [], 400);
    }
    
    if (!otp) {
      return errorResponse(res, 'OTP is required', [], 400);
    }

    const otpVerification = await verifyOTP(email, otp);
    if (!otpVerification.valid) {
      return errorResponse(res, otpVerification.message, [], 400);
    }

    let Model;
    if (role === 'student') Model = Student;
    else if (role === 'parent') Model = Parent;
    else if (role === 'faculty') Model = Faculty;

    const existingUser = await Model.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 'Email already registered', [], 400);
    }

    let userData = { name, email, phone, password };

    if (role === 'student') {
      userData.studentId = await generateStudentId();
      userData.dob = otherData.dob;
      userData.schoolName = otherData.schoolName;
      userData.className = otherData.className;
    } else if (role === 'faculty') {
      userData.facultyId = `FAC${Math.floor(1000 + Math.random() * 9000)}`;
      userData.subject = otherData.subject || 'General';
    } else if (role === 'parent') {
      userData.parentOf = otherData.parentOf;
    }

    const user = await Model.create(userData);

    const { accessToken, refreshToken } = generateTokens(user, role);

    const responseData = { id: user._id, name, email };
    if (role === 'student') responseData.studentId = user.studentId;
    if (role === 'faculty') responseData.facultyId = user.facultyId;

    successResponse(res, `${role.charAt(0).toUpperCase() + role.slice(1)} registered successfully`, {
      user: responseData,
      accessToken,
      refreshToken,
    }, 201);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

export const studentLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const student = await Student.findOne({ email });
    if (!student) {
      return errorResponse(res, 'Invalid credentials', [], 401);
    }

    const isValid = await student.matchPassword(password);
    if (!isValid) {
      return errorResponse(res, 'Invalid credentials', [], 401);
    }

    const { accessToken, refreshToken } = generateTokens(student, 'student');

    successResponse(res, 'Login successful', {
      student: { id: student._id, name: student.name, email, studentId: student.studentId },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

export const adminLogin = async (req, res) => {
  try {
    const email = req.body.email?.trim();
    const password = req.body.password?.trim();

    const isAdmin = email === (process.env.ADMIN_EMAIL || 'admin@levora.in') && 
                    password === (process.env.ADMIN_PASSWORD || 'LevoraAdmin2026!');
                    
    const isSuperAdmin = email === (process.env.SUPERADMIN_EMAIL || 'superadmin@levora.in') && 
                         password === (process.env.SUPERADMIN_PASSWORD || 'LevoraSuper2026!');

    if (!isAdmin && !isSuperAdmin) {
      return errorResponse(res, 'Invalid administrative credentials', [], 401);
    }

    const role = isSuperAdmin ? 'superadmin' : 'admin';

    const token = jwt.sign(
      { role, email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRE || '15m' }
    );

    successResponse(res, `${role === 'superadmin' ? 'Super Admin' : 'Admin'} login successful`, { token, role });
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

export const sendOTPCode = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return errorResponse(res, 'Email is required', [], 400);
    }

    const otp = await generateOTP(email);
    const emailResult = await sendEmail(email, 'Your Levora Academy OTP', otpEmail(otp));

    if (emailResult.success) {
      successResponse(res, 'OTP sent successfully to email', { email });
    } else {
      errorResponse(res, 'Failed to send OTP email', [], 500);
    }
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

export const verifyOTPCode = async (req, res) => {
  res.send('Not implemented yet');
};
