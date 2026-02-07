const express = require('express');
const router = express.Router();
const privateChatController = require('../controllers/privateChatController');
const { authMiddleware } = require('../middleware/auth');
const { validate, privateChatValidation, inviteCodeValidation, messageValidation } = require('../middleware/validation');
const { generalLimiter, createLimiter } = require('../middleware/rateLimiter');

// GET /api/private-chats - Get user's private chats
router.get('/',
  generalLimiter,
  authMiddleware,
  privateChatController.getUserChats
);

// POST /api/private-chats - Create new private chat
router.post('/',
  createLimiter,
  authMiddleware,
  validate(privateChatValidation),
  privateChatController.createPrivateChat
);

// POST /api/private-chats/join - Join with invite code
router.post('/join',
  createLimiter,
  authMiddleware,
  validate(inviteCodeValidation),
  privateChatController.joinWithInviteCode
);

// POST /api/private-chats/:id/invite - Send invite to user
router.post('/:id/invite',
  createLimiter,
  authMiddleware,
  privateChatController.sendInvite
);

// POST /api/private-chats/:id/consent - Accept/reject invite
router.post('/:id/consent',
  createLimiter,
  authMiddleware,
  privateChatController.handleConsent
);

// GET /api/private-chats/:id/messages - Get messages in private chat
router.get('/:id/messages',
  generalLimiter,
  authMiddleware,
  privateChatController.getChatMessages
);

// POST /api/private-chats/:id/messages - Send message in private chat
router.post('/:id/messages',
  createLimiter,
  authMiddleware,
  validate(messageValidation),
  privateChatController.sendChatMessage
);

module.exports = router;
