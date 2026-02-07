const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

// POST /api/auth/anonymous - Generate anonymous user
router.post('/anonymous', authController.generateAnonymous);

// POST /api/auth/oauth - OAuth login
router.post('/oauth', authController.oauthLogin);

// POST /api/auth/verify - Verify JWT token
router.post('/verify', authController.verifyToken);

// GET /api/auth/me - Get current user info
router.get('/me', authMiddleware, authController.getCurrentUser);

module.exports = router;
