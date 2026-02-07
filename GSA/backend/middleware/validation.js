const { body, param, validationResult } = require('express-validator');
const logger = require('../utils/logger');

const validate = (validations) => {
  return async (req, res, next) => {
    logger.log('Running validation for request');
    
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      logger.log('Validation passed');
      return next();
    }

    logger.warn('Validation failed:', errors.array());
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  };
};

// Common validation rules
const messageValidation = [
  body('content')
    .trim()
    .notEmpty().withMessage('Content is required')
    .isLength({ max: 2000 }).withMessage('Content must be less than 2000 characters')
];

const questionValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 200 }).withMessage('Title must be less than 200 characters'),
  body('content')
    .trim()
    .notEmpty().withMessage('Content is required')
    .isLength({ max: 5000 }).withMessage('Content must be less than 5000 characters'),
  body('subject')
    .optional()
    .isIn(['math', 'science', 'history', 'english', 'other'])
    .withMessage('Invalid subject')
];

const privateChatValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Chat name is required')
    .isLength({ max: 100 }).withMessage('Chat name must be less than 100 characters')
];

const inviteCodeValidation = [
  body('inviteCode')
    .trim()
    .notEmpty().withMessage('Invite code is required')
    .isLength({ min: 6, max: 10 }).withMessage('Invalid invite code')
];

module.exports = {
  validate,
  messageValidation,
  questionValidation,
  privateChatValidation,
  inviteCodeValidation
};
