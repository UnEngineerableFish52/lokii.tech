# GSA Backend API

Complete production-ready Node.js/Express backend for the Global Students Association app with real database integration, Socket.io real-time features, and comprehensive API endpoints.

## Features

- ✅ **Authentication System** - JWT tokens, anonymous & OAuth users
- ✅ **Global Chat** - Real-time messaging with permissions
- ✅ **Questions System** - Q&A with nested replies
- ✅ **Private Chats** - Consent-based private messaging
- ✅ **Exam System** - Auto-grading with grade-level restrictions
- ✅ **Real-time Updates** - Socket.io for instant notifications
- ✅ **Database Flexibility** - MongoDB, PostgreSQL, or MySQL support
- ✅ **Security** - Helmet, CORS, JWT, input validation
- ✅ **Complete Logging** - Debug every request, response, and event

## Quick Start

### 1. Installation

```bash
cd GSA/backend
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=3000
NODE_ENV=development
DB_TYPE=mongodb
MONGODB_URI=mongodb://localhost:27017/gsa
JWT_SECRET=your-secret-key-change-this
```

### 3. Database Setup

#### Option A: MongoDB (Recommended for Development)

```bash
# Install MongoDB locally or use MongoDB Atlas
# No additional setup needed - will fall back to in-memory if unavailable
```

#### Option B: PostgreSQL

```bash
# Install PostgreSQL
sudo apt-get install postgresql

# Create database
createdb gsa

# Update .env
DB_TYPE=postgresql
POSTGRES_URI=postgresql://user:password@localhost:5432/gsa
```

#### Option C: MySQL

```bash
# Install MySQL
sudo apt-get install mysql-server

# Create database
mysql -u root -p
CREATE DATABASE gsa;

# Update .env
DB_TYPE=mysql
MYSQL_URI=mysql://user:password@localhost:3306/gsa
```

### 4. Start Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

Server will start on:
- HTTP API: http://localhost:3000
- Socket.io: http://localhost:3001

## API Documentation

### Authentication Endpoints

#### POST /api/auth/anonymous
Generate anonymous user and JWT token.

**Request:**
```json
{}
```

**Response:**
```json
{
  "success": true,
  "message": "Anonymous user created",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "userId": "anon_abc123",
      "username": "Anonymous_1234",
      "isAnonymous": true,
      "isVerified": false
    }
  }
}
```

#### POST /api/auth/oauth
OAuth login (Google, Facebook, GitHub).

**Request:**
```json
{
  "provider": "google",
  "oauthId": "123456789",
  "email": "user@example.com",
  "username": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OAuth login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "userId": "google_abc123",
      "username": "John Doe",
      "email": "user@example.com",
      "isAnonymous": false,
      "isVerified": true
    }
  }
}
```

#### POST /api/auth/verify
Verify JWT token validity.

**Request:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Token is valid",
  "data": {
    "user": {
      "userId": "anon_abc123",
      "username": "Anonymous_1234"
    }
  }
}
```

#### GET /api/auth/me
Get current user information.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "anon_abc123",
    "username": "Anonymous_1234",
    "isAnonymous": true,
    "isVerified": false,
    "gradeLevel": null
  }
}
```

### Global Chat Endpoints

#### GET /api/chat/global
Get all global chat messages.

