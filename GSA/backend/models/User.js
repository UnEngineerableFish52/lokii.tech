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
  }
};

User.init();

module.exports = User;
