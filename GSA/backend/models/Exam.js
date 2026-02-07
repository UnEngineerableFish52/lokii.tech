const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: String,
  options: [String],
  correctAnswer: Number,
  points: { type: Number, default: 1 }
});

const examSchema = new mongoose.Schema({
  examId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  gradeLevel: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  duration: {
    type: Number,
    default: 60
  },
  questions: [questionSchema],
  totalPoints: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const submissionSchema = new mongoose.Schema({
  submissionId: String,
  examId: String,
  userId: String,
  answers: [Number],
  score: Number,
  totalPoints: Number,
  percentage: Number,
  submittedAt: { type: Date, default: Date.now }
});

// In-memory storage
const inMemoryExams = new Map();
const inMemorySubmissions = new Map();

// Initialize with mock exam data
const mockExams = [
  {
    examId: 'exam-math-grade9-001',
    title: 'Algebra I - Chapter 1',
    subject: 'math',
    gradeLevel: 9,
    duration: 45,
    questions: [
      {
        questionText: 'What is 2 + 2?',
        options: ['3', '4', '5', '6'],
        correctAnswer: 1,
        points: 1
      },
      {
        questionText: 'Solve for x: 2x + 5 = 15',
        options: ['5', '10', '7.5', '2.5'],
        correctAnswer: 0,
        points: 2
      },
      {
        questionText: 'What is the slope of the line y = 3x + 2?',
        options: ['2', '3', '5', '1'],
        correctAnswer: 1,
        points: 2
      }
    ],
    totalPoints: 5,
    createdAt: new Date()
  },
  {
    examId: 'exam-science-grade10-001',
    title: 'Biology - Cell Structure',
    subject: 'science',
    gradeLevel: 10,
    duration: 50,
    questions: [
      {
        questionText: 'What is the powerhouse of the cell?',
        options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Golgi apparatus'],
        correctAnswer: 1,
        points: 1
      },
      {
        questionText: 'Which organelle is responsible for photosynthesis?',
        options: ['Mitochondria', 'Chloroplast', 'Nucleus', 'Vacuole'],
        correctAnswer: 1,
        points: 1
      }
    ],
    totalPoints: 2,
    createdAt: new Date()
  }
];

mockExams.forEach(exam => {
  inMemoryExams.set(exam.examId, exam);
});

const Exam = {
  model: null,
  submissionModel: null,
  
  init() {
    try {
      this.model = mongoose.model('Exam', examSchema);
      this.submissionModel = mongoose.model('ExamSubmission', submissionSchema);
    } catch (e) {
      // Models already exist or mongoose not connected
    }
  },
  
  async create(data) {
    if (mongoose.connection.readyState === 1 && this.model) {
      return await this.model.create(data);
    }
    // Fallback to in-memory
    const exam = { _id: Date.now().toString(), ...data };
    inMemoryExams.set(exam.examId, exam);
    return exam;
  },
  
  async find(query = {}) {
    if (mongoose.connection.readyState === 1 && this.model) {
      return await this.model.find(query);
    }
    // Fallback to in-memory
    let exams = Array.from(inMemoryExams.values());
    if (query.gradeLevel) {
      exams = exams.filter(e => e.gradeLevel === query.gradeLevel);
    }
    if (query.subject) {
      exams = exams.filter(e => e.subject === query.subject);
    }
    return exams;
  },
  
  async findOne(query) {
    if (mongoose.connection.readyState === 1 && this.model) {
      return await this.model.findOne(query);
    }
    // Fallback to in-memory
    if (query.examId) {
      return inMemoryExams.get(query.examId) || null;
    }
    return Array.from(inMemoryExams.values()).find(exam => {
      return Object.keys(query).every(key => exam[key] === query[key]);
    }) || null;
  },
  
  async createSubmission(data) {
    if (mongoose.connection.readyState === 1 && this.submissionModel) {
      return await this.submissionModel.create(data);
    }
    // Fallback to in-memory
    const submission = { _id: Date.now().toString(), ...data };
    inMemorySubmissions.set(submission.submissionId, submission);
    return submission;
  },
  
  async findSubmission(query) {
    if (mongoose.connection.readyState === 1 && this.submissionModel) {
      return await this.submissionModel.findOne(query);
    }
    // Fallback to in-memory
    if (query.submissionId) {
      return inMemorySubmissions.get(query.submissionId) || null;
    }
    return Array.from(inMemorySubmissions.values()).find(submission => {
      return Object.keys(query).every(key => submission[key] === query[key]);
    }) || null;
  }
};

Exam.init();

module.exports = Exam;
