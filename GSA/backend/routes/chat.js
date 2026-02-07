const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authMiddleware } = require('../middleware/auth');
const { requireVerified } = require('../middleware/permissions');
const { validate, messageValidation } = require('../middleware/validation');
const { generalLimiter, createLimiter } = require('../middleware/rateLimiter');

// GET /api/chat/global - Get all global messages
router.get('/global', generalLimiter, chatController.getGlobalMessages);

// POST /api/chat/global - Send global message (authenticated users only)
router.post('/global', 
  createLimiter,
  authMiddleware,
  validate(messageValidation),
  chatController.sendGlobalMessage
);

// POST /api/chat/global/reply - Reply to question (verified users only)
router.post('/global/reply',
  createLimiter,
  authMiddleware,
  requireVerified,
  validate(messageValidation),
  chatController.replyToQuestion
);

module.exports = router;
