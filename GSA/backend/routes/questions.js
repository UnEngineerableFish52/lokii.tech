const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const { authMiddleware } = require('../middleware/auth');
const { requireVerified } = require('../middleware/permissions');
const { validate, questionValidation, messageValidation } = require('../middleware/validation');
const { generalLimiter, createLimiter } = require('../middleware/rateLimiter');

// GET /api/questions - Get all questions
router.get('/', generalLimiter, questionController.getAllQuestions);

// GET /api/questions/:id - Get single question
router.get('/:id', generalLimiter, questionController.getQuestion);

// POST /api/questions - Create new question (authenticated users)
router.post('/',
  createLimiter,
  authMiddleware,
  validate(questionValidation),
  questionController.createQuestion
);

// POST /api/questions/:id/reply - Reply to question (verified users only)
router.post('/:id/reply',
  createLimiter,
  authMiddleware,
  requireVerified,
  validate(messageValidation),
  questionController.replyToQuestion
);

module.exports = router;
