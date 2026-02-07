const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');
const { authMiddleware } = require('../middleware/auth');
const { checkGradeLevel } = require('../middleware/permissions');
const { generalLimiter, createLimiter } = require('../middleware/rateLimiter');

// GET /api/exams - Get exams for user's grade level
router.get('/',
  generalLimiter,
  authMiddleware,
  examController.getExams
);

// GET /api/exams/:id - Get exam details
router.get('/:id',
  generalLimiter,
  authMiddleware,
  examController.getExam
);

// POST /api/exams/:id/submit - Submit exam answers
router.post('/:id/submit',
  createLimiter,
  authMiddleware,
  examController.submitExam
);

// GET /api/exams/:id/results - Get exam results
router.get('/:id/results',
  generalLimiter,
  authMiddleware,
  examController.getExamResults
);

module.exports = router;
