const { v4: uuidv4 } = require('uuid');
const Question = require('../models/Question');
const logger = require('../utils/logger');

exports.getAllQuestions = async (req, res) => {
  try {
    logger.log('Getting all questions');
    
    const { subject } = req.query;
    const query = subject ? { subject } : {};
    
    const questions = await Question.find(query);
    
    logger.response(200, { count: questions.length });

    res.json({
      success: true,
      data: { questions }
    });
  } catch (error) {
    logger.error('Error getting questions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get questions'
    });
  }
};

exports.getQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    logger.log('Getting question:', id);
    
    const question = await Question.findOne({ questionId: id });
    
    if (!question) {
      logger.warn('Question not found:', id);
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    logger.response(200, question);

    res.json({
      success: true,
      data: { question }
    });
  } catch (error) {
    logger.error('Error getting question:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get question'
    });
  }
};

exports.createQuestion = async (req, res) => {
  try {
    logger.log('Creating question:', req.body);
    
    const { title, content, subject } = req.body;
    const { userId, username } = req.user;

    const question = await Question.create({
      questionId: uuidv4(),
      userId,
      username: username || 'Anonymous',
      title,
      content,
      subject: subject || 'other',
      replies: [],
      createdAt: new Date()
    });

    logger.log('Question created:', question.questionId);
    logger.response(201, question);

    // Emit to Socket.io if available
    if (global.io) {
      global.io.to('global-chat').emit('new-question', question);
      logger.log('Question broadcast to global-chat room');
    }

    res.status(201).json({
      success: true,
      message: 'Question created',
      data: { question }
    });
  } catch (error) {
    logger.error('Error creating question:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create question'
    });
  }
};

exports.replyToQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    logger.log('Replying to question:', id, req.body);
    
    const { content } = req.body;
    const { userId, username } = req.user;

    const question = await Question.findOne({ questionId: id });
    
    if (!question) {
      logger.warn('Question not found:', id);
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    const reply = {
      userId,
      username: username || 'Anonymous',
      content,
      createdAt: new Date()
    };

    await Question.updateOne(
      { questionId: id },
      { $push: { replies: reply } }
    );

    logger.log('Reply added to question:', id);
    logger.response(201, reply);

    // Emit to Socket.io if available
    if (global.io) {
      global.io.to('global-chat').emit('new-reply', { questionId: id, reply });
      logger.log('Reply broadcast to global-chat room');
    }

    res.status(201).json({
      success: true,
      message: 'Reply added',
      data: { reply }
    });
  } catch (error) {
    logger.error('Error replying to question:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add reply'
    });
  }
};
