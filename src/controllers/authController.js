import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import Student from '../models/Student.js';
import Parent from '../models/Parent.js';
import Faculty from '../models/Faculty.js';
import { generateOTP, verifyOTP } from '../utils/generateOTP.js';
import { sendEmail, otpEmail } from '../utils/sendEmail.js';
import generateStudentId from '../utils/generateStudentId.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';
import { createAccessToken, createRefreshToken } from '../utils/tokenUtils.js';
import { logActivity } from './activityController.js';
import crypto from 'crypto';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper to generate both tokens for a user
const generateTokens = (user, role) => {
  const payload = { 
    id: user._id, 
    email: user.email, 
    role,
    name: user.name,
    className: user.className
  };
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
      student: { id: student._id, name: student.name, email, studentId: student.studentId, className: student.className },
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

export const login = async (req, res) => {
  try {
    const identifier = req.body.email?.trim(); // can be email or ID
    const password = req.body.password?.trim();

    if (!identifier || !password) {
      return errorResponse(res, 'Please provide email/ID and password', [], 400);
    }

    // 1. Check Admin / Superadmin
    const isAdmin = identifier === (process.env.ADMIN_EMAIL || 'admin@levora.in') && 
                    password === (process.env.ADMIN_PASSWORD || 'LevoraAdmin2026!');
                    
    const isSuperAdmin = identifier === (process.env.SUPERADMIN_EMAIL || 'superadmin@levora.in') && 
                         password === (process.env.SUPERADMIN_PASSWORD || 'LevoraSuper2026!');

    if (isAdmin || isSuperAdmin) {
      const role = isSuperAdmin ? 'superadmin' : 'admin';
      const token = jwt.sign(
        { role, email: identifier },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: process.env.JWT_EXPIRE || '15m' }
      );
      return successResponse(res, `${role === 'superadmin' ? 'Super Admin' : 'Admin'} login successful`, { token, role });
    }

    // 2. Check Student (by email or studentId)
    const student = await Student.findOne({ 
      $or: [{ email: identifier }, { studentId: identifier }] 
    });

    if (student) {
      const isValid = await student.matchPassword(password);
      if (isValid) {
        const { accessToken, refreshToken } = generateTokens(student, 'student');
        return successResponse(res, 'Student login successful', {
          student: { id: student._id, name: student.name, email: student.email, studentId: student.studentId, className: student.className },
          role: 'student',
          accessToken,
          refreshToken,
          // maintain backwards compatibility token naming
          token: accessToken
        });
      }
    }

    // 3. Check Parent (by email or phone)
    const parent = await Parent.findOne({ 
      $or: [{ email: identifier }, { phone: identifier }] 
    });

    if (parent) {
      const isValid = await parent.matchPassword(password);
      if (isValid) {
        const { accessToken, refreshToken } = generateTokens(parent, 'parent');
        return successResponse(res, 'Parent login successful', {
          user: { id: parent._id, name: parent.name, email: parent.email, parentOf: parent.parentOf },
          role: 'parent',
          accessToken,
          refreshToken,
          token: accessToken
        });
      }
    }

    // 4. Check Faculty (by email or facultyId)
    const faculty = await Faculty.findOne({
      $or: [{ email: identifier }, { facultyId: identifier }]
    });

    if (faculty && faculty.status === 'active') {
      const isValid = await faculty.matchPassword(password);
      if (isValid) {
        const { accessToken, refreshToken } = generateTokens(faculty, 'faculty');
        return successResponse(res, 'Faculty login successful', {
          user: { id: faculty._id, name: faculty.name, email: faculty.email, facultyId: faculty.facultyId, subject: faculty.subject },
          role: 'faculty',
          accessToken,
          refreshToken,
          token: accessToken
        });
      }
    }

    return errorResponse(res, 'Invalid credentials', [], 401);
  } catch (error) {
    return errorResponse(res, error.message, [], 500);
  }
};

export const sendOTPCode = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return errorResponse(res, 'Email is required', [], 400);
    }

    const otp = await generateOTP(email);
    console.log(`[DEV MODE] OTP for ${email} is: ${otp}`);
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


export const googleLogin = async (req, res) => {
  try {
    const { idToken, role = 'student' } = req.body;

    if (!idToken) {
      return errorResponse(res, 'Google ID Token is required', [], 400);
    }

    if (!['student', 'parent', 'faculty'].includes(role)) {
      return errorResponse(res, 'Invalid role', [], 400);
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return errorResponse(res, 'Invalid Google token', [], 400);
    }

    const { name, email, picture } = payload;

    let Model;
    if (role === 'student') Model = Student;
    else if (role === 'parent') Model = Parent;
    else if (role === 'faculty') Model = Faculty;

    let user = await Model.findOne({ email });

    // Auto-register if not exists
    if (!user) {
      // Check if email belongs to a different role first
      const studentExists = await Student.findOne({ email });
      const parentExists = await Parent.findOne({ email });
      const facultyExists = await Faculty.findOne({ email });
      
      if (studentExists || parentExists || facultyExists) {
         return errorResponse(res, 'Email already registered under a different role', [], 400);
      }

      // Generate a highly secure random password to satisfy schema requirements
      const randomPassword = crypto.randomBytes(16).toString('hex') + 'A1!';
      
      let userData = {
        name,
        email,
        phone: 'Not Provided',
        password: randomPassword,
        profileImage: picture
      };

      if (role === 'student') {
        userData.studentId = await generateStudentId();
      } else if (role === 'faculty') {
        userData.facultyId = `FAC${Math.floor(1000 + Math.random() * 9000)}`;
      }

      user = await Model.create(userData);
    }

    // Login user
    const { accessToken, refreshToken } = generateTokens(user, role);

    const responseData = { id: user._id, name: user.name, email: user.email, profileImage: user.profileImage || picture };
    if (role === 'student') responseData.studentId = user.studentId;
    if (role === 'faculty') responseData.facultyId = user.facultyId;

    successResponse(res, 'Google Login successful', {
      user: responseData,
      role,
      accessToken,
      refreshToken,
      token: accessToken
    });

  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return errorResponse(res, 'Refresh token is required', [], 400);

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'refresh');
    
    // Generate new access token
    const newAccessToken = createAccessToken({ id: decoded.id, email: decoded.email, role: decoded.role });
    
    successResponse(res, 'Token refreshed successfully', { accessToken: newAccessToken, token: newAccessToken });
  } catch (error) {
    errorResponse(res, 'Invalid or expired refresh token', [], 401);
  }
};
