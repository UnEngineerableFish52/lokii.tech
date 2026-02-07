require('dotenv').config();
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { connectDB } = require('./config/database');
const logger = require('./utils/logger');
const setupSocketHandlers = require('./socket/chatSocket');

// Import routes
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const questionRoutes = require('./routes/questions');
const privateChatRoutes = require('./routes/privateChats');
const examRoutes = require('./routes/exams');

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// Configuration
const PORT = process.env.PORT || 3000;
const SOCKET_PORT = process.env.SOCKET_PORT || 3001;
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:19000', 'http://localhost:19001', 'http://localhost:8081'];

logger.log('Starting GSA Backend Server...');
logger.log('Port:', PORT);
logger.log('Socket Port:', SOCKET_PORT);
logger.log('Allowed Origins:', ALLOWED_ORIGINS);

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: ALLOWED_ORIGINS,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Request logging middleware
app.use((req, res, next) => {
  logger.request(req);
  next();
});

// Initialize Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Make io available globally for controllers
global.io = io;

// Setup Socket.io handlers
setupSocketHandlers(io);

// Health check endpoint
app.get('/health', (req, res) => {
  logger.log('Health check requested');
  res.json({
    success: true,
    message: 'GSA Backend Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/private-chats', privateChatRoutes);
app.use('/api/exams', examRoutes);

// Root endpoint
app.get('/', (req, res) => {
  logger.log('Root endpoint accessed');
  res.json({
    success: true,
    message: 'Welcome to GSA Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth/*',
      chat: '/api/chat/*',
      questions: '/api/questions/*',
      privateChats: '/api/private-chats/*',
      exams: '/api/exams/*'
    },
    socketUrl: `http://localhost:${SOCKET_PORT}`,
    documentation: 'See README.md for API documentation'
  });
});

// 404 handler
app.use((req, res) => {
  logger.warn('404 - Route not found:', req.method, req.url);
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.url
  });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error('Server error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
const startServer = async () => {
  try {
    // Connect to database (optional - will fall back to in-memory if connection fails)
    await connectDB();

    // Start HTTP server with Socket.io
    httpServer.listen(SOCKET_PORT, () => {
      logger.log(`===========================================`);
      logger.log(`🚀 GSA Backend Server Started`);
      logger.log(`===========================================`);
      logger.log(`HTTP API Server: http://localhost:${PORT}`);
      logger.log(`Socket.io Server: http://localhost:${SOCKET_PORT}`);
      logger.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.log(`Database Type: ${process.env.DB_TYPE || 'mongodb (in-memory fallback)'}`);
      logger.log(`===========================================`);
    });

    // Also listen on separate port for HTTP API if different from socket port
    if (PORT !== SOCKET_PORT) {
      app.listen(PORT, () => {
        logger.log(`HTTP API also available on: http://localhost:${PORT}`);
      });
    }
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.log('SIGTERM received, shutting down gracefully...');
  httpServer.close(() => {
    logger.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.log('SIGINT received, shutting down gracefully...');
  httpServer.close(() => {
    logger.log('Server closed');
    process.exit(0);
  });
});

// Start the server
startServer();

module.exports = app;
