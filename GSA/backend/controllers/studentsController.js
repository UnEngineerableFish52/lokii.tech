const User = require('../models/User');
const logger = require('../utils/logger');

exports.getStudentsByGrade = async (req, res) => {
  try {
    const { gradeLevel } = req.query;
    const { userId } = req.user;

    logger.log('Getting students by grade:', gradeLevel);

    // If no grade specified, use user's grade
    const targetGrade = gradeLevel ? parseInt(gradeLevel) : req.user.gradeLevel;

    if (!targetGrade) {
      return res.status(400).json({
        success: false,
        message: 'Grade level required'
      });
    }

    // Find students in same grade (exclude current user)
    const students = await User.find({
      gradeLevel: targetGrade,
      userId: { $ne: userId }
    });

    // Sanitize user data (remove sensitive info)
    const sanitizedStudents = students.map(student => ({
      userId: student.userId,
      username: student.username,
      gradeLevel: student.gradeLevel,
      interests: student.interests || [],
      subjects: student.subjects || [],
      bio: student.bio || '',
      isVerified: student.isVerified,
      lastActive: student.lastActive
    }));

    logger.response(200, { count: sanitizedStudents.length });

    res.json({
      success: true,
      data: {
        students: sanitizedStudents,
        gradeLevel: targetGrade
      }
    });
  } catch (error) {
    logger.error('Error getting students by grade:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get students'
    });
  }
};

exports.searchStudents = async (req, res) => {
  try {
    const { grade, subject, query } = req.query;
    const { userId } = req.user;

    logger.log('Searching students:', { grade, subject, query });

    const searchCriteria = {
      userId: { $ne: userId }
    };

    if (grade) {
      searchCriteria.gradeLevel = parseInt(grade);
    }

    if (subject) {
      searchCriteria.subjects = subject;
    }

    if (query) {
      searchCriteria.$or = [
        { username: { $regex: query, $options: 'i' } },
        { bio: { $regex: query, $options: 'i' } }
      ];
    }

    const students = await User.find(searchCriteria).limit(50);

    const sanitizedStudents = students.map(student => ({
      userId: student.userId,
      username: student.username,
      gradeLevel: student.gradeLevel,
      interests: student.interests || [],
      subjects: student.subjects || [],
      bio: student.bio || '',
      isVerified: student.isVerified,
      lastActive: student.lastActive
    }));

    logger.response(200, { count: sanitizedStudents.length });

    res.json({
      success: true,
      data: { students: sanitizedStudents }
    });
  } catch (error) {
    logger.error('Error searching students:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search students'
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { userId } = req.user;
    const { username, gradeLevel, bio, interests, subjects } = req.body;

    logger.log('Updating profile for:', userId);

    const updates = {};
    if (username) updates.username = username;
    if (gradeLevel) updates.gradeLevel = parseInt(gradeLevel);
    if (bio !== undefined) updates.bio = bio;
    if (interests) updates.interests = interests;
    if (subjects) updates.subjects = subjects;

    await User.updateOne(
      { userId },
      { $set: updates }
    );

    const updatedUser = await User.findOne({ userId });

    logger.response(200, 'Profile updated');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          userId: updatedUser.userId,
          username: updatedUser.username,
          gradeLevel: updatedUser.gradeLevel,
          bio: updatedUser.bio,
          interests: updatedUser.interests,
          subjects: updatedUser.subjects,
          isVerified: updatedUser.isVerified
        }
      }
    });
  } catch (error) {
    logger.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

exports.getStudentProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    logger.log('Getting student profile:', userId);

    const student = await User.findOne({ userId });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    logger.response(200, student.username);

    res.json({
      success: true,
      data: {
        student: {
          userId: student.userId,
          username: student.username,
          gradeLevel: student.gradeLevel,
          bio: student.bio || '',
          interests: student.interests || [],
          subjects: student.subjects || [],
          isVerified: student.isVerified,
          lastActive: student.lastActive
        }
      }
    });
  } catch (error) {
    logger.error('Error getting student profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get student profile'
    });
  }
};
