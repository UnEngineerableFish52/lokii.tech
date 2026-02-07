const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const logger = require('../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '7d';

exports.generateAnonymous = async (req, res) => {
  try {
    logger.log('Generating anonymous user');
    
    const userId = `anon_${uuidv4()}`;
    const username = `Anonymous_${Math.floor(Math.random() * 10000)}`;
    
    const user = await User.create({
      userId,
      username,
      isAnonymous: true,
      isVerified: false
    });

    const token = jwt.sign(
      {
        userId: user.userId,
        username: user.username,
        isAnonymous: true,
        isVerified: false
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION }
    );

    logger.log('Anonymous user created:', userId);
    logger.response(201, { userId, username });

    res.status(201).json({
      success: true,
      message: 'Anonymous user created',
      data: {
        token,
        user: {
          userId: user.userId,
          username: user.username,
          isAnonymous: true,
          isVerified: false
        }
      }
    });
  } catch (error) {
    logger.error('Error generating anonymous user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate anonymous user'
    });
  }
};

exports.oauthLogin = async (req, res) => {
  try {
    logger.log('OAuth login attempt:', req.body);
    
    const { provider, oauthId, email, username } = req.body;

    if (!provider || !oauthId) {
      return res.status(400).json({
        success: false,
        message: 'Provider and oauthId are required'
      });
    }

    let user = await User.findOne({ oauthProvider: provider, oauthId });

    if (!user) {
      logger.log('Creating new OAuth user');
      const userId = `${provider}_${uuidv4()}`;
      
      user = await User.create({
        userId,
        username: username || `User_${Math.floor(Math.random() * 10000)}`,
        email,
        oauthProvider: provider,
        oauthId,
        isAnonymous: false,
        isVerified: true
      });
    } else {
      logger.log('Existing OAuth user found');
      await User.updateOne(
        { userId: user.userId },
        { $set: { lastActive: new Date() } }
      );
    }

    const token = jwt.sign(
      {
        userId: user.userId,
        username: user.username,
        isAnonymous: false,
        isVerified: true
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION }
    );

    logger.log('OAuth user authenticated:', user.userId);
    logger.response(200, { userId: user.userId });

    res.json({
      success: true,
      message: 'OAuth login successful',
      data: {
        token,
        user: {
          userId: user.userId,
          username: user.username,
          email: user.email,
          isAnonymous: false,
          isVerified: true
        }
      }
    });
  } catch (error) {
    logger.error('Error in OAuth login:', error);
    res.status(500).json({
      success: false,
      message: 'OAuth login failed'
    });
  }
};

exports.verifyToken = async (req, res) => {
  try {
    logger.log('Token verification request');
    
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    logger.log('Token verified:', decoded.userId);

    res.json({
      success: true,
      message: 'Token is valid',
      data: { user: decoded }
    });
  } catch (error) {
    logger.error('Token verification failed:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    logger.log('Get current user request:', req.user);
    
    const user = await User.findOne({ userId: req.user.userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    logger.response(200, user);

    res.json({
      success: true,
      data: {
        userId: user.userId,
        username: user.username,
        email: user.email,
        isAnonymous: user.isAnonymous,
        isVerified: user.isVerified,
        gradeLevel: user.gradeLevel
      }
    });
  } catch (error) {
    logger.error('Error getting current user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user information'
    });
  }
};
