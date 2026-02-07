import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000/api';

console.log('[API Service] Initialized with URL:', API_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Token storage
const TOKEN_KEY = '@gsa_token';
const USER_KEY = '@gsa_user';

export const tokenStorage = {
  async getToken() {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      console.log('[Token Storage] Retrieved token:', token ? 'exists' : 'null');
      return token;
    } catch (error) {
      console.error('[Token Storage] Error getting token:', error);
      return null;
    }
  },

  async setToken(token) {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
      console.log('[Token Storage] Saved token');
    } catch (error) {
      console.error('[Token Storage] Error saving token:', error);
    }
  },

  async removeToken() {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
      console.log('[Token Storage] Removed token');
    } catch (error) {
      console.error('[Token Storage] Error removing token:', error);
    }
  },

  async getUser() {
    try {
      const userJson = await AsyncStorage.getItem(USER_KEY);
      const user = userJson ? JSON.parse(userJson) : null;
      console.log('[Token Storage] Retrieved user:', user ? user.userId : 'null');
      return user;
    } catch (error) {
      console.error('[Token Storage] Error getting user:', error);
      return null;
    }
  },

  async setUser(user) {
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
      console.log('[Token Storage] Saved user:', user.userId);
    } catch (error) {
      console.error('[Token Storage] Error saving user:', error);
    }
  },

  async removeUser() {
    try {
      await AsyncStorage.removeItem(USER_KEY);
      console.log('[Token Storage] Removed user');
    } catch (error) {
      console.error('[Token Storage] Error removing user:', error);
    }
  }
};

