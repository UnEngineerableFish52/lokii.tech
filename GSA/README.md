# Global Students Association (GSA) App

A complete React Native mobile application with a production-ready Node.js/Express backend for students worldwide to connect, learn, and collaborate.

## 🚀 Deploy in 1 Minute!

### ⚡ Super Simple Deployment
```bash
cd GSA
./start.sh
```

That's it! The script will:
- ✅ Install all dependencies
- ✅ Configure environment
- ✅ Start backend & frontend
- ✅ Show QR code to scan

### 📱 Open on Your Phone
1. Install **Expo Go** app (App Store or Play Store)
2. Scan the QR code shown in terminal
3. App loads automatically!

### 🔴 To Stop
```bash
./stop.sh
```

📖 **New to this?** Read [START.md](START.md) - the easiest guide ever!

---

## ✨ Key Features

### 🎓 **Student Discovery** (NEW!)
- **Find Same-Grade Classmates** - Discover students in your grade for study groups
- **Profile Setup** - Customize your profile with bio, interests, and subjects
- **Subject-Based Matching** - See what subjects your peers excel in
- **Easy Connection** - Connect with classmates to start private chats

### 🔐 Authentication
- Anonymous user generation with JWT tokens
- OAuth ready (Google, Facebook, GitHub)
- Persistent sessions with AsyncStorage

### 💬 Communication
- Real-time messaging with Socket.io
- Read-only for anonymous users
- Full access for verified users

### ❓ Questions & Answers
- Post questions with subjects (math, science, history, english)
- Nested reply system
- Real-time updates

### 🔒 Private Chats
- Create private study groups
- Invite-code based joining
- Consent system (users must accept before joining)
- Admin cannot access (enforced server-side)

### 📝 Exam System
- Grade-level restricted exams
- Auto-grading for multiple choice
- Score calculation and results
- Mock exam data included

### ⚡ Real-time Updates
- Socket.io integration
- Instant message delivery
- Typing indicators
- Online status tracking

## Quick Start

### Prerequisites
- Node.js 14+ installed
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator

### Installation

```bash
# Clone repository
cd GSA

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### Configuration

#### Backend Setup

1. Configure environment variables:
```bash
cd backend
cp .env.example .env
```

2. Edit `.env`:
```env
PORT=3000
SOCKET_PORT=3001
DB_TYPE=mongodb
MONGODB_URI=mongodb://localhost:27017/gsa
JWT_SECRET=your-secret-key-change-this
ALLOWED_ORIGINS=http://localhost:19000,http://localhost:19001
DEBUG=true
```

#### Frontend Setup

The frontend automatically connects to `http://localhost:3000` (API) and `http://localhost:3001` (Socket.io).

To change these URLs, edit `app.config.js`:
```javascript
extra: {
  apiUrl: process.env.API_URL || 'http://your-server:3000/api',
  socketUrl: process.env.SOCKET_URL || 'http://your-server:3001'
}
```

### Running the App

#### Terminal 1: Start Backend
```bash
cd backend
npm run dev
```

The backend will start on:
- API: http://localhost:3000
- Socket.io: http://localhost:3001

#### Terminal 2: Start Frontend
```bash
# In GSA directory
expo start
```

Then:
- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Scan QR code with Expo Go app on your phone

## Project Structure

```
GSA/
├── App.js                  # Main React Native app
├── app.json               # App configuration (replaced by app.config.js)
├── app.config.js          # App configuration with environment variables
├── package.json           # Frontend dependencies
├── assets/
│   ├── icon.png          # App icon (1024x1024)
│   ├── adaptive-icon.png # Android adaptive icon
│   ├── favicon.png       # Web favicon (48x48)
│   └── favicon.svg       # Original SVG logo
├── services/
│   ├── api.js            # API service layer with axios
│   └── socket.js         # Socket.io service
├── backend/              # Complete Node.js/Express backend
│   ├── server.js         # Main Express server
│   ├── package.json      # Backend dependencies
│   ├── .env.example      # Environment variables template
│   ├── config/           # Database configuration
│   ├── routes/           # API routes
│   ├── controllers/      # Business logic
│   ├── models/           # Data models
│   ├── middleware/       # Auth, permissions, validation
│   ├── socket/           # Socket.io handlers
│   ├── utils/            # Logger, helpers
│   └── README.md         # Complete API documentation
```

