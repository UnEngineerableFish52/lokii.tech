const express = require('express');
const router = express.Router();
const privateChatController = require('../controllers/privateChatController');
const { authMiddleware } = require('../middleware/auth');
const { validate, privateChatValidation, inviteCodeValidation, messageValidation } = require('../middleware/validation');

// GET /api/private-chats - Get user's private chats
router.get('/',
  authMiddleware,
  privateChatController.getUserChats
);

// POST /api/private-chats - Create new private chat
router.post('/',
  authMiddleware,
  validate(privateChatValidation),
  privateChatController.createPrivateChat
);

// POST /api/private-chats/join - Join with invite code
router.post('/join',
  authMiddleware,
  validate(inviteCodeValidation),
  privateChatController.joinWithInviteCode
);

// POST /api/private-chats/:id/invite - Send invite to user
router.post('/:id/invite',
  authMiddleware,
  privateChatController.sendInvite
);

// POST /api/private-chats/:id/consent - Accept/reject invite
router.post('/:id/consent',
  authMiddleware,
  privateChatController.handleConsent
);

// GET /api/private-chats/:id/messages - Get messages in private chat
router.get('/:id/messages',
  authMiddleware,
  privateChatController.getChatMessages
);

// POST /api/private-chats/:id/messages - Send message in private chat
router.post('/:id/messages',
  authMiddleware,
  validate(messageValidation),
  privateChatController.sendChatMessage
);

module.exports = router;
