import { io } from 'socket.io-client';
import Constants from 'expo-constants';

const SOCKET_URL = Constants.expoConfig?.extra?.socketUrl || 'http://localhost:3001';

console.log('[Socket Service] Initializing with URL:', SOCKET_URL);

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.listeners = new Map();
  }

  connect() {
    if (this.socket && this.connected) {
      console.log('[Socket Service] Already connected');
      return this.socket;
    }

    console.log('[Socket Service] Connecting to:', SOCKET_URL);
    
    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      console.log('[Socket Service] Connected, socket ID:', this.socket.id);
      this.connected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('[Socket Service] Disconnected');
      this.connected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('[Socket Service] Connection error:', error.message);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      console.log('[Socket Service] Disconnecting');
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  joinGlobalChat() {
    if (!this.socket) {
      console.warn('[Socket Service] Not connected, cannot join global chat');
      return;
    }
    console.log('[Socket Service] Joining global chat');
    this.socket.emit('join-global-chat');
  }

  joinPrivateChat(chatId) {
    if (!this.socket) {
      console.warn('[Socket Service] Not connected, cannot join private chat');
      return;
    }
    console.log('[Socket Service] Joining private chat:', chatId);
    this.socket.emit('join-private-chat', chatId);
  }

  leaveRoom(room) {
    if (!this.socket) return;
    console.log('[Socket Service] Leaving room:', room);
    this.socket.emit('leave-room', room);
  }

  sendTyping(room, username) {
    if (!this.socket) return;
    this.socket.emit('typing', { room, username });
  }

  sendUserOnline(userId, username) {
    if (!this.socket) return;
    console.log('[Socket Service] Sending user online:', username);
    this.socket.emit('user-online', { userId, username });
  }

  // Event listeners
  on(event, callback) {
    if (!this.socket) {
      console.warn('[Socket Service] Not connected, cannot add listener for:', event);
      return;
    }
    console.log('[Socket Service] Adding listener for:', event);
    this.socket.on(event, callback);
    
    // Store callback for cleanup
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (!this.socket) return;
    console.log('[Socket Service] Removing listener for:', event);
    this.socket.off(event, callback);
    
    // Remove from stored callbacks
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  removeAllListeners(event) {
    if (!this.socket) return;
    console.log('[Socket Service] Removing all listeners for:', event);
    this.socket.removeAllListeners(event);
    this.listeners.delete(event);
  }

  isConnected() {
    return this.connected;
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;