## Building for Production

### Android APK

1. Update API URLs in `app.config.js` to your production server
2. Build APK:
```bash
expo build:android
```

3. Download APK from Expo and install on Android device

### iOS IPA

1. Update API URLs in `app.config.js`
2. Build IPA:
```bash
expo build:ios
```

3. Download IPA and submit to App Store

## Backend Deployment

### Deploy to Heroku

```bash
cd backend

# Login and create app
heroku login
heroku create gsa-backend

# Add MongoDB
heroku addons:create mongolab:sandbox

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-production-secret
heroku config:set ALLOWED_ORIGINS=https://your-app.com

# Deploy
git subtree push --prefix GSA/backend heroku main
```

### Deploy to DigitalOcean/AWS

1. Set up a VPS with Node.js
2. Clone repository
3. Install dependencies: `npm install`
4. Configure `.env` with production values
5. Install PM2: `npm install -g pm2`
6. Start server: `pm2 start server.js`
7. Set up Nginx reverse proxy
8. Configure SSL with Let's Encrypt

## Testing

### Test Backend

```bash
cd backend

# Start server
npm run dev

# Test health endpoint
curl http://localhost:3000/health

# Test anonymous authentication
curl -X POST http://localhost:3000/api/auth/anonymous
```

### Test Frontend

1. Start backend server
2. Start Expo: `expo start`
3. Open in simulator/emulator
4. Test features:
   - Authentication (automatic on first load)
   - Send a global chat message
   - Create a question
   - Create a private chat
   - View exams

## API Documentation

See [backend/README.md](backend/README.md) for complete API documentation including:
- All endpoints with request/response examples
- Socket.io events
- Authentication flow
- Permission system
- Database setup guides

## Troubleshooting

### Backend won't start

**Problem:** Port already in use
**Solution:** Change `PORT` in `.env` or kill process on port 3000

**Problem:** Database connection failed
**Solution:** Server will use in-memory storage in development mode

### Frontend can't connect

**Problem:** Network error / timeout
**Solution:** 
- Verify backend is running
- Check API URL in `app.config.js`
- On physical device, use your computer's IP instead of localhost

### Socket.io not connecting

**Problem:** Real-time updates not working
**Solution:**
- Check Socket.io server is running on port 3001
- Verify CORS is configured for your frontend URL
- Check console logs for connection errors

## Technologies Used

### Frontend
- React Native
- Expo
- Socket.io Client
- Axios
- AsyncStorage

### Backend
- Node.js
- Express
- Socket.io
- JWT (jsonwebtoken)
- Mongoose (MongoDB)
- PostgreSQL / MySQL support
- Helmet (security)
- CORS

## Features Roadmap

- [x] Anonymous authentication
- [x] Global chat
- [x] Questions & answers
- [x] Private chats with consent
- [x] Exam system with auto-grading
- [x] Real-time updates
- [ ] OAuth integration (Google, Facebook)
- [ ] User profiles
- [ ] File attachments
- [ ] Push notifications
- [ ] Video chat integration

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Deployment

The GSA app is **production-ready**! See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for:
- Step-by-step deployment instructions
- Backend hosting options (Heroku, AWS, DigitalOcean)
- APK building for Android
- Testing checklist
- Troubleshooting guide

### Quick Deploy
```bash
# Backend
cd backend && npm install && npm start

# Frontend
cd .. && npm install && expo start
```

## License

MIT License - see LICENSE file for details

## Support

For help or questions:
1. Check [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for deployment help
2. Check [backend/README.md](backend/README.md) for API docs
3. Review troubleshooting section above
4. Open an issue on GitHub

---

Built with ❤️ for students worldwide 🎓
