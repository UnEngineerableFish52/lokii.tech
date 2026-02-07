const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const { authMiddleware } = require('../middleware/auth');
const { requireVerified } = require('../middleware/permissions');
const { validate, questionValidation, messageValidation } = require('../middleware/validation');

// GET /api/questions - Get all questions
router.get('/', questionController.getAllQuestions);

// GET /api/questions/:id - Get single question
router.get('/:id', questionController.getQuestion);

// POST /api/questions - Create new question (authenticated users)
router.post('/',
  authMiddleware,
  validate(questionValidation),
  questionController.createQuestion
);

// POST /api/questions/:id/reply - Reply to question (verified users only)
router.post('/:id/reply',
  authMiddleware,
  requireVerified,
  validate(messageValidation),
  questionController.replyToQuestion
);

module.exports = router;