// Request interceptor to add JWT token
api.interceptors.request.use(
  async (config) => {
    const token = await tokenStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[API Request]', config.method?.toUpperCase(), config.url, 'with token');
    } else {
      console.log('[API Request]', config.method?.toUpperCase(), config.url, 'without token');
    }
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging and error handling
api.interceptors.response.use(
  (response) => {
    console.log('[API Response]', response.config.method?.toUpperCase(), response.config.url, 'Status:', response.status);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('[API Response Error]', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('[API Network Error] No response received');
    } else {
      console.error('[API Error]', error.message);
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  async generateAnonymous() {
    console.log('[Auth API] Generating anonymous user');
    const response = await api.post('/auth/anonymous');
    const { token, user } = response.data.data;
    await tokenStorage.setToken(token);
    await tokenStorage.setUser(user);
    return response.data;
  },

  async oauthLogin(provider, oauthId, email, username) {
    console.log('[Auth API] OAuth login:', provider);
    const response = await api.post('/auth/oauth', {
      provider,
      oauthId,
      email,
      username
    });
    const { token, user } = response.data.data;
    await tokenStorage.setToken(token);
    await tokenStorage.setUser(user);
    return response.data;
  },

  async verifyToken(token) {
    console.log('[Auth API] Verifying token');
    const response = await api.post('/auth/verify', { token });
    return response.data;
  },

  async getCurrentUser() {
    console.log('[Auth API] Getting current user');
    const response = await api.get('/auth/me');
    return response.data;
  },

  async logout() {
    console.log('[Auth API] Logging out');
    await tokenStorage.removeToken();
    await tokenStorage.removeUser();
  }
};

// Chat API
export const chatAPI = {
  async getGlobalMessages() {
    console.log('[Chat API] Getting global messages');
    const response = await api.get('/chat/global');
    return response.data;
  },

  async sendGlobalMessage(content) {
    console.log('[Chat API] Sending global message');
    const response = await api.post('/chat/global', { content });
    return response.data;
  }
};

// Questions API
export const questionsAPI = {
  async getAllQuestions(subject) {
    console.log('[Questions API] Getting all questions', subject ? `for ${subject}` : '');
    const response = await api.get('/questions', { params: { subject } });
    return response.data;
  },

  async getQuestion(id) {
    console.log('[Questions API] Getting question:', id);
    const response = await api.get(`/questions/${id}`);
    return response.data;
  },

  async createQuestion(title, content, subject) {
    console.log('[Questions API] Creating question');
    const response = await api.post('/questions', { title, content, subject });
    return response.data;
  },

  async replyToQuestion(id, content) {
    console.log('[Questions API] Replying to question:', id);
    const response = await api.post(`/questions/${id}/reply`, { content });
    return response.data;
  }
};

// Private Chats API
export const privateChatsAPI = {
  async getUserChats() {
    console.log('[Private Chats API] Getting user chats');
    const response = await api.get('/private-chats');
    return response.data;
  },

  async createPrivateChat(name) {
    console.log('[Private Chats API] Creating private chat:', name);
    const response = await api.post('/private-chats', { name });
    return response.data;
  },

  async joinWithInviteCode(inviteCode) {
    console.log('[Private Chats API] Joining with invite code:', inviteCode);
    const response = await api.post('/private-chats/join', { inviteCode });
    return response.data;
  },

  async sendInvite(chatId, targetUserId, targetUsername) {
    console.log('[Private Chats API] Sending invite to chat:', chatId);
    const response = await api.post(`/private-chats/${chatId}/invite`, {
      targetUserId,
      targetUsername
    });
    return response.data;
  },

  async handleConsent(chatId, accept) {
    console.log('[Private Chats API] Handling consent for chat:', chatId, 'Accept:', accept);
    const response = await api.post(`/private-chats/${chatId}/consent`, { accept });
    return response.data;
  },

  async getChatMessages(chatId) {
    console.log('[Private Chats API] Getting messages for chat:', chatId);
    const response = await api.get(`/private-chats/${chatId}/messages`);
    return response.data;
  },

  async sendChatMessage(chatId, content) {
    console.log('[Private Chats API] Sending message to chat:', chatId);
    const response = await api.post(`/private-chats/${chatId}/messages`, { content });
    return response.data;
  }
};

// Exams API
export const examsAPI = {
  async getExams(subject) {
    console.log('[Exams API] Getting exams', subject ? `for ${subject}` : '');
    const response = await api.get('/exams', { params: { subject } });
    return response.data;
  },

  async getExam(id) {
    console.log('[Exams API] Getting exam:', id);
    const response = await api.get(`/exams/${id}`);
    return response.data;
  },

  async submitExam(id, answers) {
    console.log('[Exams API] Submitting exam:', id);
    const response = await api.post(`/exams/${id}/submit`, { answers });
    return response.data;
  },

  async getExamResults(id) {
    console.log('[Exams API] Getting exam results:', id);
    const response = await api.get(`/exams/${id}/results`);
    return response.data;
  }
};

// Students API
export const studentsAPI = {
  async getStudentsByGrade(gradeLevel) {
    console.log('[Students API] Getting students by grade:', gradeLevel);
    const response = await api.get('/students', { params: { gradeLevel } });
    return response.data;
  },

  async searchStudents(criteria) {
    console.log('[Students API] Searching students:', criteria);
    const response = await api.get('/students/search', { params: criteria });
    return response.data;
  },

  async updateProfile(profileData) {
    console.log('[Students API] Updating profile');
    const response = await api.put('/students/profile', profileData);
    return response.data;
  },

  async getStudentProfile(userId) {
    console.log('[Students API] Getting student profile:', userId);
    const response = await api.get(`/students/${userId}`);
    return response.data;
  }
};

  async getExam(id) {
    console.log('[Exams API] Getting exam:', id);
    const response = await api.get(`/exams/${id}`);
    return response.data;
  },

  async submitExam(id, answers) {
    console.log('[Exams API] Submitting exam:', id);
    const response = await api.post(`/exams/${id}/submit`, { answers });
    return response.data;
  },

  async getExamResults(id) {
    console.log('[Exams API] Getting exam results:', id);
    const response = await api.get(`/exams/${id}/results`);
    return response.data;
  }
};

export default api;
