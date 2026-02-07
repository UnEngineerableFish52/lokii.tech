# 🚀 GSA App - Quick Start Guide

Get the app running in **5 minutes**!

---

## ✅ Prerequisites

- Node.js 16+ installed
- npm installed
- A smartphone with Expo Go app (download from App Store/Play Store)

---

## 🎯 Step 1: Start Backend Server

Open a terminal and run:

```bash
cd GSA/backend
npm install
cp .env.example .env
node server.js
```

**Expected output:**
```
🚀 GSA Backend Server Started
HTTP API Server: http://localhost:3000
Socket.io Server: http://localhost:3001
Environment: development
```

✅ Backend is now running!

---

## 📱 Step 2: Start Frontend App

Open a **NEW terminal** (keep backend running) and run:

```bash
cd GSA
npm install
npm start
```

**Expected output:**
```
› Metro waiting on exp://192.168.x.x:19000
› Scan the QR code above with Expo Go (Android) or Camera (iOS)
```

✅ Frontend is now running!

---

## 📲 Step 3: Open on Your Phone

1. Open **Expo Go** app on your phone
2. Tap **"Scan QR code"**
3. Point camera at the QR code in terminal
4. App loads automatically!

---

## 🎓 Step 4: Use the App

Once the app opens:

1. **Go to "Students" tab** → Set up your profile
   - Enter username and grade (1-12)
   - Add bio and interests
   - Save

2. **Explore features:**
   - **Chat** - Global chat for all students
   - **Questions** - Ask and answer questions
   - **Private** - Create study groups
   - **Exams** - Take practice exams
   - **Students** - Find classmates

---

## ✅ Verify It's Working

### Test Backend:
```bash
curl http://localhost:3000/health
```

Should return:
```json
{"success": true, "message": "GSA Backend Server is running"}
```

### Test Frontend:
- Open browser: http://localhost:19000
- You should see Expo DevTools

---

## 🛠️ Troubleshooting

### Backend won't start?
- Make sure port 3000 is free: `lsof -ti:3000 | xargs kill -9`
- Check Node.js version: `node --version` (need 16+)

### Frontend won't start?
- Delete `node_modules` and run `npm install` again
- Make sure port 19000 is free

### Can't connect on phone?
- Make sure phone and computer are on same WiFi
- Check firewall settings
- Try using tunnel mode: `npm start -- --tunnel`

### No other students showing?
- This is normal! Create multiple test accounts
- Students only see others in same grade level

---

## 🎉 You're Done!

The app is now running locally. Students can:
- ✅ Find same-grade classmates
- ✅ Chat in real-time
- ✅ Ask and answer questions
- ✅ Form study groups
- ✅ Take practice exams

---

## 📊 What's Running

- **Backend API**: http://localhost:3000
- **Socket.io**: http://localhost:3001
- **Frontend**: http://localhost:19000
- **Database**: In-memory (for development)

---

## 🔴 To Stop

Press `Ctrl+C` in both terminal windows.

---

## 📖 More Information

- Full API docs: `backend/README.md`
- Deployment guide: `DEPLOYMENT_GUIDE.md`
- Testing guide: `TESTING_GUIDE.md`

---

**Happy learning! 🎓**
