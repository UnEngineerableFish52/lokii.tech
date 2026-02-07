const express = require('express');
const router = express.Router();
const studentsController = require('../controllers/studentsController');
const { authMiddleware } = require('../middleware/auth');
const { generalLimiter } = require('../middleware/rateLimiter');

// GET /api/students - Get students by grade level
router.get('/',
  generalLimiter,
  authMiddleware,
  studentsController.getStudentsByGrade
);

// GET /api/students/search - Search students by criteria
router.get('/search',
  generalLimiter,
  authMiddleware,
  studentsController.searchStudents
);

// PUT /api/students/profile - Update user profile
router.put('/profile',
  generalLimiter,
  authMiddleware,
  studentsController.updateProfile
);

// GET /api/students/:userId - Get student profile
router.get('/:userId',
  generalLimiter,
  authMiddleware,
  studentsController.getStudentProfile
);

module.exports = router;
