# GSA - Global Students Association

A complete React Native Expo mobile application for student collaboration, Q&A, private chats, and exam taking.

## 🌟 Features

### Authentication
- **Anonymous Login**: Quick access with auto-generated user ID
- **OAuth Placeholders**: Google and Facebook login support (mock implementation)
- **User Verification System**: Verified and unverified user roles

### Global Public Chat
- View all public messages
- Unverified users: Read-only access
- Verified users: Can reply to existing questions
- Real-time message display with timestamps
- User verification badges

### Questions & Answers
- Post new questions (verified users only)
- Reply to existing questions
- Thread-based discussion view
- Author and timestamp tracking
- Modal-based question detail view

### Private Servers/Friend Chats
- Create invite-only private chats
- Join with invite codes
- **Consent-based**: Users must accept invites
- End-to-end encryption (mock implementation)
- Admin-restricted access (enforced in UI)
- Secure messaging between members

### Exam System
- **Grade-restricted access**: Only see exams for your grade level
- **Multiple question types**:
  - Multiple choice (auto-graded)
  - True/False (auto-graded)
  - Essay (manual grading placeholder)
- Auto-calculated scores for objective questions
- Teacher/Admin grading notes for essays
- Exam results display

### Privacy & Security
- No personal data stored without verification
- Permission-based features
- Consent required for private chat invites
- Mock encryption for private chats
- Admin access restrictions

## 📱 UI/UX Design

- **Dark Discord-inspired Theme**
  - Background: `#36393f`
  - Cards: `#2f3136`
  - Text: `#dcddde`
- Rounded buttons with smooth interactions
- Card-based layouts
- Icon placeholders using emojis
- Scrollable lists for all content
- Loading states and error handling

## 🛠️ Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (install globally: `npm install -g expo-cli`)

### Setup Steps

1. **Navigate to the GSA directory**:
   ```bash
   cd GSA
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   # or
   expo start
   ```

4. **Run on a device**:
   - **Android**: Press `a` in the terminal or scan QR code with Expo Go app
   - **iOS**: Press `i` in the terminal or scan QR code with Expo Go app
   - **Web**: Press `w` in the terminal

## 📦 Build for Production

### Using Expo Build (Classic)

```bash
expo build:android
```

### Using EAS Build (Recommended)

1. **Install EAS CLI**:
   ```bash
   npm install -g eas-cli
   ```

2. **Configure EAS**:
   ```bash
   eas build:configure
   ```

3. **Build APK**:
   ```bash
   eas build --platform android --profile preview
   ```

4. **Build for App Store**:
   ```bash
   eas build --platform android --profile production
   ```

## 📂 Project Structure

```
GSA/
├── App.js              # Main application file (all code)
├── package.json        # Dependencies and scripts
├── app.json           # Expo configuration
├── babel.config.js    # Babel configuration
├── .gitignore         # Git ignore rules
└── README.md          # This file
```

## 🧪 Mock Data & API

All backend functionality is mocked using `setTimeout` to simulate API calls. This includes:

- User authentication (anonymous and OAuth)
- Global chat messages
- Questions and replies
- Private chat creation and messaging
- Exam fetching and submission
- Auto-grading for objective questions

### Debug Logging

The app includes extensive console logging:
- `[API]` - API call lifecycle
- `[User Action]` - User interactions
- `[Navigation]` - Screen navigation
- `[State]` - State changes
- `[Auth]` - Authentication events
- `[Error]` - Error messages

Check the console/terminal for detailed debug information.

## 🎮 Usage Guide

### Getting Started

1. **Login**: Choose anonymous login or OAuth (mock)
2. **Dashboard**: Your main hub with all features
3. **Toggle Verification**: Use the debug toggle to test verified user features

### Testing Features

#### Global Chat
- Unverified: Can only read messages
- Verified: Can post replies to questions

#### Questions
- Post new questions (verified only)
- View and reply to existing questions
- Thread-based discussion

#### Private Chats
- Create a new private chat with invite code
- Join existing chats with code
- Consent modal appears before joining
- Send messages in private chats

#### Exams
- View exams for your grade level (default: Grade 10)
- Take exams with multiple question types
- Auto-grading for multiple choice and true/false
- Essay questions marked for manual grading
- View results after submission

### Mock Users

The app generates anonymous users with:
- Random user ID
- Anonymous username
- Unverified status (can be toggled in dashboard)
- Default grade level: 10

## 🔧 Configuration

### App Configuration (`app.json`)

- **App Name**: GSA
- **Package**: com.unengineerablefish52.gsa
- **Version**: 1.0.0
- **Orientation**: Portrait
- **Permissions**: INTERNET

### Dependencies

- **expo**: ~51.0.0
- **react**: 18.2.0
- **react-native**: 0.74.0
- **@react-navigation/native**: ^6.1.0
- **@react-navigation/stack**: ^6.3.0
- **react-native-screens**: ~3.31.0
- **react-native-safe-area-context**: 4.10.0
- **react-native-gesture-handler**: ~2.16.0

## 🚀 Future Enhancements

This is a complete starter project ready for:
- Real backend integration (REST API or GraphQL)
- Firebase authentication
- Real-time messaging with Socket.io
- Push notifications
- File uploads and attachments
- User profiles and avatars
- More exam question types
- Gradebook and progress tracking
- Teacher/Admin dashboard
- Component refactoring for better maintainability

## 🐛 Known Limitations

- All data is in-memory (resets on app restart)
- No persistent storage
- Mock API calls with simulated delays
- Encryption is noted but not implemented
- Admin features are UI-restricted only
- Asset files (icons, splash screens) use Expo defaults

## 📝 Notes

- **Single File Architecture**: All code is in `App.js` for simplicity
- **Mock Backend**: All API calls are simulated
- **Privacy First**: Designed with privacy and consent in mind
- **Expo Compatible**: Ready for Expo build system
- **Production Ready**: Can be extended with real backend

## 📄 License

This project is part of the lokii.tech repository.

## 👥 Author

UnEngineerableFish52

## 🤝 Contributing

This is a starter project. Feel free to:
- Refactor into separate components
- Add real backend integration
- Implement actual encryption
- Enhance UI/UX
- Add more features

---

**Happy Coding! 🎓**
