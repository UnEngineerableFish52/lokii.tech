const mongoose = require('mongoose');

const privateChatSchema = new mongoose.Schema({
  chatId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  creatorId: {
    type: String,
    required: true
  },
  inviteCode: {
    type: String,
    unique: true,
    required: true
  },
  members: [{
    userId: String,
    username: String,
    joinedAt: { type: Date, default: Date.now }
  }],
  pendingInvites: [{
    userId: String,
    username: String,
    invitedAt: { type: Date, default: Date.now }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// In-memory storage
const inMemoryPrivateChats = new Map();

const PrivateChat = {
  model: null,
  
  init() {
    try {
      this.model = mongoose.model('PrivateChat', privateChatSchema);
    } catch (e) {
      // Model already exists or mongoose not connected
    }
  },
  
  async create(data) {
    if (mongoose.connection.readyState === 1 && this.model) {
      return await this.model.create(data);
    }
    // Fallback to in-memory
    const chat = { 
      _id: Date.now().toString(), 
      members: [],
      pendingInvites: [],
      ...data 
    };
    inMemoryPrivateChats.set(chat.chatId, chat);
    return chat;
  },
  
  async find(query = {}) {
    if (mongoose.connection.readyState === 1 && this.model) {
      return await this.model.find(query);
    }
    // Fallback to in-memory
    let chats = Array.from(inMemoryPrivateChats.values());
    if (query.chatId) {
      chats = chats.filter(c => c.chatId === query.chatId);
    }
    if (query['members.userId']) {
      chats = chats.filter(c => c.members.some(m => m.userId === query['members.userId']));
    }
    return chats;
  },
  
  async findOne(query) {
    if (mongoose.connection.readyState === 1 && this.model) {
      return await this.model.findOne(query);
    }
    // Fallback to in-memory
    if (query.chatId) {
      return inMemoryPrivateChats.get(query.chatId) || null;
    }
    if (query.inviteCode) {
      return Array.from(inMemoryPrivateChats.values()).find(c => c.inviteCode === query.inviteCode) || null;
    }
    return Array.from(inMemoryPrivateChats.values()).find(chat => {
      return Object.keys(query).every(key => chat[key] === query[key]);
    }) || null;
  },
  
  async updateOne(query, update) {
    if (mongoose.connection.readyState === 1 && this.model) {
      return await this.model.updateOne(query, update);
    }
    // Fallback to in-memory
    const chat = await this.findOne(query);
    if (chat) {
      if (update.$push) {
        Object.keys(update.$push).forEach(key => {
          if (!chat[key]) chat[key] = [];
          chat[key].push(update.$push[key]);
        });
      }
      if (update.$pull) {
        Object.keys(update.$pull).forEach(key => {
          if (chat[key] && Array.isArray(chat[key])) {
            chat[key] = chat[key].filter(item => {
              return !Object.keys(update.$pull[key]).every(k => item[k] === update.$pull[key][k]);
            });
          }
        });
      }
      if (update.$set) {
        Object.assign(chat, update.$set);
      }
      inMemoryPrivateChats.set(chat.chatId, chat);
    }
    return { modifiedCount: chat ? 1 : 0 };
  }
};

PrivateChat.init();

module.exports = PrivateChat;
