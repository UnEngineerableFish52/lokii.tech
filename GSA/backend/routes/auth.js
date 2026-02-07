const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');
const { authLimiter, generalLimiter } = require('../middleware/rateLimiter');

// POST /api/auth/anonymous - Generate anonymous user
router.post('/anonymous', authLimiter, authController.generateAnonymous);

// POST /api/auth/oauth - OAuth login
router.post('/oauth', authLimiter, authController.oauthLogin);

// POST /api/auth/verify - Verify JWT token
router.post('/verify', generalLimiter, authController.verifyToken);

// GET /api/auth/me - Get current user info
router.get('/me', generalLimiter, authMiddleware, authController.getCurrentUser);

module.exports = router;
