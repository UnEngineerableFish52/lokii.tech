const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  userId: String,
  username: String,
  content: String,
  createdAt: { type: Date, default: Date.now }
});

const questionSchema = new mongoose.Schema({
  questionId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: String,
    required: true
  },
  username: {
    type: String,
    default: 'Anonymous'
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    maxlength: 5000
  },
  subject: {
    type: String,
    enum: ['math', 'science', 'history', 'english', 'other'],
    default: 'other'
  },
  replies: [replySchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// In-memory storage
const inMemoryQuestions = new Map();

const Question = {
  model: null,
  
  init() {
    try {
      this.model = mongoose.model('Question', questionSchema);
    } catch (e) {
      // Model already exists or mongoose not connected
    }
  },
  
  async create(data) {
    if (mongoose.connection.readyState === 1 && this.model) {
      return await this.model.create(data);
    }
    // Fallback to in-memory
    const question = { _id: Date.now().toString(), replies: [], ...data };
    inMemoryQuestions.set(question.questionId, question);
    return question;
  },
  
  async find(query = {}) {
    if (mongoose.connection.readyState === 1 && this.model) {
      return await this.model.find(query).sort({ createdAt: -1 });
    }
    // Fallback to in-memory
    let questions = Array.from(inMemoryQuestions.values());
    if (query.subject) {
      questions = questions.filter(q => q.subject === query.subject);
    }
    return questions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
  
  async findOne(query) {
    if (mongoose.connection.readyState === 1 && this.model) {
      return await this.model.findOne(query);
    }
    // Fallback to in-memory
    if (query.questionId) {
      return inMemoryQuestions.get(query.questionId) || null;
    }
    return Array.from(inMemoryQuestions.values()).find(question => {
      return Object.keys(query).every(key => question[key] === query[key]);
    }) || null;
  },
  
  async updateOne(query, update) {
    if (mongoose.connection.readyState === 1 && this.model) {
      return await this.model.updateOne(query, update);
    }
    // Fallback to in-memory
    const question = await this.findOne(query);
    if (question) {
      if (update.$push) {
        Object.keys(update.$push).forEach(key => {
          if (!question[key]) question[key] = [];
          question[key].push(update.$push[key]);
        });
      }
      if (update.$set) {
        Object.assign(question, update.$set);
      }
      inMemoryQuestions.set(question.questionId, question);
    }
    return { modifiedCount: question ? 1 : 0 };
  }
};

Question.init();

module.exports = Question;
