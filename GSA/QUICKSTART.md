# Quick Start - Deploy GSA App

## 🚀 Fastest Way to Get Started

### Option 1: One-Command Setup (Recommended)
```bash
cd GSA
./deploy.sh
# Choose option 1 for local development
```

The script will:
- ✅ Install all dependencies
- ✅ Create .env configuration
- ✅ Set up both backend and frontend
- ✅ Give you commands to start the app

### Option 2: Manual Setup

**Terminal 1 - Start Backend:**
```bash
cd GSA/backend
npm install
cp .env.example .env
npm start
```

**Terminal 2 - Start Frontend:**
```bash
cd GSA
npm install
npm start
# Scan QR code with Expo Go app
```

## 📱 Testing on Your Phone

1. **Install Expo Go** app from Play Store/App Store
2. **Start the app** (see above)
3. **Scan QR code** shown in terminal
4. **App opens** on your phone!

## 🎯 What You'll See

### First Time
1. App opens with GSA logo
2. Anonymous user created automatically
3. See 5 tabs: Chat, Questions, Private, Exams, **Students**

### Setup Your Profile
1. Tap **Students** tab
2. Tap **"Setup Profile"**
3. Enter:
   - Username
   - Grade Level (1-12)
   - Bio (optional)
4. Tap **Save**

### Find Classmates
1. After saving profile, see all students in your grade
2. View their profiles (bio, subjects)
3. Tap **Connect** to chat (coming soon)

## 🔧 Troubleshooting

### Backend won't start
```bash
# Make sure you're in the right directory
cd GSA/backend
# Check if port 3000 is free
lsof -ti:3000 | xargs kill -9  # Kill any process using port 3000
npm start
```

### Frontend can't connect to backend
```bash
# On physical device, use your computer's IP
# Edit app.config.js and change:
apiUrl: 'http://YOUR_COMPUTER_IP:3000/api'
# Example: http://192.168.1.100:3000/api
```

### Dependencies fail to install
```bash
# Clear cache and retry
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## 📊 Verify It's Working

### Test Backend (in browser or curl)
```bash
# Open in browser: http://localhost:3000/health
# Or use curl:
curl http://localhost:3000/health
```

Should see:
```json
{
  "success": true,
  "message": "GSA Backend Server is running"
}
```

### Test Frontend
- App should load without errors
- You can navigate between tabs
- Can create profile in Students tab

## 🎓 Next Steps

Once running:
1. ✅ Create your profile
2. ✅ Test chat functionality
3. ✅ Ask a question in Questions tab
4. ✅ Create a private study group
5. ✅ Invite friends to test together!

## 📚 Full Documentation

- **DEPLOYMENT_GUIDE.md** - Complete deployment options
- **TESTING_GUIDE.md** - Testing procedures
- **FINAL_SUMMARY.md** - Project overview
- **backend/README.md** - API documentation

## 🆘 Need Help?

Check the troubleshooting section in **DEPLOYMENT_GUIDE.md** or open an issue on GitHub.

---

**You're ready to deploy! Run `./deploy.sh` to get started.** 🚀
