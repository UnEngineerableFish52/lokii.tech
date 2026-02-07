const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  messageId: {
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
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  type: {
    type: String,
    enum: ['global', 'private', 'question'],
    default: 'global'
  },
  chatId: {
    type: String,
    sparse: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// In-memory storage
const inMemoryMessages = new Map();

const Message = {
  model: null,
  
  init() {
    try {
      this.model = mongoose.model('Message', messageSchema);
    } catch (e) {
      // Model already exists or mongoose not connected
    }
  },
  
  async create(data) {
    if (mongoose.connection.readyState === 1 && this.model) {
      return await this.model.create(data);
    }
    // Fallback to in-memory
    const message = { _id: Date.now().toString(), ...data };
    inMemoryMessages.set(message.messageId, message);
    return message;
  },
  
  async find(query = {}) {
    if (mongoose.connection.readyState === 1 && this.model) {
      return await this.model.find(query).sort({ createdAt: -1 }).limit(100);
    }
    // Fallback to in-memory
    let messages = Array.from(inMemoryMessages.values());
    if (query.type) {
      messages = messages.filter(m => m.type === query.type);
    }
    if (query.chatId) {
      messages = messages.filter(m => m.chatId === query.chatId);
    }
    return messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 100);
  },
  
  async deleteMany(query) {
    if (mongoose.connection.readyState === 1 && this.model) {
      return await this.model.deleteMany(query);
    }
    // Fallback to in-memory
    let deleted = 0;
    for (const [key, message] of inMemoryMessages.entries()) {
      if (Object.keys(query).every(k => message[k] === query[k])) {
        inMemoryMessages.delete(key);
        deleted++;
      }
    }
    return { deletedCount: deleted };
  }
};

Message.init();

module.exports = Message;
