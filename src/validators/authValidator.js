import {  body, validationResult  } from 'express-validator';

const validateStudentRegister = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').matches(/^[0-9]{10}$/).withMessage('Valid phone number is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('schoolName').trim().notEmpty().withMessage('School name is required'),
  body('className').trim().notEmpty().withMessage('Class name is required'),
];

const validateStudentLogin = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const validateAdminLogin = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const validateOTP = [
  body('phone').matches(/^[0-9]{10}$/).withMessage('Valid phone number is required'),
];

const validateVerifyOTP = [
  body('phone').matches(/^[0-9]{10}$/).withMessage('Valid phone number is required'),
  body('otp').matches(/^[0-9]{6}$/).withMessage('OTP must be 6 digits'),
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array().map(e => ({ field: e.param, message: e.msg })),
    });
  }
  next();
};

module.exports = {
  validateStudentRegister,
  validateStudentLogin,
  validateAdminLogin,
  validateOTP,
  validateVerifyOTP,
  handleValidationErrors,
};
