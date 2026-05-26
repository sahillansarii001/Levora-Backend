import {  body, validationResult  } from 'express-validator';

const validateCreateCourse = [
  body('title').trim().notEmpty().withMessage('Course title is required'),
  body('slug').trim().notEmpty().withMessage('Course slug is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').isIn(['school', 'competitive', 'computer', 'skill']).withMessage('Invalid category'),
  body('duration').notEmpty().withMessage('Duration is required'),
  body('fees').isDecimal().withMessage('Fees must be a valid number'),
];

const validateUpdateCourse = [
  body('title').optional().trim(),
  body('description').optional().trim(),
  body('category').optional().isIn(['school', 'competitive', 'computer', 'skill']),
  body('fees').optional().isDecimal(),
];

const validateCreateFaculty = [
  body('name').trim().notEmpty().withMessage('Faculty name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').matches(/^[0-9]{10}$/).withMessage('Valid phone number is required'),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
];

const validateCreateAdmission = [
  body('studentId').notEmpty().withMessage('Student ID is required'),
  body('courseId').notEmpty().withMessage('Course ID is required'),
];

const validateCreateFee = [
  body('studentId').notEmpty().withMessage('Student ID is required'),
  body('courseId').notEmpty().withMessage('Course ID is required'),
  body('amount').isDecimal().withMessage('Amount must be a valid number'),
  body('dueDate').isISO8601().withMessage('Valid due date is required'),
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
  validateCreateCourse,
  validateUpdateCourse,
  validateCreateFaculty,
  validateCreateAdmission,
  validateCreateFee,
  handleValidationErrors,
};
