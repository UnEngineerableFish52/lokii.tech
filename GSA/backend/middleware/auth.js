const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

const authMiddleware = async (req, res, next) => {
  try {
    logger.log('Auth middleware - checking authentication');
    
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('No authorization header or invalid format');
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided' 
      });
    }

    const token = authHeader.substring(7);
    logger.log('Token received:', token.substring(0, 20) + '...');

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      logger.log('Token decoded successfully:', decoded);
      
      req.user = decoded;
      next();
    } catch (jwtError) {
      logger.error('JWT verification failed:', jwtError.message);
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }
  } catch (error) {
    logger.error('Auth middleware error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Authentication error' 
    });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        logger.log('Optional auth - user authenticated:', decoded.userId);
      } catch (jwtError) {
        logger.warn('Optional auth - invalid token, continuing as unauthenticated');
      }
    } else {
      logger.log('Optional auth - no token provided, continuing as unauthenticated');
    }
    
    next();
  } catch (error) {
    logger.error('Optional auth middleware error:', error);
    next();
  }
};

module.exports = { authMiddleware, optionalAuth };
