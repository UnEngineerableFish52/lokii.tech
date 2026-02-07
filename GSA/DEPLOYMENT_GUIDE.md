# GSA App - Deployment Guide

## 🚀 Quick Deployment Checklist

### Prerequisites
- [ ] Node.js 14+ installed
- [ ] Expo CLI installed (`npm install -g expo-cli`)
- [ ] Backend server accessible (local or hosted)
- [ ] Database configured (MongoDB/PostgreSQL/MySQL) or use in-memory

### Backend Deployment

#### Option 1: Local Development
```bash
cd GSA/backend
npm install
cp .env.example .env
# Edit .env with your settings
npm start
```

#### Option 2: Heroku Deployment
```bash
cd GSA/backend
heroku create gsa-backend
heroku addons:create mongolab:sandbox
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-production-secret
heroku config:set ALLOWED_ORIGINS=https://your-app.com
git subtree push --prefix GSA/backend heroku main
```

#### Option 3: DigitalOcean/AWS
```bash
# On your VPS:
cd /var/www
git clone https://github.com/YourUsername/lokii.tech.git
cd lokii.tech/GSA/backend
npm install --production
cp .env.example .env
nano .env  # Configure production settings

# Install PM2
npm install -g pm2
pm2 start server.js --name gsa-backend
pm2 save
pm2 startup
```

### Frontend Deployment

#### Local Testing
```bash
cd GSA
npm install
expo start
# Scan QR code or press 'a' for Android, 'i' for iOS
```

#### Build Android APK
```bash
# Update app.config.js with production API URL
cd GSA
expo build:android
# Download APK from Expo
```

#### Build iOS IPA
```bash
cd GSA
expo build:ios
# Download IPA from Expo
```

### Environment Configuration

#### Backend (.env)
```env
# Production settings
PORT=3000
SOCKET_PORT=3001
NODE_ENV=production
DB_TYPE=mongodb
MONGODB_URI=your-mongodb-uri
JWT_SECRET=your-strong-secret-key
JWT_EXPIRATION=7d
ALLOWED_ORIGINS=https://your-app.com,https://www.your-app.com
DEBUG=false
```

#### Frontend (app.config.js)
```javascript
export default {
  // ... other settings
  extra: {
    apiUrl: process.env.API_URL || 'https://your-backend.herokuapp.com/api',
    socketUrl: process.env.SOCKET_URL || 'https://your-backend.herokuapp.com'
  }
};
```

## 📱 Testing Guide

### Manual Testing Checklist

#### Authentication
- [ ] Anonymous user creation works
- [ ] JWT token persists across app restarts
- [ ] User can set username and grade level

#### Students Tab
- [ ] Profile setup modal opens
- [ ] Can save profile (username, grade, bio)
- [ ] Students list loads for same grade
- [ ] Warning shown if no grade set
- [ ] Connect button is visible

#### Chat Features
- [ ] Can send messages in global chat
- [ ] Real-time messages appear (Socket.io)
- [ ] Can create questions
- [ ] Can browse Q&A

#### Private Chats
- [ ] Can create private chat
- [ ] Invite code generated
- [ ] Can join with invite code

#### Exams
- [ ] Exams list loads
- [ ] Grade restriction works
- [ ] Mock exams display correctly

### API Testing

```bash
# Test backend health
curl http://localhost:3000/health

# Test anonymous auth
curl -X POST http://localhost:3000/api/auth/anonymous

# Test students endpoint (with token)
curl http://localhost:3000/api/students?gradeLevel=9 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🔧 Troubleshooting

### Backend Issues

**Problem**: Port already in use
```bash
# Solution: Change PORT in .env or kill process
lsof -ti:3000 | xargs kill -9
```

**Problem**: Database connection failed
```bash
# Solution: Server uses in-memory fallback in development
# For production, verify DB_TYPE and connection string in .env
```

**Problem**: CORS errors
```bash
# Solution: Add your frontend URL to ALLOWED_ORIGINS in .env
ALLOWED_ORIGINS=http://localhost:19000,https://your-app.com
```

### Frontend Issues

**Problem**: Cannot connect to backend
```bash
# Solution: 
# 1. Verify backend is running
# 2. Check API_URL in app.config.js
# 3. On physical device, use your computer's IP instead of localhost
# Example: http://192.168.1.100:3000/api
```

**Problem**: Students tab shows no students
```bash
# Solution:
# 1. Set your grade level in profile
# 2. Create additional test users with same grade
# 3. Check backend logs for errors
```

## 📊 Performance Optimization

### Backend
- Enable compression: `npm install compression`
- Use Redis for session storage
- Implement caching for student lists
- Add database indexes on gradeLevel field

### Frontend
- Enable Hermes engine for Android
- Optimize images and assets
- Implement lazy loading for tabs
- Add pull-to-refresh with debouncing

## 🔐 Security Checklist

- [ ] Change JWT_SECRET in production
- [ ] Enable HTTPS on backend
- [ ] Rate limiting configured
- [ ] Input validation active
- [ ] CORS properly configured
- [ ] Environment variables secured
- [ ] Database credentials not in code

## 📝 Production Monitoring

### Recommended Tools
- **Backend Monitoring**: PM2, New Relic, DataDog
- **Error Tracking**: Sentry
- **Analytics**: Google Analytics, Mixpanel
- **Logs**: CloudWatch, Papertrail

### Health Checks
```bash
# Setup health check endpoint monitoring
curl http://your-backend.com/health
```

## 🎯 Post-Deployment

### Next Steps
1. Test on multiple Android versions
2. Gather user feedback
3. Monitor error logs
4. Set up automated backups
5. Plan feature updates

### Feature Roadmap
- [ ] Real OAuth integration (Google, Microsoft)
- [ ] Push notifications
- [ ] File sharing in chats
- [ ] Video chat integration
- [ ] AI-powered study assistant
- [ ] Advanced search filters

---

## 🆘 Support

For issues or questions:
1. Check backend logs: `pm2 logs gsa-backend`
2. Check frontend logs in Expo DevTools
3. Review this guide's troubleshooting section
4. Open an issue on GitHub

**The GSA app is production-ready for deployment!** 🚀
