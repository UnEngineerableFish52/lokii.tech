import React, { useState, useEffect, createContext, useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Switch,
  Alert,
  Modal,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Theme Colors
const COLORS = {
  background: '#36393f',
  card: '#2f3136',
  text: '#dcddde',
  textSecondary: '#b9bbbe',
  primary: '#5865f2',
  success: '#3ba55d',
  danger: '#ed4245',
  warning: '#faa61a',
};

// Auth Context
const AuthContext = createContext();

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Mock API Functions
const mockAPI = {
  loginAnonymous: () => {
    console.log('[API] loginAnonymous: Starting anonymous login...');
    return new Promise((resolve) => {
      setTimeout(() => {
        const userId = 'anon_' + Math.random().toString(36).substr(2, 9);
        console.log('[API] loginAnonymous: Success -', userId);
        resolve({
          userId,
          username: 'Anonymous_' + userId.substr(5, 4),
          verified: false,
          gradeLevel: 10,
        });
      }, 1000);
    });
  },

  loginOAuth: (provider) => {
    console.log(`[API] loginOAuth: Starting ${provider} login...`);
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`[API] loginOAuth: ${provider} login successful`);
        resolve({
          userId: `${provider}_user_123`,
          username: `${provider}User`,
          verified: true,
          gradeLevel: 10,
        });
      }, 1500);
    });
  },

  fetchGlobalChat: () => {
    console.log('[API] fetchGlobalChat: Fetching global chat messages...');
    return new Promise((resolve) => {
      setTimeout(() => {
        const messages = [
          {
            id: '1',
            username: 'Student123',
            message: 'What is the derivative of x^2?',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            verified: true,
          },
          {
            id: '2',
            username: 'MathHelper',
            message: 'The derivative is 2x',
            timestamp: new Date(Date.now() - 1800000).toISOString(),
            verified: true,
          },
          {
            id: '3',
            username: 'NewStudent',
            message: 'Can someone help with chemistry?',
            timestamp: new Date(Date.now() - 600000).toISOString(),
            verified: false,
          },
        ];
        console.log('[API] fetchGlobalChat: Fetched', messages.length, 'messages');
        resolve(messages);
      }, 800);
    });
  },

  postQuestion: (question, user) => {
    console.log('[API] postQuestion: Posting question...', question);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!user.verified) {
          console.log('[API] postQuestion: Failed - User not verified');
          reject(new Error('Only verified users can post questions'));
        } else {
          console.log('[API] postQuestion: Success');
          resolve({ id: Date.now().toString(), ...question });
        }
      }, 500);
    });
  },

  postReply: (questionId, reply, user) => {
    console.log('[API] postReply: Posting reply to question', questionId);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!user.verified) {
          console.log('[API] postReply: Failed - User not verified');
          reject(new Error('Only verified users can post replies'));
        } else {
          console.log('[API] postReply: Success');
          resolve({ id: Date.now().toString(), ...reply });
        }
      }, 500);
    });
  },

  fetchQuestions: () => {
    console.log('[API] fetchQuestions: Fetching questions...');
    return new Promise((resolve) => {
      setTimeout(() => {
        const questions = [
          {
            id: 'q1',
            author: 'Student123',
            content: 'How do I solve quadratic equations?',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            replies: [
              {
                id: 'r1',
                author: 'MathTeacher',
                content: 'Use the quadratic formula: x = (-b ± √(b²-4ac)) / 2a',
                timestamp: new Date(Date.now() - 5400000).toISOString(),
              },
            ],
          },
          {
            id: 'q2',
            author: 'ScienceKid',
            content: 'What is photosynthesis?',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            replies: [],
          },
        ];
        console.log('[API] fetchQuestions: Fetched', questions.length, 'questions');
        resolve(questions);
      }, 800);
    });
  },

  createPrivateChat: (name, inviteCode) => {
    console.log('[API] createPrivateChat: Creating private chat...', name);
    return new Promise((resolve) => {
      setTimeout(() => {
        const chat = {
          id: 'chat_' + Date.now(),
          name,
          inviteCode,
          members: [],
          messages: [],
        };
        console.log('[API] createPrivateChat: Created chat', chat.id);
        resolve(chat);
      }, 500);
    });
  },

  joinPrivateChat: (inviteCode) => {
    console.log('[API] joinPrivateChat: Joining with code', inviteCode);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (inviteCode.length < 4) {
          console.log('[API] joinPrivateChat: Failed - Invalid code');
          reject(new Error('Invalid invite code'));
        } else {
          const chat = {
            id: 'chat_existing',
            name: 'Study Group',
            inviteCode,
            members: ['user1', 'user2'],
            messages: [
              {
                id: 'm1',
                author: 'user1',
                content: 'Welcome to the study group!',
                timestamp: new Date().toISOString(),
              },
            ],
          };
          console.log('[API] joinPrivateChat: Joined chat', chat.id);
          resolve(chat);
        }
      }, 800);
    });
  },

  sendPrivateMessage: (chatId, message) => {
    console.log('[API] sendPrivateMessage: Sending to chat', chatId);
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('[API] sendPrivateMessage: Message sent');
        resolve({ id: Date.now().toString(), ...message });
      }, 500);
    });
  },

  fetchExams: (gradeLevel) => {
    console.log('[API] fetchExams: Fetching exams for grade', gradeLevel);
    return new Promise((resolve) => {
      setTimeout(() => {
        const exams = [
          {
            id: 'exam1',
            title: 'Math Final Exam',
            gradeLevel: 10,
            questions: [
              {
                id: 'q1',
                type: 'multiple_choice',
                question: 'What is 2 + 2?',
                options: ['3', '4', '5', '6'],
                correctAnswer: 1,
              },
              {
                id: 'q2',
                type: 'multiple_choice',
                question: 'What is the square root of 16?',
                options: ['2', '3', '4', '5'],
                correctAnswer: 2,
              },
              {
                id: 'q3',
                type: 'true_false',
                question: 'Pi is approximately 3.14',
                correctAnswer: true,
              },
              {
                id: 'q4',
                type: 'essay',
                question: 'Explain the Pythagorean theorem.',
              },
            ],
          },
          {
            id: 'exam2',
            title: 'Science Quiz',
            gradeLevel: 10,
            questions: [
              {
                id: 'q1',
                type: 'multiple_choice',
                question: 'What is the chemical symbol for water?',
                options: ['H2O', 'O2', 'CO2', 'N2'],
                correctAnswer: 0,
              },
              {
                id: 'q2',
                type: 'true_false',
                question: 'The Earth is flat.',
                correctAnswer: false,
              },
            ],
          },
          {
            id: 'exam3',
            title: 'History Test',
            gradeLevel: 11,
            questions: [],
          },
        ];
        const filtered = exams.filter((e) => e.gradeLevel === gradeLevel);
        console.log('[API] fetchExams: Fetched', filtered.length, 'exams');
        resolve(filtered);
      }, 800);
    });
  },

  submitExam: (examId, answers) => {
    console.log('[API] submitExam: Submitting exam', examId);
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockScore = Math.floor(Math.random() * 30) + 70;
        console.log('[API] submitExam: Score calculated -', mockScore);
        resolve({ score: mockScore, totalQuestions: answers.length });
      }, 1000);
    });
  },
};