**Response:**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "messageId": "msg_123",
        "userId": "anon_abc123",
        "username": "Anonymous_1234",
        "content": "Hello everyone!",
        "type": "global",
        "createdAt": "2024-02-07T08:00:00.000Z"
      }
    ]
  }
}
```

#### POST /api/chat/global
Send message to global chat (authenticated users only).

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Request:**
```json
{
  "content": "Hello everyone!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message sent",
  "data": {
    "message": {
      "messageId": "msg_123",
      "userId": "anon_abc123",
      "username": "Anonymous_1234",
      "content": "Hello everyone!",
      "type": "global",
      "createdAt": "2024-02-07T08:00:00.000Z"
    }
  }
}
```

### Questions Endpoints

#### GET /api/questions
Get all questions. Optional filter by subject.

**Query Parameters:**
- `subject` (optional): math, science, history, english, other

**Response:**
```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "questionId": "q_123",
        "userId": "anon_abc123",
        "username": "Anonymous_1234",
        "title": "How do I solve quadratic equations?",
        "content": "I'm having trouble understanding the quadratic formula...",
        "subject": "math",
        "replies": [],
        "createdAt": "2024-02-07T08:00:00.000Z"
      }
    ]
  }
}
```

#### POST /api/questions
Create a new question (authenticated users).

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Request:**
```json
{
  "title": "How do I solve quadratic equations?",
  "content": "I'm having trouble understanding the quadratic formula...",
  "subject": "math"
}
```

#### POST /api/questions/:id/reply
Reply to a question (verified users only).

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Request:**
```json
{
  "content": "The quadratic formula is: x = (-b ± √(b²-4ac)) / 2a"
}
```

### Private Chats Endpoints

#### GET /api/private-chats
Get user's private chats.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response:**
```json
{
  "success": true,
  "data": {
    "chats": [
      {
        "chatId": "chat_123",
        "name": "Study Group",
        "creatorId": "user_456",
        "inviteCode": "ABC123",
        "members": [
          {
            "userId": "user_456",
            "username": "John",
            "joinedAt": "2024-02-07T08:00:00.000Z"
          }
        ]
      }
    ]
  }
}
```

#### POST /api/private-chats
Create new private chat.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Request:**
```json
{
  "name": "Study Group"
}
```

#### POST /api/private-chats/join
Join chat with invite code (requires consent).

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Request:**
```json
{
  "inviteCode": "ABC123"
}
```

#### POST /api/private-chats/:id/consent
Accept or reject invite to private chat.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Request:**
```json
{
  "accept": true
}
```

#### GET /api/private-chats/:id/messages
Get messages in private chat (members only).

#### POST /api/private-chats/:id/messages
Send message in private chat (members only).

**Request:**
```json
{
  "content": "Hey everyone!"
}
```

### Exam Endpoints

#### GET /api/exams
Get exams for user's grade level.

**Query Parameters:**
- `subject` (optional): Filter by subject

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response:**
```json
{
  "success": true,
  "data": {
    "exams": [
      {
        "examId": "exam-math-grade9-001",
        "title": "Algebra I - Chapter 1",
        "subject": "math",
        "gradeLevel": 9,
        "duration": 45,
        "totalPoints": 5,
        "questionCount": 3
      }
    ]
  }
}
```

#### GET /api/exams/:id
Get exam details (without correct answers).

#### POST /api/exams/:id/submit
Submit exam answers for auto-grading.

**Request:**
```json
{
  "answers": [1, 0, 1]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Exam submitted successfully",
  "data": {
    "submissionId": "sub_123",
    "score": 5,
    "totalPoints": 5,
    "percentage": 100,
    "results": [
      {
        "questionIndex": 0,
        "userAnswer": 1,
        "correctAnswer": 1,
        "isCorrect": true,
        "points": 1
      }
    ]
  }
}
```

#### GET /api/exams/:id/results
Get exam results for current user.

## Socket.io Events

### Client → Server

#### `join-global-chat`
Join the global chat room.

```javascript
socket.emit('join-global-chat');
```

#### `join-private-chat`
Join a specific private chat room.

```javascript
socket.emit('join-private-chat', 'chat_123');
```

#### `typing`
Send typing indicator.

```javascript
socket.emit('typing', {
  room: 'global-chat',
  username: 'John'
});
```

#### `user-online`
Broadcast online status.

```javascript
socket.emit('user-online', {
  userId: 'user_123',
  username: 'John'
});
```

### Server → Client

#### `new-message`
Receive new message in subscribed room.

```javascript
socket.on('new-message', (message) => {
  console.log('New message:', message);
});
```

#### `new-question`
Receive new question posted.

```javascript
socket.on('new-question', (question) => {
  console.log('New question:', question);
});
```

#### `new-reply`
Receive new reply to a question.

```javascript
socket.on('new-reply', ({ questionId, reply }) => {
  console.log('New reply to question:', questionId, reply);
});
```

#### `user-typing`
User is typing in a room.

```javascript
socket.on('user-typing', ({ username }) => {
  console.log(`${username} is typing...`);
});
```

#### `user-status`
User online/offline status change.

```javascript
socket.on('user-status', ({ userId, username, status }) => {
  console.log(`${username} is ${status}`);
});
```

## Permission System

### Anonymous Users (Unverified)
- ✅ Read global chat
- ✅ Read questions
- ✅ Post new questions
- ❌ Reply to questions
- ❌ Create private chats
- ❌ Access exams

### Verified Users
- ✅ All anonymous permissions
- ✅ Reply to questions
- ✅ Create private chats
- ✅ Join private chats
- ✅ Access exams (grade-level restricted)

## Database Adapter System

The backend uses a database adapter pattern to support multiple databases:

```javascript
// Switch database by changing DB_TYPE in .env
DB_TYPE=mongodb    // MongoDB with Mongoose
DB_TYPE=postgresql // PostgreSQL with pg
DB_TYPE=mysql      // MySQL with mysql2
```

If database connection fails in development mode, the server automatically falls back to in-memory storage.

## Deployment

### Deploy to Heroku

```bash
# Login to Heroku
heroku login

