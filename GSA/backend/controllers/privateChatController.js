const { v4: uuidv4 } = require('uuid');
const PrivateChat = require('../models/PrivateChat');
const Message = require('../models/Message');
const logger = require('../utils/logger');

// Generate random invite code
const generateInviteCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

exports.getUserChats = async (req, res) => {
  try {
    const { userId } = req.user;
    logger.log('Getting private chats for user:', userId);
    
    const chats = await PrivateChat.find({ 'members.userId': userId });
    
    logger.response(200, { count: chats.length });

    res.json({
      success: true,
      data: { chats }
    });
  } catch (error) {
    logger.error('Error getting user chats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chats'
    });
  }
};

exports.createPrivateChat = async (req, res) => {
  try {
    logger.log('Creating private chat:', req.body);
    
    const { name } = req.body;
    const { userId, username } = req.user;

    const chat = await PrivateChat.create({
      chatId: uuidv4(),
      name,
      creatorId: userId,
      inviteCode: generateInviteCode(),
      members: [{
        userId,
        username: username || 'Anonymous',
        joinedAt: new Date()
      }],
      pendingInvites: [],
      createdAt: new Date()
    });

    logger.log('Private chat created:', chat.chatId);
    logger.response(201, chat);

    res.status(201).json({
      success: true,
      message: 'Private chat created',
      data: { chat }
    });
  } catch (error) {
    logger.error('Error creating private chat:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create chat'
    });
  }
};

exports.joinWithInviteCode = async (req, res) => {
  try {
    logger.log('Joining chat with invite code:', req.body);
    
    const { inviteCode } = req.body;
    const { userId, username } = req.user;

    const chat = await PrivateChat.findOne({ inviteCode });
    
    if (!chat) {
      logger.warn('Chat not found with invite code:', inviteCode);
      return res.status(404).json({
        success: false,
        message: 'Invalid invite code'
      });
    }

    // Check if user is already a member
    const isMember = chat.members.some(m => m.userId === userId);
    if (isMember) {
      logger.warn('User already a member:', userId);
      return res.status(400).json({
        success: false,
        message: 'Already a member of this chat'
      });
    }

    // Add to pending invites (requires consent)
    const isPending = chat.pendingInvites.some(i => i.userId === userId);
    if (!isPending) {
      await PrivateChat.updateOne(
        { chatId: chat.chatId },
        {
          $push: {
            pendingInvites: {
              userId,
              username: username || 'Anonymous',
              invitedAt: new Date()
            }
          }
        }
      );
    }

    logger.log('User added to pending invites:', userId);
    logger.response(200, { chatId: chat.chatId });

    res.json({
      success: true,
      message: 'Invite request sent. Waiting for admin approval.',
      data: { chatId: chat.chatId, chatName: chat.name }
    });
  } catch (error) {
    logger.error('Error joining with invite code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to join chat'
    });
  }
};

exports.sendInvite = async (req, res) => {
  try {
    const { id } = req.params;
    logger.log('Sending invite to chat:', id, req.body);
    
    const { targetUserId, targetUsername } = req.body;
    const { userId } = req.user;

    const chat = await PrivateChat.findOne({ chatId: id });
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check if user is chat creator or member
    const isMember = chat.members.some(m => m.userId === userId);
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Only members can send invites'
      });
    }

    // Check if target is already a member
    const isTargetMember = chat.members.some(m => m.userId === targetUserId);
    if (isTargetMember) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member'
      });
    }

    // Add to pending invites
    const isPending = chat.pendingInvites.some(i => i.userId === targetUserId);
    if (!isPending) {
      await PrivateChat.updateOne(
        { chatId: id },
        {
          $push: {
            pendingInvites: {
              userId: targetUserId,
              username: targetUsername || 'User',
              invitedAt: new Date()
            }
          }
        }
      );
    }

    logger.log('Invite sent to user:', targetUserId);

    res.json({
      success: true,
      message: 'Invite sent'
    });
  } catch (error) {
    logger.error('Error sending invite:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send invite'
    });
  }
};

exports.handleConsent = async (req, res) => {
  try {
    const { id } = req.params;
    logger.log('Handling consent for chat:', id, req.body);
    
    const { accept } = req.body;
    const { userId, username } = req.user;

    const chat = await PrivateChat.findOne({ chatId: id });
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check if user is in pending invites
    const pendingInvite = chat.pendingInvites.find(i => i.userId === userId);
    if (!pendingInvite) {
      return res.status(400).json({
        success: false,
        message: 'No pending invite found'
      });
    }

    if (accept) {
      // Accept: Add to members and remove from pending
      await PrivateChat.updateOne(
        { chatId: id },
        {
          $push: {
            members: {
              userId,
              username: username || 'Anonymous',
              joinedAt: new Date()
            }
          },
          $pull: {
            pendingInvites: { userId }
          }
        }
      );

      logger.log('User accepted invite and joined chat:', userId);

      res.json({
        success: true,
        message: 'Invite accepted. You have joined the chat.',
        data: { chat }
      });
    } else {
      // Reject: Remove from pending
      await PrivateChat.updateOne(
        { chatId: id },
        {
          $pull: {
            pendingInvites: { userId }
          }
        }
      );

      logger.log('User rejected invite:', userId);

      res.json({
        success: true,
        message: 'Invite rejected'
      });
    }
  } catch (error) {
    logger.error('Error handling consent:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process consent'
    });
  }
};

exports.getChatMessages = async (req, res) => {
  try {
    const { id } = req.params;
    logger.log('Getting messages for private chat:', id);
    
    const { userId } = req.user;

    const chat = await PrivateChat.findOne({ chatId: id });
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Verify user is a member
    const isMember = chat.members.some(m => m.userId === userId);
    if (!isMember) {
      logger.warn('User not a member of chat:', userId);
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not a member of this chat.'
      });
    }

    const messages = await Message.find({ type: 'private', chatId: id });
    
    logger.response(200, { count: messages.length });

    res.json({
      success: true,
      data: { messages }
    });
  } catch (error) {
    logger.error('Error getting chat messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get messages'
    });
  }
};

exports.sendChatMessage = async (req, res) => {
  try {
    const { id } = req.params;
    logger.log('Sending message to private chat:', id, req.body);
    
    const { content } = req.body;
    const { userId, username } = req.user;

    const chat = await PrivateChat.findOne({ chatId: id });
    
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Verify user is a member
    const isMember = chat.members.some(m => m.userId === userId);
    if (!isMember) {
      logger.warn('User not a member of chat:', userId);
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not a member of this chat.'
      });
    }

    const message = await Message.create({
      messageId: uuidv4(),
      userId,
      username: username || 'Anonymous',
      content,
      type: 'private',
      chatId: id,
      createdAt: new Date()
    });

    logger.log('Private message created:', message.messageId);
    logger.response(201, message);

    // Emit to Socket.io if available
    if (global.io) {
      global.io.to(`private-chat-${id}`).emit('new-message', message);
      logger.log('Message broadcast to private chat room');
    }

    res.status(201).json({
      success: true,
      message: 'Message sent',
      data: { message }
    });
  } catch (error) {
    logger.error('Error sending chat message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
};
