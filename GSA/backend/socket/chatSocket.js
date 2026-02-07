const logger = require('../utils/logger');

const setupSocketHandlers = (io) => {
  logger.log('Setting up Socket.io handlers');

  io.on('connection', (socket) => {
    logger.log('Client connected:', socket.id);

    // Join global chat room
    socket.on('join-global-chat', () => {
      socket.join('global-chat');
      logger.log('Client joined global-chat:', socket.id);
      
      socket.emit('joined', { room: 'global-chat' });
    });

    // Join private chat room
    socket.on('join-private-chat', (chatId) => {
      socket.join(`private-chat-${chatId}`);
      logger.log(`Client joined private-chat-${chatId}:`, socket.id);
      
      socket.emit('joined', { room: `private-chat-${chatId}` });
    });

    // Leave room
    socket.on('leave-room', (room) => {
      socket.leave(room);
      logger.log('Client left room:', socket.id, room);
    });

    // Typing indicator
    socket.on('typing', ({ room, username }) => {
      logger.log('User typing:', username, 'in', room);
      socket.to(room).emit('user-typing', { username });
    });

    // User online status
    socket.on('user-online', ({ userId, username }) => {
      logger.log('User online:', username);
      io.emit('user-status', { userId, username, status: 'online' });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      logger.log('Client disconnected:', socket.id);
    });

    // Error handling
    socket.on('error', (error) => {
      logger.error('Socket error:', error);
    });
  });

  logger.log('Socket.io handlers configured');
};

module.exports = setupSocketHandlers;
