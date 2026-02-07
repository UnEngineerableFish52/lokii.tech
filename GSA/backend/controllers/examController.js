const { v4: uuidv4 } = require('uuid');
const Exam = require('../models/Exam');
const logger = require('../utils/logger');

exports.getExams = async (req, res) => {
  try {
    logger.log('Getting exams for user:', req.user);
    
    const { gradeLevel } = req.user;
    const { subject } = req.query;

    const query = {};
    if (gradeLevel) {
      query.gradeLevel = gradeLevel;
    }
    if (subject) {
      query.subject = subject;
    }

    const exams = await Exam.find(query);
    
    // Remove correct answers from response
    const sanitizedExams = exams.map(exam => ({
      examId: exam.examId,
      title: exam.title,
      subject: exam.subject,
      gradeLevel: exam.gradeLevel,
      duration: exam.duration,
      totalPoints: exam.totalPoints,
      questionCount: exam.questions.length,
      createdAt: exam.createdAt
    }));

    logger.response(200, { count: sanitizedExams.length });

    res.json({
      success: true,
      data: { exams: sanitizedExams }
    });
  } catch (error) {
    logger.error('Error getting exams:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get exams'
    });
  }
};

exports.getExam = async (req, res) => {
  try {
    const { id } = req.params;
    logger.log('Getting exam:', id);
    
    const exam = await Exam.findOne({ examId: id });
    
    if (!exam) {
      logger.warn('Exam not found:', id);
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    // Check grade level restriction
    if (req.user.gradeLevel && exam.gradeLevel !== req.user.gradeLevel) {
      logger.warn('Grade level mismatch:', { user: req.user.gradeLevel, exam: exam.gradeLevel });
      return res.status(403).json({
        success: false,
        message: 'This exam is not available for your grade level'
      });
    }

    // Remove correct answers from questions
    const sanitizedQuestions = exam.questions.map(q => ({
      questionText: q.questionText,
      options: q.options,
      points: q.points
    }));

    const sanitizedExam = {
      examId: exam.examId,
      title: exam.title,
      subject: exam.subject,
      gradeLevel: exam.gradeLevel,
      duration: exam.duration,
      totalPoints: exam.totalPoints,
      questions: sanitizedQuestions,
      createdAt: exam.createdAt
    };

    logger.response(200, sanitizedExam);

    res.json({
      success: true,
      data: { exam: sanitizedExam }
    });
  } catch (error) {
    logger.error('Error getting exam:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get exam'
    });
  }
};

exports.submitExam = async (req, res) => {
  try {
    const { id } = req.params;
    logger.log('Submitting exam:', id, req.body);
    
    const { answers } = req.body;
    const { userId } = req.user;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'Answers array is required'
      });
    }

    const exam = await Exam.findOne({ examId: id });
    
    if (!exam) {
      logger.warn('Exam not found:', id);
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    // Auto-grade multiple choice questions
    let score = 0;
    const results = [];

    exam.questions.forEach((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer === question.correctAnswer;
      
      if (isCorrect) {
        score += question.points;
      }

      results.push({
        questionIndex: index,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        points: isCorrect ? question.points : 0
      });
    });

    const percentage = (score / exam.totalPoints) * 100;

    const submission = await Exam.createSubmission({
      submissionId: uuidv4(),
      examId: id,
      userId,
      answers,
      score,
      totalPoints: exam.totalPoints,
      percentage: Math.round(percentage * 100) / 100,
      submittedAt: new Date()
    });

    logger.log('Exam submitted:', submission.submissionId, { score, totalPoints: exam.totalPoints });
    logger.response(201, { score, percentage });

    res.status(201).json({
      success: true,
      message: 'Exam submitted successfully',
      data: {
        submissionId: submission.submissionId,
        score,
        totalPoints: exam.totalPoints,
        percentage: submission.percentage,
        results
      }
    });
  } catch (error) {
    logger.error('Error submitting exam:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit exam'
    });
  }
};

exports.getExamResults = async (req, res) => {
  try {
    const { id } = req.params;
    logger.log('Getting exam results:', id);
    
    const { userId } = req.user;

    const submission = await Exam.findSubmission({ examId: id, userId });
    
    if (!submission) {
      logger.warn('No submission found for exam:', id);
      return res.status(404).json({
        success: false,
        message: 'No submission found for this exam'
      });
    }

    logger.response(200, submission);

    res.json({
      success: true,
      data: { submission }
    });
  } catch (error) {
    logger.error('Error getting exam results:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get exam results'
    });
  }
};
