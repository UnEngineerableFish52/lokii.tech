const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');
const { authMiddleware } = require('../middleware/auth');
const { checkGradeLevel } = require('../middleware/permissions');

// GET /api/exams - Get exams for user's grade level
router.get('/',
  authMiddleware,
  examController.getExams
);

// GET /api/exams/:id - Get exam details
router.get('/:id',
  authMiddleware,
  examController.getExam
);

// POST /api/exams/:id/submit - Submit exam answers
router.post('/:id/submit',
  authMiddleware,
  examController.submitExam
);

// GET /api/exams/:id/results - Get exam results
router.get('/:id/results',
  authMiddleware,
  examController.getExamResults
);

module.exports = router;
