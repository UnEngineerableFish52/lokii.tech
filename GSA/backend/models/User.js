const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    default: 'Anonymous'
  },
  email: {
    type: String,
    sparse: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isAnonymous: {
    type: Boolean,
    default: true
  },
  gradeLevel: {
    type: Number,
    min: 1,
    max: 12
  },
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  interests: {
    type: [String],
    default: []
  },
  subjects: {
    type: [String],
    default: []
  },
  oauthProvider: {
    type: String,
    enum: ['google', 'facebook', 'github', null],
    default: null
  },
  oauthId: {
    type: String,
    sparse: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// In-memory storage for non-MongoDB databases
const inMemoryUsers = new Map();

const User = {
  model: null,
  
  init() {
    try {
      this.model = mongoose.model('User', userSchema);
    } catch (e) {
      // Model already exists or mongoose not connected
    }
  },
  
  async create(data) {
    if (mongoose.connection.readyState === 1 && this.model) {
      return await this.model.create(data);
    }
    // Fallback to in-memory
    const user = { _id: Date.now().toString(), ...data };
    inMemoryUsers.set(user.userId, user);
    return user;
  },
  
  async findOne(query) {
    if (mongoose.connection.readyState === 1 && this.model) {
      return await this.model.findOne(query);
    }
    // Fallback to in-memory
    if (query.userId) {
      return inMemoryUsers.get(query.userId) || null;
    }
    return Array.from(inMemoryUsers.values()).find(user => {
      return Object.keys(query).every(key => user[key] === query[key]);
    }) || null;
  },
  
  async findById(id) {
    if (mongoose.connection.readyState === 1 && this.model) {
      return await this.model.findById(id);
    }
    // Fallback to in-memory
    return Array.from(inMemoryUsers.values()).find(user => user._id === id) || null;
  },
  
  async updateOne(query, update) {
    if (mongoose.connection.readyState === 1 && this.model) {
      return await this.model.updateOne(query, update);
    }
    // Fallback to in-memory
    const user = await this.findOne(query);
    if (user) {
      Object.assign(user, update.$set || update);
      inMemoryUsers.set(user.userId, user);
    }
    return { modifiedCount: user ? 1 : 0 };
  },
  
  async find(query = {}) {
    if (mongoose.connection.readyState === 1 && this.model) {
      return await this.model.find(query);
    }
    // Fallback to in-memory
    let users = Array.from(inMemoryUsers.values());
    if (query.gradeLevel) {
      users = users.filter(u => u.gradeLevel === query.gradeLevel);
    }
    if (query.userId && query.userId.$ne) {
      users = users.filter(u => u.userId !== query.userId.$ne);
    }
    if (query.subjects) {
      users = users.filter(u => u.subjects && u.subjects.includes(query.subjects));
    }
    return users;
  }
};

User.init();

module.exports = User;
