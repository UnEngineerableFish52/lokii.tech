const { v4: uuidv4 } = require('uuid');
const Message = require('../models/Message');
const logger = require('../utils/logger');

exports.getGlobalMessages = async (req, res) => {
  try {
    logger.log('Getting global chat messages');
    
    const messages = await Message.find({ type: 'global' });
    
    logger.response(200, { count: messages.length });

    res.json({
      success: true,
      data: { messages }
    });
  } catch (error) {
    logger.error('Error getting global messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get messages'
    });
  }
};

exports.sendGlobalMessage = async (req, res) => {
  try {
    logger.log('Sending global message:', req.body);
    
    const { content } = req.body;
    const { userId, username } = req.user;

    const message = await Message.create({
      messageId: uuidv4(),
      userId,
      username: username || 'Anonymous',
      content,
      type: 'global',
      createdAt: new Date()
    });

    logger.log('Global message created:', message.messageId);
    logger.response(201, message);

    // Emit to Socket.io if available
    if (global.io) {
      global.io.to('global-chat').emit('new-message', message);
      logger.log('Message broadcast to global-chat room');
    }

    res.status(201).json({
      success: true,
      message: 'Message sent',
      data: { message }
    });
  } catch (error) {
    logger.error('Error sending global message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
};

exports.replyToQuestion = async (req, res) => {
  try {
    logger.log('Reply to question request:', req.body);
    
    // This is handled in questionController - redirect or return error
    return res.status(400).json({
      success: false,
      message: 'Use /api/questions/:id/reply endpoint for replying to questions'
    });
  } catch (error) {
    logger.error('Error in replyToQuestion:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process reply'
    });
  }
};
