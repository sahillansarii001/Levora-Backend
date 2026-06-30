import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import prisma from '../config/prisma.js';
import { generateOTP, verifyOTP } from '../utils/generateOTP.js';
import { sendEmail, otpEmail } from '../utils/sendEmail.js';
import generateStudentId from '../utils/generateStudentId.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';
import { createAccessToken, createRefreshToken } from '../utils/tokenUtils.js';
import { logActivity } from './activityController.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper to generate both tokens for a user
const generateTokens = (user, role) => {
  const payload = { 
    id: user.id, 
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

    let existingUser;
    if (role === 'student') existingUser = await prisma.student.findUnique({ where: { email } });
    else if (role === 'parent') existingUser = await prisma.parent.findUnique({ where: { email } });
    else if (role === 'faculty') existingUser = await prisma.faculty.findUnique({ where: { email } });

    if (existingUser) {
      return errorResponse(res, 'Email already registered', [], 400);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let user;
    if (role === 'student') {
      user = await prisma.student.create({
        data: {
          studentId: await generateStudentId(),
          name,
          email,
          phone,
          password: hashedPassword,
          dob: otherData.dob ? new Date(otherData.dob) : null,
          schoolName: otherData.schoolName || '',
          className: otherData.className || ''
        }
      });
    } else if (role === 'faculty') {
      user = await prisma.faculty.create({
        data: {
          facultyId: `FAC${Math.floor(1000 + Math.random() * 9000)}`,
          name,
          email,
          phone,
          password: hashedPassword,
          subject: otherData.subject || 'General'
        }
      });
    } else if (role === 'parent') {
      user = await prisma.parent.create({
        data: {
          name,
          email,
          phone,
          password: hashedPassword,
          parentOf: otherData.parentOf || ''
        }
      });
    }

    const { accessToken, refreshToken } = generateTokens(user, role);

    const responseData = { id: user.id, name, email };
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

    const student = await prisma.student.findUnique({ where: { email } });
    if (!student) {
      return errorResponse(res, 'Invalid credentials', [], 401);
    }

    const isValid = await bcrypt.compare(password, student.password);
    if (!isValid) {
      return errorResponse(res, 'Invalid credentials', [], 401);
    }

    if (student.status === 'pending') {
      return errorResponse(res, 'Account pending approval by admin', [], 401);
    }
    if (student.status === 'rejected') {
      return errorResponse(res, 'Account registration rejected', [], 401);
    }

    const { accessToken, refreshToken } = generateTokens(student, 'student');

    successResponse(res, 'Login successful', {
      student: { id: student.id, name: student.name, email, studentId: student.studentId, className: student.className },
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

    const adminUser = await prisma.admin.findUnique({ where: { email } });
    
    if (!adminUser) {
      return errorResponse(res, 'Invalid administrative credentials', [], 401);
    }

    const isValid = await bcrypt.compare(password, adminUser.password);
    if (!isValid) {
      return errorResponse(res, 'Invalid administrative credentials', [], 401);
    }

    const role = adminUser.role;

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
    const adminUser = await prisma.admin.findUnique({ where: { email: identifier } });

    if (adminUser) {
      const isValid = await bcrypt.compare(password, adminUser.password);
      if (isValid) {
        const role = adminUser.role;
        const token = jwt.sign(
          { role, email: identifier },
          process.env.JWT_SECRET || 'secret',
          { expiresIn: process.env.JWT_EXPIRE || '15m' }
        );
        return successResponse(res, `${role === 'superadmin' ? 'Super Admin' : 'Admin'} login successful`, { token, role });
      }
    }

    // 2. Check Student (by email or studentId)
    const student = await prisma.student.findFirst({ 
      where: { OR: [{ email: identifier }, { studentId: identifier }] } 
    });

    if (student) {
      const isValid = await bcrypt.compare(password, student.password);
      if (isValid) {
        if (student.status === 'pending') {
          return errorResponse(res, 'Account pending approval by admin', [], 401);
        }
        if (student.status === 'rejected') {
          return errorResponse(res, 'Account registration rejected', [], 401);
        }
        const { accessToken, refreshToken } = generateTokens(student, 'student');
        return successResponse(res, 'Student login successful', {
          student: { id: student.id, name: student.name, email: student.email, studentId: student.studentId, className: student.className, materialsAccess: student.materialsAccess },
          role: 'student',
          accessToken,
          refreshToken,
          token: accessToken
        });
      }
    }

    // 3. Check Parent (by email or phone)
    const parent = await prisma.parent.findFirst({ 
      where: { OR: [{ email: identifier }, { phone: identifier }] } 
    });

    if (parent) {
      const isValid = await bcrypt.compare(password, parent.password);
      if (isValid) {
        if (parent.status === 'pending') {
          return errorResponse(res, 'Account pending approval by admin', [], 401);
        }
        if (parent.status === 'rejected') {
          return errorResponse(res, 'Account registration rejected', [], 401);
        }
        const { accessToken, refreshToken } = generateTokens(parent, 'parent');
        return successResponse(res, 'Parent login successful', {
          user: { id: parent.id, name: parent.name, email: parent.email, parentOf: parent.parentOf, materialsAccess: parent.materialsAccess },
          role: 'parent',
          accessToken,
          refreshToken,
          token: accessToken
        });
      }
    }

    // 4. Check Faculty (by email or facultyId)
    const faculty = await prisma.faculty.findFirst({
      where: { OR: [{ email: identifier }, { facultyId: identifier }] }
    });

    if (faculty) {
      const isValid = await bcrypt.compare(password, faculty.password);
      if (isValid) {
        if (faculty.status === 'pending') {
          return errorResponse(res, 'Account pending approval by admin', [], 401);
        }
        if (faculty.status === 'rejected') {
          return errorResponse(res, 'Account registration rejected', [], 401);
        }
        const { accessToken, refreshToken } = generateTokens(faculty, 'faculty');
        return successResponse(res, 'Faculty login successful', {
          user: { id: faculty.id, name: faculty.name, email: faculty.email, facultyId: faculty.facultyId, subject: faculty.subject, materialsAccess: faculty.materialsAccess },
          role: 'faculty',
          accessToken,
          refreshToken,
          token: accessToken
        });
      }
    }

    // 5. Check normal User
    const user = await prisma.user.findUnique({
      where: { email: identifier }
    });

    if (user) {
      const isValid = user.password === password || await bcrypt.compare(password, user.password);
      if (isValid) {
        if (user.status === 'pending') {
          return errorResponse(res, 'Account pending approval by admin', [], 401);
        }
        if (user.status === 'rejected') {
          return errorResponse(res, 'Account registration rejected', [], 401);
        }
        const { accessToken, refreshToken } = generateTokens(user, 'user');
        return successResponse(res, 'User login successful', {
          user: { id: user.id, name: user.name, email: user.email, materialsAccess: user.materialsAccess, needsPasswordReset: user.needsPasswordReset },
          role: 'user',
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
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return errorResponse(res, 'Email and OTP are required', [], 400);
    }
    
    const otpVerification = await verifyOTP(email, otp);
    if (!otpVerification.valid) {
      return errorResponse(res, otpVerification.message, [], 400);
    }
    
    successResponse(res, 'OTP verified successfully', {});
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
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

    let user;
    if (role === 'student') user = await prisma.student.findUnique({ where: { email } });
    else if (role === 'parent') user = await prisma.parent.findUnique({ where: { email } });
    else if (role === 'faculty') user = await prisma.faculty.findUnique({ where: { email } });

    // Auto-register if not exists
    if (!user) {
      // Check if email belongs to a different role first
      const studentExists = await prisma.student.findUnique({ where: { email } });
      const parentExists = await prisma.parent.findUnique({ where: { email } });
      const facultyExists = await prisma.faculty.findUnique({ where: { email } });
      
      if (studentExists || parentExists || facultyExists) {
         return errorResponse(res, 'Email already registered under a different role', [], 400);
      }

      // Generate a highly secure random password to satisfy schema requirements
      const randomPassword = crypto.randomBytes(16).toString('hex') + 'A1!';
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);
      
      let userData = {
        name,
        email,
        phone: 'Not Provided',
        password: hashedPassword,
        profileImage: picture
      };

      if (role === 'student') {
        userData.studentId = await generateStudentId();
        user = await prisma.student.create({ data: userData });
      } else if (role === 'faculty') {
        userData.facultyId = `FAC${Math.floor(1000 + Math.random() * 9000)}`;
        user = await prisma.faculty.create({ data: userData });
      } else if (role === 'parent') {
        user = await prisma.parent.create({ data: userData });
      }
    }

    if (user.status === 'pending') {
      return errorResponse(res, 'Account pending approval by admin', [], 401);
    }
    if (user.status === 'rejected') {
      return errorResponse(res, 'Account registration rejected', [], 401);
    }

    // Login user
    const { accessToken, refreshToken } = generateTokens(user, role);

    const responseData = { id: user.id, name: user.name, email: user.email, profileImage: user.profileImage || picture, materialsAccess: user.materialsAccess };
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

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return errorResponse(res, 'Email is required', [], 400);
    }

    const student = await prisma.student.findUnique({ where: { email } });
    const parent = await prisma.parent.findUnique({ where: { email } });
    const faculty = await prisma.faculty.findUnique({ where: { email } });

    if (!student && !parent && !faculty) {
      return errorResponse(res, 'No account found with this email', [], 404);
    }

    const otp = await generateOTP(email);
    console.log(`[DEV MODE] Forgot Password OTP for ${email} is: ${otp}`);
    
    const emailResult = await sendEmail(email, 'Your Levora Academy Password Reset Code', otpEmail(otp));

    if (emailResult.success) {
      successResponse(res, 'Password reset code sent successfully', { email });
    } else {
      errorResponse(res, 'Failed to send reset code email', [], 500);
    }
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return errorResponse(res, 'Email, reset code, and new password are required', [], 400);
    }

    const otpVerification = await verifyOTP(email, otp);
    if (!otpVerification.valid) {
      return errorResponse(res, otpVerification.message, [], 400);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const student = await prisma.student.findUnique({ where: { email } });
    if (student) {
      await prisma.student.update({ where: { id: student.id }, data: { password: hashedPassword } });
      return successResponse(res, 'Password has been reset successfully', {});
    }

    const parent = await prisma.parent.findUnique({ where: { email } });
    if (parent) {
      await prisma.parent.update({ where: { id: parent.id }, data: { password: hashedPassword } });
      return successResponse(res, 'Password has been reset successfully', {});
    }

    const faculty = await prisma.faculty.findUnique({ where: { email } });
    if (faculty) {
      await prisma.faculty.update({ where: { id: faculty.id }, data: { password: hashedPassword } });
      return successResponse(res, 'Password has been reset successfully', {});
    }

    return errorResponse(res, 'No account found with this email', [], 404);
  } catch (error) {
    errorResponse(res, error.message, [], 500);
  }
};

export const setupAccount = async (req, res) => {
  try {
    const { email, password, newEmail } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Email and password are required', [], 400);
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return errorResponse(res, 'User not found', [], 404);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await prisma.user.update({
      where: { email },
      data: {
        email: newEmail || email,
        password: hashedPassword,
        needsPasswordReset: false
      }
    });

    return successResponse(res, 'Account setup successful. Please log in with your new credentials.', {});
  } catch (error) {
    return errorResponse(res, error.message, [], 500);
  }
};