# Create app
heroku create gsa-backend

# Add MongoDB add-on (or use MongoDB Atlas)
heroku addons:create mongolab:sandbox

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-production-secret
heroku config:set ALLOWED_ORIGINS=https://your-frontend-domain.com

# Deploy
git push heroku main

# Open app
heroku open
```

### Deploy to AWS/DigitalOcean

1. Set up a VPS with Node.js 14+
2. Clone repository
3. Install dependencies: `npm install`
4. Set up environment variables in `.env`
5. Install PM2: `npm install -g pm2`
6. Start server: `pm2 start server.js --name gsa-backend`
7. Set up Nginx reverse proxy
8. Configure SSL with Let's Encrypt

## Testing

### Test Authentication
```bash
curl -X POST http://localhost:3000/api/auth/anonymous
```

### Test Global Chat
```bash
# Get token from auth endpoint first
TOKEN="your-jwt-token"

# Send message
curl -X POST http://localhost:3000/api/chat/global \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"Hello world!"}'
```

### Test Socket.io
```javascript
const io = require('socket.io-client');
const socket = io('http://localhost:3001');

socket.on('connect', () => {
  console.log('Connected to Socket.io');
  socket.emit('join-global-chat');
});

socket.on('new-message', (message) => {
  console.log('New message:', message);
});
```

## Troubleshooting

### Database Connection Issues

**Problem:** Cannot connect to MongoDB
**Solution:** 
- Check MongoDB is running: `sudo systemctl status mongod`
- Verify connection string in `.env`
- Server will fall back to in-memory storage in development

**Problem:** PostgreSQL authentication failed
**Solution:**
- Check PostgreSQL credentials
- Update `POSTGRES_URI` in `.env`
- Verify user has database access

### Port Already in Use

**Problem:** Port 3000 already in use
**Solution:**
- Change `PORT` in `.env`
- Or kill process: `lsof -ti:3000 | xargs kill -9`

### CORS Errors

**Problem:** CORS blocked from frontend
**Solution:**
- Add frontend URL to `ALLOWED_ORIGINS` in `.env`
- Example: `ALLOWED_ORIGINS=http://localhost:19000,https://your-app.com`

### JWT Token Invalid

**Problem:** Token verification fails
**Solution:**
- Check `JWT_SECRET` matches between server restarts
- Verify token hasn't expired (default 7 days)
- Generate new token with `/api/auth/anonymous`

## Development Tips

### Enable Debug Logging
```env
DEBUG=true
NODE_ENV=development
```

### Hot Reload
```bash
npm run dev  # Uses nodemon for auto-restart
```

### Test with Different Databases
```bash
# Test MongoDB
DB_TYPE=mongodb npm run dev

# Test PostgreSQL
DB_TYPE=postgresql npm run dev

# Test MySQL
DB_TYPE=mysql npm run dev
```

## Architecture

```
backend/
├── server.js           # Main Express server
├── config/
│   └── database.js     # Database connection & adapter
├── controllers/        # Business logic
├── models/            # Data models (Mongoose + in-memory)
├── routes/            # API route definitions
├── middleware/        # Auth, permissions, validation
├── socket/            # Socket.io event handlers
└── utils/             # Logger, helpers
```

## Security Features

- ✅ Helmet.js - Security headers
- ✅ CORS - Cross-origin protection
- ✅ JWT - Token authentication
- ✅ Input Validation - express-validator
- ✅ XSS Protection - Built into Helmet
- ✅ SQL Injection Protection - Parameterized queries
- ✅ Password Hashing - bcryptjs (for future non-anonymous auth)

## License

MIT License - see LICENSE file for details

## Support

For issues or questions:
1. Check this README
2. Review API documentation
3. Check server logs (DEBUG=true)
4. Open an issue on GitHub

---

Built with ❤️ for the Global Students Association