// Custom Components
const CustomButton = ({ title, onPress, style, textStyle, disabled }) => (
  <TouchableOpacity
    style={[styles.button, style, disabled && styles.buttonDisabled]}
    onPress={onPress}
    disabled={disabled}
  >
    <Text style={[styles.buttonText, textStyle]}>{title}</Text>
  </TouchableOpacity>
);

const CustomTextInput = ({ placeholder, value, onChangeText, style, multiline, secureTextEntry }) => (
  <TextInput
    style={[styles.input, style, multiline && styles.inputMultiline]}
    placeholder={placeholder}
    placeholderTextColor={COLORS.textSecondary}
    value={value}
    onChangeText={onChangeText}
    multiline={multiline}
    secureTextEntry={secureTextEntry}
  />
);

const CustomCard = ({ children, style }) => (
  <View style={[styles.card, style]}>{children}</View>
);

const ChatMessage = ({ message }) => (
  <CustomCard style={styles.messageCard}>
    <View style={styles.messageHeader}>
      <Text style={styles.messageUsername}>
        {message.username} {message.verified ? '✓' : ''}
      </Text>
      <Text style={styles.messageTime}>
        {new Date(message.timestamp).toLocaleTimeString()}
      </Text>
    </View>
    <Text style={styles.messageContent}>{message.message}</Text>
  </CustomCard>
);

