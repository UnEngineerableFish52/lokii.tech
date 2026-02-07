const logger = require('../utils/logger');

const requireVerified = (req, res, next) => {
  logger.log('Checking verified user permission for:', req.user);
  
  if (!req.user) {
    logger.warn('No user in request - authentication required');
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (req.user.isAnonymous || !req.user.isVerified) {
    logger.warn('User not verified:', req.user.userId);
    return res.status(403).json({
      success: false,
      message: 'Verified account required for this action'
    });
  }

  logger.log('User verified, permission granted');
  next();
};

const checkGradeLevel = (req, res, next) => {
  logger.log('Checking grade level permission for:', req.user);
  
  if (!req.user) {
    logger.warn('No user in request - authentication required');
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (!req.user.gradeLevel) {
    logger.warn('User has no grade level set:', req.user.userId);
    return res.status(403).json({
      success: false,
      message: 'Grade level must be set for this action'
    });
  }

  logger.log('Grade level check passed');
  next();
};

module.exports = { requireVerified, checkGradeLevel };