const QuestionCard = ({ question, onPress }) => (
  <TouchableOpacity onPress={onPress}>
    <CustomCard style={styles.questionCard}>
      <View style={styles.questionHeader}>
        <Text style={styles.questionAuthor}>{question.author}</Text>
        <Text style={styles.questionTime}>
          {new Date(question.timestamp).toLocaleTimeString()}
        </Text>
      </View>
      <Text style={styles.questionContent}>{question.content}</Text>
      <Text style={styles.questionReplies}>
        {question.replies?.length || 0} replies
      </Text>
    </CustomCard>
  </TouchableOpacity>
);

// Login Screen
const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  console.log('[Navigation] LoginScreen rendered');

  const handleAnonymousLogin = async () => {
    console.log('[User Action] Anonymous login clicked');
    setLoading(true);
    try {
      const user = await mockAPI.loginAnonymous();
      login(user);
      console.log('[Navigation] Navigating to Dashboard');
      navigation.replace('Dashboard');
    } catch (error) {
      console.error('[Error] Anonymous login failed:', error);
      Alert.alert('Error', 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider) => {
    console.log(`[User Action] ${provider} login clicked`);
    setLoading(true);
    try {
      const user = await mockAPI.loginOAuth(provider);
      login(user);
      console.log('[Navigation] Navigating to Dashboard');
      navigation.replace('Dashboard');
    } catch (error) {
      console.error(`[Error] ${provider} login failed:`, error);
      Alert.alert('Error', `${provider} login failed`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🌍 GSA</Text>
      <Text style={styles.subtitle}>Global Students Association</Text>

      <View style={styles.loginForm}>
        <CustomButton
          title="Continue as Anonymous"
          onPress={handleAnonymousLogin}
          disabled={loading}
          style={styles.anonymousButton}
        />

        <Text style={styles.orText}>OR</Text>

        <CustomButton
          title="Login with Google"
          onPress={() => handleOAuthLogin('Google')}
          disabled={loading}
          style={styles.googleButton}
        />

        <CustomButton
          title="Login with Facebook"
          onPress={() => handleOAuthLogin('Facebook')}
          disabled={loading}
          style={styles.facebookButton}
        />
      </View>

      {loading && <ActivityIndicator size="large" color={COLORS.primary} />}
    </View>
  );
};

// Dashboard Screen
const DashboardScreen = ({ navigation }) => {
  const { user, setUser, logout } = useAuth();
  const [globalChat, setGlobalChat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [publicNotifications, setPublicNotifications] = useState(true);
  const [privateNotifications, setPrivateNotifications] = useState(true);
  const [replyText, setReplyText] = useState('');

  console.log('[Navigation] DashboardScreen rendered');

  useEffect(() => {
    loadGlobalChat();
  }, []);

  const loadGlobalChat = async () => {
    console.log('[User Action] Loading global chat');
    setLoading(true);
    try {
      const messages = await mockAPI.fetchGlobalChat();
      setGlobalChat(messages);
      console.log('[State] Global chat loaded');
    } catch (error) {
      console.error('[Error] Failed to load global chat:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostReply = async () => {
    console.log('[User Action] Posting reply to global chat');
    if (!user.verified) {
      Alert.alert('Not Verified', 'Only verified users can post replies');
      return;
    }
    if (!replyText.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }

    try {
      await mockAPI.postReply('global', { message: replyText }, user);
      setReplyText('');
      Alert.alert('Success', 'Reply posted!');
      loadGlobalChat();
    } catch (error) {
      console.error('[Error] Failed to post reply:', error);
      Alert.alert('Error', error.message);
    }
  };

  const handleLogout = () => {
    console.log('[User Action] Logout clicked');
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        onPress: () => {
          logout();
          console.log('[Navigation] Navigating to Login');
          navigation.replace('Login');
        },
      },
    ]);
  };

  const toggleVerification = () => {
    console.log('[User Action] Toggling verification (debug)');
    setUser({ ...user, verified: !user.verified });
    console.log('[State] User verification toggled');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <Text style={styles.headerSubtitle}>
          {user.username} {user.verified ? '✓' : '(Unverified)'}
        </Text>
      </View>

      {/* Debug Verification Toggle */}
      <CustomCard style={styles.debugCard}>
        <Text style={styles.cardTitle}>🔧 Debug: Toggle Verification</Text>
        <Switch
          value={user.verified}
          onValueChange={toggleVerification}
          trackColor={{ false: '#767577', true: COLORS.success }}
        />
      </CustomCard>

      {/* Global Public Chat */}
      <CustomCard>
        <Text style={styles.cardTitle}>💬 Global Public Chat</Text>
        <Text style={styles.cardSubtitle}>
          {user.verified
            ? 'You can reply to questions'
            : 'Read-only (verification required to post)'}
        </Text>

        {loading ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : (
          <View>
            {globalChat.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
          </View>
        )}

        <CustomTextInput
          placeholder="Type your reply..."
          value={replyText}
          onChangeText={setReplyText}
          multiline
          style={styles.replyInput}
        />
        <CustomButton
          title="Post Reply"
          onPress={handlePostReply}
          disabled={!user.verified}
          style={styles.smallButton}
        />
      </CustomCard>

      {/* Notification Settings */}
      <CustomCard>
        <Text style={styles.cardTitle}>🔔 Notification Settings</Text>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Public Chat Notifications</Text>
          <Switch
            value={publicNotifications}
            onValueChange={(val) => {
              console.log('[State] Public notifications toggled:', val);
              setPublicNotifications(val);
            }}
            trackColor={{ false: '#767577', true: COLORS.success }}
          />
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Private Chat Notifications</Text>
          <Switch
            value={privateNotifications}
            onValueChange={(val) => {
              console.log('[State] Private notifications toggled:', val);
              setPrivateNotifications(val);
            }}
            trackColor={{ false: '#767577', true: COLORS.success }}
          />
        </View>
      </CustomCard>

      {/* Navigation */}
      <CustomCard>
        <Text style={styles.cardTitle}>📱 Navigation</Text>
        <CustomButton
          title="📝 Questions"
          onPress={() => {
            console.log('[Navigation] Navigating to Questions');
            navigation.navigate('Questions');
          }}
          style={styles.navButton}
        />
        <CustomButton
          title="💬 Private Servers"
          onPress={() => {
            console.log('[Navigation] Navigating to PrivateServers');
            navigation.navigate('PrivateServers');
          }}
          style={styles.navButton}
        />
        <CustomButton
          title="📚 Exams"
          onPress={() => {
            console.log('[Navigation] Navigating to Exams');
            navigation.navigate('Exams');
          }}
          style={styles.navButton}
        />
        <CustomButton
          title="🚪 Logout"
          onPress={handleLogout}
          style={[styles.navButton, styles.logoutButton]}
        />
      </CustomCard>
    </ScrollView>
  );
};

// Questions Screen
const QuestionsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newQuestion, setNewQuestion] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [replyText, setReplyText] = useState('');

  console.log('[Navigation] QuestionsScreen rendered');

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    console.log('[User Action] Loading questions');
    setLoading(true);
    try {
      const data = await mockAPI.fetchQuestions();
      setQuestions(data);
      console.log('[State] Questions loaded');
    } catch (error) {
      console.error('[Error] Failed to load questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostQuestion = async () => {
    console.log('[User Action] Posting new question');
    if (!user.verified) {
      Alert.alert('Not Verified', 'Only verified users can post questions');
      return;
    }
    if (!newQuestion.trim()) {
      Alert.alert('Error', 'Please enter a question');
      return;
    }

    try {
      await mockAPI.postQuestion(
        { content: newQuestion, author: user.username },
        user
      );
      setNewQuestion('');
      Alert.alert('Success', 'Question posted!');
      loadQuestions();
    } catch (error) {
      console.error('[Error] Failed to post question:', error);
      Alert.alert('Error', error.message);
    }
  };

  const handlePostReply = async () => {
    console.log('[User Action] Posting reply to question', selectedQuestion.id);
    if (!user.verified) {
      Alert.alert('Not Verified', 'Only verified users can post replies');
      return;
    }
    if (!replyText.trim()) {
      Alert.alert('Error', 'Please enter a reply');
      return;
    }

    try {
      await mockAPI.postReply(
        selectedQuestion.id,
        { content: replyText, author: user.username },
        user
      );
      setReplyText('');
      setSelectedQuestion(null);
      Alert.alert('Success', 'Reply posted!');
      loadQuestions();
    } catch (error) {
      console.error('[Error] Failed to post reply:', error);
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            console.log('[Navigation] Going back');
            navigation.goBack();
          }}
        >
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Questions & Answers</Text>
      </View>

      <ScrollView style={styles.scrollContent}>
        {/* Post New Question */}
        <CustomCard>
          <Text style={styles.cardTitle}>Ask a Question</Text>
          <CustomTextInput
            placeholder="What's your question?"
            value={newQuestion}
            onChangeText={setNewQuestion}
            multiline
          />
          <CustomButton
            title="Post Question"
            onPress={handlePostQuestion}
            disabled={!user.verified}
            style={styles.smallButton}
          />
        </CustomCard>

        {/* Questions List */}
        <CustomCard>
          <Text style={styles.cardTitle}>Recent Questions</Text>
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            questions.map((q) => (
              <QuestionCard
                key={q.id}
                question={q}
                onPress={() => {
                  console.log('[User Action] Viewing question', q.id);
                  setSelectedQuestion(q);
                }}
              />
            ))
          )}
        </CustomCard>
      </ScrollView>

      {/* Question Detail Modal */}
      <Modal
        visible={selectedQuestion !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedQuestion(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedQuestion && (
              <>
                <Text style={styles.modalTitle}>Question Thread</Text>
                <ScrollView style={styles.modalScroll}>
                  <CustomCard>
                    <Text style={styles.questionAuthor}>
                      {selectedQuestion.author}
                    </Text>
                    <Text style={styles.questionContent}>
                      {selectedQuestion.content}
                    </Text>
                  </CustomCard>

                  <Text style={styles.repliesTitle}>Replies:</Text>
                  {selectedQuestion.replies.map((r) => (
                    <CustomCard key={r.id} style={styles.replyCard}>
                      <Text style={styles.replyAuthor}>{r.author}</Text>
                      <Text style={styles.replyContent}>{r.content}</Text>
                    </CustomCard>
                  ))}

                  <CustomTextInput
                    placeholder="Write your reply..."
                    value={replyText}
                    onChangeText={setReplyText}
                    multiline
                  />
                  <CustomButton
                    title="Post Reply"
                    onPress={handlePostReply}
                    disabled={!user.verified}
                    style={styles.smallButton}
                  />
                </ScrollView>
                <CustomButton
                  title="Close"
                  onPress={() => setSelectedQuestion(null)}
                  style={styles.closeButton}
                />
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Private Servers Screen
const PrivateServersScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [chatName, setChatName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [showConsent, setShowConsent] = useState(false);
  const [pendingInvite, setPendingInvite] = useState(null);

  console.log('[Navigation] PrivateServersScreen rendered');

  const handleCreateChat = async () => {
    console.log('[User Action] Creating private chat');
    if (!chatName.trim() || !inviteCode.trim()) {
      Alert.alert('Error', 'Please enter chat name and invite code');
      return;
    }

    try {
      const chat = await mockAPI.createPrivateChat(chatName, inviteCode);
      setChats([...chats, chat]);
      setChatName('');
      setInviteCode('');
      Alert.alert('Success', 'Private chat created!');
    } catch (error) {
      console.error('[Error] Failed to create chat:', error);
      Alert.alert('Error', 'Failed to create chat');
    }
  };

  const handleJoinChat = async () => {
    console.log('[User Action] Attempting to join chat');
    if (!joinCode.trim()) {
      Alert.alert('Error', 'Please enter invite code');
      return;
    }

    // Simulate consent requirement
    setPendingInvite(joinCode);
    setShowConsent(true);
  };

  const handleConsentResponse = async (accepted) => {
    console.log('[User Action] Consent response:', accepted);
    setShowConsent(false);
    if (accepted) {
      try {
        const chat = await mockAPI.joinPrivateChat(pendingInvite);
        setChats([...chats, chat]);
        setJoinCode('');
        Alert.alert('Success', 'Joined private chat!');
      } catch (error) {
        console.error('[Error] Failed to join chat:', error);
        Alert.alert('Error', error.message);
      }
    }
    setPendingInvite(null);
  };

  const handleSendMessage = async () => {
    console.log('[User Action] Sending message to chat', selectedChat.id);
    if (!message.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }

    try {
      const newMsg = await mockAPI.sendPrivateMessage(selectedChat.id, {
        author: user.username,
        content: message,
        timestamp: new Date().toISOString(),
      });
      selectedChat.messages.push(newMsg);
      setMessage('');
    } catch (error) {
      console.error('[Error] Failed to send message:', error);
      Alert.alert('Error', 'Failed to send message');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            console.log('[Navigation] Going back');
            navigation.goBack();
          }}
        >
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Private Servers</Text>
      </View>

      <ScrollView style={styles.scrollContent}>
        {/* Create Private Chat */}
        <CustomCard>
          <Text style={styles.cardTitle}>Create Private Chat</Text>
          <Text style={styles.cardSubtitle}>
            🔒 Encrypted & invite-only (mock encryption)
          </Text>
          <CustomTextInput
            placeholder="Chat Name"
            value={chatName}
            onChangeText={setChatName}
          />
          <CustomTextInput
            placeholder="Invite Code"
            value={inviteCode}
            onChangeText={setInviteCode}
          />
          <CustomButton
            title="Create Chat"
            onPress={handleCreateChat}
            style={styles.smallButton}
          />
        </CustomCard>

        {/* Join Private Chat */}
        <CustomCard>
          <Text style={styles.cardTitle}>Join Private Chat</Text>
          <Text style={styles.cardSubtitle}>
            ✋ Requires your consent to be added
          </Text>
          <CustomTextInput
            placeholder="Enter Invite Code"
            value={joinCode}
            onChangeText={setJoinCode}
          />
          <CustomButton
            title="Join Chat"
            onPress={handleJoinChat}
            style={styles.smallButton}
          />
        </CustomCard>

        {/* My Chats */}
        <CustomCard>
          <Text style={styles.cardTitle}>My Private Chats</Text>
          {chats.length === 0 ? (
            <Text style={styles.emptyText}>No chats yet</Text>
          ) : (
            chats.map((chat) => (
              <TouchableOpacity
                key={chat.id}
                onPress={() => {
                  console.log('[User Action] Opening chat', chat.id);
                  setSelectedChat(chat);
                }}
              >
                <CustomCard style={styles.chatItem}>
                  <Text style={styles.chatName}>{chat.name}</Text>
                  <Text style={styles.chatCode}>Code: {chat.inviteCode}</Text>
                  <Text style={styles.chatMembers}>
                    {chat.messages.length} messages
                  </Text>
                </CustomCard>
              </TouchableOpacity>
            ))
          )}
        </CustomCard>
      </ScrollView>

      {/* Consent Modal */}
      <Modal
        visible={showConsent}
        animationType="fade"
        transparent={true}
        onRequestClose={() => handleConsentResponse(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.consentModal}>
            <Text style={styles.consentTitle}>Join Private Chat?</Text>
            <Text style={styles.consentText}>
              You've been invited to join a private chat. Do you consent to be added?
            </Text>
            <View style={styles.consentButtons}>
              <CustomButton
                title="Accept"
                onPress={() => handleConsentResponse(true)}
                style={styles.consentAccept}
              />
              <CustomButton
                title="Decline"
                onPress={() => handleConsentResponse(false)}
                style={styles.consentDecline}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Chat Messages Modal */}
      <Modal
        visible={selectedChat !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedChat(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedChat && (
              <>
                <Text style={styles.modalTitle}>{selectedChat.name}</Text>
                <Text style={styles.modalSubtitle}>
                  🔒 End-to-end encrypted (mock)
                </Text>
                <ScrollView style={styles.modalScroll}>
                  {selectedChat.messages.map((msg) => (
                    <CustomCard key={msg.id} style={styles.messageCard}>
                      <Text style={styles.messageUsername}>{msg.author}</Text>
                      <Text style={styles.messageContent}>{msg.content}</Text>
                    </CustomCard>
                  ))}
                </ScrollView>
                <CustomTextInput
                  placeholder="Type a message..."
                  value={message}
                  onChangeText={setMessage}
                />
                <View style={styles.modalActions}>
                  <CustomButton
                    title="Send"
                    onPress={handleSendMessage}
                    style={styles.sendButton}
                  />
                  <CustomButton
                    title="Close"
                    onPress={() => setSelectedChat(null)}
                    style={styles.closeButton}
                  />
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Exams Screen
const ExamsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  console.log('[Navigation] ExamsScreen rendered');

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    console.log('[User Action] Loading exams for grade', user.gradeLevel);
    setLoading(true);
    try {
      const data = await mockAPI.fetchExams(user.gradeLevel);
      setExams(data);
      console.log('[State] Exams loaded');
    } catch (error) {
      console.error('[Error] Failed to load exams:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            console.log('[Navigation] Going back');
            navigation.goBack();
          }}
        >
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Exams</Text>
      </View>

      <ScrollView style={styles.scrollContent}>
        <CustomCard>
          <Text style={styles.cardTitle}>📚 Available Exams</Text>
          <Text style={styles.cardSubtitle}>
            Grade {user.gradeLevel} exams only
          </Text>
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : exams.length === 0 ? (
            <Text style={styles.emptyText}>No exams available for your grade</Text>
          ) : (
            exams.map((exam) => (
              <TouchableOpacity
                key={exam.id}
                onPress={() => {
                  console.log('[Navigation] Starting exam', exam.id);
                  navigation.navigate('TakeExam', { exam });
                }}
              >
                <CustomCard style={styles.examCard}>
                  <Text style={styles.examTitle}>{exam.title}</Text>
                  <Text style={styles.examInfo}>
                    Grade {exam.gradeLevel} • {exam.questions.length} questions
                  </Text>
                </CustomCard>
              </TouchableOpacity>
            ))
          )}
        </CustomCard>
      </ScrollView>
    </View>
  );
};

// Take Exam Screen
const TakeExamScreen = ({ navigation, route }) => {
  const { exam } = route.params;
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  console.log('[Navigation] TakeExamScreen rendered for exam', exam.id);

  const handleAnswerChange = (questionId, answer) => {
    console.log('[User Action] Answer changed for question', questionId);
    setAnswers({ ...answers, [questionId]: answer });
  };

  const calculateScore = () => {
    console.log('[User Action] Calculating score locally');
    let correct = 0;
    let total = 0;

    exam.questions.forEach((q) => {
      if (q.type === 'essay') return; // Skip essays (manual grading)
      total++;
      const userAnswer = answers[q.id];
      if (q.type === 'multiple_choice' && userAnswer === q.correctAnswer) {
        correct++;
      } else if (q.type === 'true_false' && userAnswer === q.correctAnswer) {
        correct++;
      }
    });

    return total > 0 ? Math.round((correct / total) * 100) : 0;
  };

  const handleSubmit = async () => {
    console.log('[User Action] Submitting exam', exam.id);
    setSubmitting(true);
    try {
      const score = calculateScore();
      await mockAPI.submitExam(exam.id, answers);
      setResult({ score, total: exam.questions.filter((q) => q.type !== 'essay').length });
      Alert.alert('Exam Submitted', `Your score: ${score}%`);
    } catch (error) {
      console.error('[Error] Failed to submit exam:', error);
      Alert.alert('Error', 'Failed to submit exam');
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <View style={styles.container}>
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Exam Complete!</Text>
          <Text style={styles.resultScore}>{result.score}%</Text>
          <Text style={styles.resultText}>
            Auto-graded questions: {result.total}
          </Text>
          <Text style={styles.resultText}>
            Essay questions require manual grading by teacher
          </Text>
          <CustomButton
            title="Back to Exams"
            onPress={() => {
              console.log('[Navigation] Going back to exams');
              navigation.goBack();
            }}
            style={styles.backToExamsButton}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            console.log('[Navigation] Going back');
            navigation.goBack();
          }}
        >
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{exam.title}</Text>
      </View>

      <ScrollView style={styles.scrollContent}>
        {exam.questions.map((q, index) => (
          <CustomCard key={q.id} style={styles.questionContainer}>
            <Text style={styles.questionNumber}>Question {index + 1}</Text>
            <Text style={styles.questionText}>{q.question}</Text>

            {q.type === 'multiple_choice' && (
              <View>
                {q.options.map((option, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => handleAnswerChange(q.id, i)}
                    style={[
                      styles.optionButton,
                      answers[q.id] === i && styles.optionSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        answers[q.id] === i && styles.optionTextSelected,
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {q.type === 'true_false' && (
              <View style={styles.trueFalseContainer}>
                <TouchableOpacity
                  onPress={() => handleAnswerChange(q.id, true)}
                  style={[
                    styles.optionButton,
                    answers[q.id] === true && styles.optionSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      answers[q.id] === true && styles.optionTextSelected,
                    ]}
                  >
                    True
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleAnswerChange(q.id, false)}
                  style={[
                    styles.optionButton,
                    answers[q.id] === false && styles.optionSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      answers[q.id] === false && styles.optionTextSelected,
                    ]}
                  >
                    False
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {q.type === 'essay' && (
              <View>
                <CustomTextInput
                  placeholder="Type your answer here..."
                  value={answers[q.id] || ''}
                  onChangeText={(text) => handleAnswerChange(q.id, text)}
                  multiline
                  style={styles.essayInput}
                />
                <Text style={styles.essayNote}>
                  📝 This will be manually graded by a teacher
                </Text>
              </View>
            )}
          </CustomCard>
        ))}

        <CustomButton
          title={submitting ? 'Submitting...' : 'Submit Exam'}
          onPress={handleSubmit}
          disabled={submitting}
          style={styles.submitExamButton}
        />
      </ScrollView>
    </View>
  );
};

// Auth Provider
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (userData) => {
    console.log('[Auth] User logged in:', userData.username);
    setUser(userData);
  };

  const logout = () => {
    console.log('[Auth] User logged out');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Navigation Stack
const Stack = createStackNavigator();

const AppNavigator = () => {
  const { user } = useAuth();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: COLORS.background },
      }}
    >
      {!user ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <>
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="Questions" component={QuestionsScreen} />
          <Stack.Screen name="PrivateServers" component={PrivateServersScreen} />
          <Stack.Screen name="Exams" component={ExamsScreen} />
          <Stack.Screen name="TakeExam" component={TakeExamScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

// Main App Component
export default function App() {
  console.log('[App] Application started');
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  scrollContent: {
    flex: 1,
  },
  header: {
    marginBottom: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  backButton: {
    fontSize: 18,
    color: COLORS.primary,
    marginBottom: 10,
  },
  logo: {
    fontSize: 64,
    textAlign: 'center',
    marginTop: 100,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 20,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 60,
  },
  loginForm: {
    paddingHorizontal: 20,
  },
  orText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginVertical: 20,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  anonymousButton: {
    backgroundColor: COLORS.textSecondary,
  },
  googleButton: {
    backgroundColor: '#ea4335',
  },
  facebookButton: {
    backgroundColor: '#4267B2',
  },
  input: {
    backgroundColor: COLORS.card,
    color: COLORS.text,
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    fontSize: 16,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  card: {
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  debugCard: {
    backgroundColor: '#44475a',
    borderWidth: 2,
    borderColor: COLORS.warning,
  },
  messageCard: {
    marginVertical: 4,
    padding: 12,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  messageUsername: {
    color: COLORS.text,
    fontWeight: 'bold',
    fontSize: 14,
  },
  messageTime: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  messageContent: {
    color: COLORS.text,
    fontSize: 14,
  },
  replyInput: {
    marginTop: 12,
  },
  smallButton: {
    marginTop: 8,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingLabel: {
    color: COLORS.text,
    fontSize: 16,
  },
  navButton: {
    marginVertical: 6,
  },
  logoutButton: {
    backgroundColor: COLORS.danger,
    marginTop: 16,
  },
  questionCard: {
    marginVertical: 6,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  questionAuthor: {
    color: COLORS.text,
    fontWeight: 'bold',
    fontSize: 14,
  },
  questionTime: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  questionContent: {
    color: COLORS.text,
    fontSize: 15,
    marginBottom: 8,
  },
  questionReplies: {
    color: COLORS.primary,
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  modalScroll: {
    maxHeight: 400,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  closeButton: {
    backgroundColor: COLORS.textSecondary,
    flex: 1,
    marginLeft: 8,
  },
  sendButton: {
    flex: 1,
    marginRight: 8,
  },
  repliesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  replyCard: {
    marginVertical: 4,
  },
  replyAuthor: {
    color: COLORS.text,
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
  },
  replyContent: {
    color: COLORS.text,
    fontSize: 14,
  },
  chatItem: {
    marginVertical: 4,
  },
  chatName: {
    color: COLORS.text,
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  chatCode: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginBottom: 2,
  },
  chatMembers: {
    color: COLORS.primary,
    fontSize: 13,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 20,
  },
  consentModal: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 24,
    width: '80%',
  },
  consentTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  consentText: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  consentButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  consentAccept: {
    backgroundColor: COLORS.success,
    flex: 1,
    marginRight: 8,
  },
  consentDecline: {
    backgroundColor: COLORS.danger,
    flex: 1,
    marginLeft: 8,
  },
  examCard: {
    marginVertical: 6,
  },
  examTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  examInfo: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  questionContainer: {
    marginVertical: 8,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
  questionText: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 12,
  },
  optionButton: {
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 6,
    marginVertical: 4,
    borderWidth: 2,
    borderColor: COLORS.card,
  },
  optionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.card,
  },
  optionText: {
    color: COLORS.text,
    fontSize: 15,
  },
  optionTextSelected: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  trueFalseContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  essayInput: {
    minHeight: 120,
    marginBottom: 8,
  },
  essayNote: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  submitExamButton: {
    marginTop: 20,
    marginBottom: 40,
    backgroundColor: COLORS.success,
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  resultTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 20,
  },
  resultScore: {
    fontSize: 72,
    fontWeight: 'bold',
    color: COLORS.success,
    marginBottom: 20,
  },
  resultText: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
    marginVertical: 4,
  },
  backToExamsButton: {
    marginTop: 40,
    width: 200,
  },
});
