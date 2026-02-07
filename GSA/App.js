import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { authAPI, chatAPI, questionsAPI, privateChatsAPI, examsAPI, studentsAPI, tokenStorage } from './services/api';
import socketService from './services/socket';

export default function App() {
  // Authentication state
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authenticating, setAuthenticating] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  // UI state
  const [activeTab, setActiveTab] = useState('chat'); // chat, questions, private, exams, students

  // Chat state
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  // Questions state
  const [questions, setQuestions] = useState([]);
  const [questionTitle, setQuestionTitle] = useState('');
  const [questionContent, setQuestionContent] = useState('');
  const [questionSubject, setQuestionSubject] = useState('other');
  const [creatingQuestion, setCreatingQuestion] = useState(false);

  // Private chats state
  const [privateChats, setPrivateChats] = useState([]);
  const [chatName, setChatName] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  // Exams state
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [examAnswers, setExamAnswers] = useState([]);

  // Refreshing state
  const [refreshing, setRefreshing] = useState(false);

  // Students/Profile state
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [profileData, setProfileData] = useState({
    username: '',
    gradeLevel: '',
    bio: '',
    interests: [],
    subjects: []
  });

  // Initialize app
  useEffect(() => {
    initializeApp();
    return () => {
      socketService.disconnect();
    };
  }, []);

  const initializeApp = async () => {
    console.log('[App] Initializing...');
    setLoading(true);

    try {
      // Check if user is already authenticated
      const savedUser = await tokenStorage.getUser();
      const savedToken = await tokenStorage.getToken();

      if (savedUser && savedToken) {
        console.log('[App] Found saved user:', savedUser.userId);
        setUser(savedUser);
        await setupSocketConnection(savedUser);
      } else {
        console.log('[App] No saved user, generating anonymous user');
        await generateAnonymousUser();
      }
    } catch (error) {
      console.error('[App] Initialization error:', error);
      Alert.alert('Error', 'Failed to initialize app. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateAnonymousUser = async () => {
    setAuthenticating(true);
    try {
      const response = await authAPI.generateAnonymous();
      const newUser = response.data.user;
      setUser(newUser);
      console.log('[App] Anonymous user created:', newUser.userId);
      await setupSocketConnection(newUser);
    } catch (error) {
      console.error('[App] Failed to generate anonymous user:', error);
      Alert.alert('Error', 'Failed to authenticate. Please check your connection.');
    } finally {
      setAuthenticating(false);
    }
  };

  const setupSocketConnection = async (currentUser) => {
    console.log('[App] Setting up socket connection');
    
    socketService.connect();
    socketService.joinGlobalChat();
    socketService.sendUserOnline(currentUser.userId, currentUser.username);

    // Listen for new messages
    socketService.on('new-message', (message) => {
      console.log('[App] Received new message:', message);
      setMessages((prev) => [message, ...prev]);
    });

    // Listen for new questions
    socketService.on('new-question', (question) => {
      console.log('[App] Received new question:', question);
      setQuestions((prev) => [question, ...prev]);
    });

    // Listen for new replies
    socketService.on('new-reply', ({ questionId, reply }) => {
      console.log('[App] Received new reply for question:', questionId);
      setQuestions((prev) =>
        prev.map((q) =>
          q.questionId === questionId
            ? { ...q, replies: [...(q.replies || []), reply] }
            : q
        )
      );
    });

    // Load initial data
    await loadGlobalMessages();
    await loadQuestions();
  };

  // Load data functions
  const loadGlobalMessages = async () => {
    try {
      const response = await chatAPI.getGlobalMessages();
      setMessages(response.data.messages.reverse());
      console.log('[App] Loaded', response.data.messages.length, 'messages');
    } catch (error) {
      console.error('[App] Failed to load messages:', error);
    }
  };

  const loadQuestions = async () => {
    try {
      const response = await questionsAPI.getAllQuestions();
      setQuestions(response.data.questions);
      console.log('[App] Loaded', response.data.questions.length, 'questions');
    } catch (error) {
      console.error('[App] Failed to load questions:', error);
    }
  };

  const loadPrivateChats = async () => {
    try {
      const response = await privateChatsAPI.getUserChats();
      setPrivateChats(response.data.chats);
      console.log('[App] Loaded', response.data.chats.length, 'private chats');
    } catch (error) {
      console.error('[App] Failed to load private chats:', error);
    }
  };

  const loadExams = async () => {
    try {
      const response = await examsAPI.getExams();
      setExams(response.data.exams);
      console.log('[App] Loaded', response.data.exams.length, 'exams');
    } catch (error) {
      console.error('[App] Failed to load exams:', error);
    }
  };

  const loadStudents = async () => {
    if (!user || !user.gradeLevel) {
      Alert.alert('Setup Required', 'Please set your grade level in profile to see classmates');
      return;
    }

    setLoadingStudents(true);
    try {
      const response = await studentsAPI.getStudentsByGrade(user.gradeLevel);
      setStudents(response.data.students);
      console.log('[App] Loaded', response.data.students.length, 'students');
    } catch (error) {
      console.error('[App] Failed to load students:', error);
      Alert.alert('Error', 'Failed to load students');
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleProfileSetup = async () => {
    if (!profileData.username || !profileData.gradeLevel) {
      Alert.alert('Required Fields', 'Please fill in username and grade level');
      return;
    }

    try {
      const response = await studentsAPI.updateProfile({
        username: profileData.username,
        gradeLevel: parseInt(profileData.gradeLevel),
        bio: profileData.bio,
        interests: profileData.interests,
        subjects: profileData.subjects
      });

      const updatedUser = response.data.user;
      setUser(updatedUser);
      await tokenStorage.setUser(updatedUser);
      setShowProfileSetup(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('[App] Failed to update profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    }
  };
      const response = await examsAPI.getExams();
      setExams(response.data.exams);
      console.log('[App] Loaded', response.data.exams.length, 'exams');
    } catch (error) {
      console.error('[App] Failed to load exams:', error);
    }
  };

  // Action handlers
  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;

    setSendingMessage(true);
    try {
      await chatAPI.sendGlobalMessage(messageInput.trim());
      setMessageInput('');
      console.log('[App] Message sent successfully');
    } catch (error) {
      console.error('[App] Failed to send message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleCreateQuestion = async () => {
    if (!questionTitle.trim() || !questionContent.trim()) {
      Alert.alert('Error', 'Please fill in both title and content');
      return;
    }

    setCreatingQuestion(true);
    try {
      await questionsAPI.createQuestion(
        questionTitle.trim(),
        questionContent.trim(),
        questionSubject
      );
      setQuestionTitle('');
      setQuestionContent('');
      setQuestionSubject('other');
      Alert.alert('Success', 'Question created successfully!');
      await loadQuestions();
    } catch (error) {
      console.error('[App] Failed to create question:', error);
      Alert.alert('Error', 'Failed to create question. Please try again.');
    } finally {
      setCreatingQuestion(false);
    }
  };

  const handleCreatePrivateChat = async () => {
    if (!chatName.trim()) {
      Alert.alert('Error', 'Please enter a chat name');
      return;
    }

    try {
      const response = await privateChatsAPI.createPrivateChat(chatName.trim());
      setChatName('');
      Alert.alert(
        'Success',
        `Chat created! Invite code: ${response.data.chat.inviteCode}`
      );
      await loadPrivateChats();
    } catch (error) {
      console.error('[App] Failed to create private chat:', error);
      Alert.alert('Error', 'Failed to create chat. Please try again.');
    }
  };

  const handleJoinWithCode = async () => {
    if (!inviteCode.trim()) {
      Alert.alert('Error', 'Please enter an invite code');
      return;
    }

    try {
      const response = await privateChatsAPI.joinWithInviteCode(inviteCode.trim());
      setInviteCode('');
      Alert.alert('Success', response.message);
      await loadPrivateChats();
    } catch (error) {
      console.error('[App] Failed to join chat:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to join chat');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    switch (activeTab) {
      case 'chat':
        await loadGlobalMessages();
        break;
      case 'questions':
        await loadQuestions();
        break;
      case 'private':
        await loadPrivateChats();
        break;
      case 'exams':
        await loadExams();
        break;
      case 'students':
        await loadStudents();
        break;
    }
    setRefreshing(false);
  };

  // Render loading screen
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#00f3ff" />
        <Text style={styles.loadingText}>Loading GSA...</Text>
      </View>
    );
  }

  // Render main app
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Global Students Association</Text>
        {user && (
          <Text style={styles.headerSubtitle}>
            {user.username} {user.isVerified ? '✓' : '(Anonymous)'}
          </Text>
        )}
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        {['chat', 'questions', 'private', 'exams', 'students'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => {
              setActiveTab(tab);
              if (tab === 'private' && privateChats.length === 0) loadPrivateChats();
              if (tab === 'exams' && exams.length === 0) loadExams();
              if (tab === 'students' && students.length === 0) loadStudents();
            }}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00f3ff" />
        }
      >
        {/* Global Chat Tab */}
        {activeTab === 'chat' && (
          <View style={styles.chatContainer}>
            <Text style={styles.sectionTitle}>Global Chat</Text>
            
            {/* Message Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Type a message..."
                placeholderTextColor="#666"
                value={messageInput}
                onChangeText={setMessageInput}
                multiline
              />
              <TouchableOpacity
                style={[styles.sendButton, sendingMessage && styles.sendButtonDisabled]}
                onPress={handleSendMessage}
                disabled={sendingMessage || !messageInput.trim()}
              >
                <Text style={styles.sendButtonText}>
                  {sendingMessage ? '...' : 'Send'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Messages List */}
            <View style={styles.messagesList}>
              {messages.length === 0 ? (
                <Text style={styles.emptyText}>No messages yet. Be the first to chat!</Text>
              ) : (
                messages.map((msg, index) => (
                  <View key={msg.messageId || index} style={styles.messageItem}>
                    <Text style={styles.messageUsername}>{msg.username}</Text>
                    <Text style={styles.messageContent}>{msg.content}</Text>
                    <Text style={styles.messageTime}>
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </View>
        )}

        {/* Questions Tab */}
        {activeTab === 'questions' && (
          <View style={styles.questionsContainer}>
            <Text style={styles.sectionTitle}>Questions & Answers</Text>
            
            {/* Create Question Form */}
            <View style={styles.questionForm}>
              <TextInput
                style={styles.input}
                placeholder="Question title..."
                placeholderTextColor="#666"
                value={questionTitle}
                onChangeText={setQuestionTitle}
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Question details..."
                placeholderTextColor="#666"
                value={questionContent}
                onChangeText={setQuestionContent}
                multiline
                numberOfLines={4}
              />
              <TouchableOpacity
                style={[styles.createButton, creatingQuestion && styles.createButtonDisabled]}
                onPress={handleCreateQuestion}
                disabled={creatingQuestion}
              >
                <Text style={styles.createButtonText}>
                  {creatingQuestion ? 'Creating...' : 'Ask Question'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Questions List */}
            <View style={styles.questionsList}>
              {questions.length === 0 ? (
                <Text style={styles.emptyText}>No questions yet. Ask the first one!</Text>
              ) : (
                questions.map((q, index) => (
                  <View key={q.questionId || index} style={styles.questionItem}>
                    <Text style={styles.questionTitle}>{q.title}</Text>
                    <Text style={styles.questionContent}>{q.content}</Text>
                    <Text style={styles.questionMeta}>
                      By {q.username} • {q.subject} • {(q.replies || []).length} replies
                    </Text>
                  </View>
                ))
              )}
            </View>
          </View>
        )}

        {/* Private Chats Tab */}
        {activeTab === 'private' && (
          <View style={styles.privateContainer}>
            <Text style={styles.sectionTitle}>Private Chats</Text>
            
            {/* Create Chat */}
            <View style={styles.privateForm}>
              <TextInput
                style={styles.input}
                placeholder="Chat name..."
                placeholderTextColor="#666"
                value={chatName}
                onChangeText={setChatName}
              />
              <TouchableOpacity
                style={styles.createButton}
                onPress={handleCreatePrivateChat}
              >
                <Text style={styles.createButtonText}>Create Chat</Text>
              </TouchableOpacity>

              <View style={styles.separator} />

              <TextInput
                style={styles.input}
                placeholder="Enter invite code..."
                placeholderTextColor="#666"
                value={inviteCode}
                onChangeText={setInviteCode}
              />
              <TouchableOpacity
                style={styles.createButton}
                onPress={handleJoinWithCode}
              >
                <Text style={styles.createButtonText}>Join with Code</Text>
              </TouchableOpacity>
            </View>

            {/* Chats List */}
            <View style={styles.chatsList}>
              {privateChats.length === 0 ? (
                <Text style={styles.emptyText}>No private chats yet. Create one!</Text>
              ) : (
                privateChats.map((chat, index) => (
                  <View key={chat.chatId || index} style={styles.chatItem}>
                    <Text style={styles.chatName}>{chat.name}</Text>
                    <Text style={styles.chatMeta}>
                      Code: {chat.inviteCode} • {chat.members.length} members
                    </Text>
                  </View>
                ))
              )}
            </View>
          </View>
        )}

        {/* Exams Tab */}
        {activeTab === 'exams' && (
          <View style={styles.examsContainer}>
            <Text style={styles.sectionTitle}>Exams</Text>
            
            {user && !user.gradeLevel && (
              <View style={styles.warningBox}>
                <Text style={styles.warningText}>
                  ⚠️ Set your grade level to access exams
                </Text>
              </View>
            )}

            <View style={styles.examsList}>
              {exams.length === 0 ? (
                <Text style={styles.emptyText}>No exams available. Check back later!</Text>
              ) : (
                exams.map((exam, index) => (
                  <View key={exam.examId || index} style={styles.examItem}>
                    <Text style={styles.examTitle}>{exam.title}</Text>
                    <Text style={styles.examMeta}>
                      {exam.subject} • Grade {exam.gradeLevel} • {exam.questionCount} questions
                    </Text>
                    <Text style={styles.examDuration}>Duration: {exam.duration} minutes</Text>
                  </View>
                ))
              )}
            </View>
          </View>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <View style={styles.studentsContainer}>
            <Text style={styles.sectionTitle}>Find Classmates</Text>
            
            {/* Profile Setup Button */}
            <View style={styles.profileSection}>
              <TouchableOpacity
                style={styles.profileButton}
                onPress={() => {
                  setProfileData({
                    username: user?.username || '',
                    gradeLevel: user?.gradeLevel?.toString() || '',
                    bio: user?.bio || '',
                    interests: user?.interests || [],
                    subjects: user?.subjects || []
                  });
                  setShowProfileSetup(true);
                }}
              >
                <Text style={styles.profileButtonText}>
                  {user?.gradeLevel ? '✏️ Edit Profile' : '⚙️ Setup Profile'}
                </Text>
              </TouchableOpacity>
              
              {user?.gradeLevel && (
                <Text style={styles.profileInfo}>
                  Grade {user.gradeLevel} • {user.username}
                </Text>
              )}
            </View>

            {/* Profile Setup Modal */}
            {showProfileSetup && (
              <View style={styles.profileSetupModal}>
                <Text style={styles.modalTitle}>Setup Your Profile</Text>
                
                <TextInput
                  style={styles.input}
                  placeholder="Username"
                  placeholderTextColor="#666"
                  value={profileData.username}
                  onChangeText={(text) => setProfileData({...profileData, username: text})}
                />
                
                <TextInput
                  style={styles.input}
                  placeholder="Grade Level (1-12)"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                  value={profileData.gradeLevel}
                  onChangeText={(text) => setProfileData({...profileData, gradeLevel: text})}
                />
                
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Bio (optional)"
                  placeholderTextColor="#666"
                  multiline
                  value={profileData.bio}
                  onChangeText={(text) => setProfileData({...profileData, bio: text})}
                />
                
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.createButton, { backgroundColor: '#ff006e' }]}
                    onPress={() => setShowProfileSetup(false)}
                  >
                    <Text style={styles.createButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.createButton}
                    onPress={handleProfileSetup}
                  >
                    <Text style={styles.createButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Students List */}
            {!user?.gradeLevel ? (
              <View style={styles.warningBox}>
                <Text style={styles.warningText}>
                  📚 Set your grade level to find classmates
                </Text>
              </View>
            ) : (
              <View style={styles.studentsList}>
                {loadingStudents ? (
                  <ActivityIndicator size="large" color="#00f3ff" />
                ) : students.length === 0 ? (
                  <Text style={styles.emptyText}>
                    No students found in Grade {user.gradeLevel}. Be the first!
                  </Text>
                ) : (
                  students.map((student, index) => (
                    <View key={student.userId || index} style={styles.studentItem}>
                      <View style={styles.studentInfo}>
                        <Text style={styles.studentName}>
                          {student.username}
                          {student.isVerified && ' ✓'}
                        </Text>
                        <Text style={styles.studentMeta}>
                          Grade {student.gradeLevel}
                          {student.subjects && student.subjects.length > 0 && 
                            ` • ${student.subjects.slice(0, 2).join(', ')}`
                          }
                        </Text>
                        {student.bio && (
                          <Text style={styles.studentBio}>{student.bio}</Text>
                        )}
                      </View>
                      <TouchableOpacity
                        style={styles.connectButton}
                        onPress={() => Alert.alert('Connect', `Connect with ${student.username}? (Coming soon)`)}
                      >
                        <Text style={styles.connectButtonText}>Connect</Text>
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  header: {
    backgroundColor: '#1a1a2e',
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 2,
    borderBottomColor: '#00f3ff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00f3ff',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8b00ff',
    textAlign: 'center',
    marginTop: 5,
  },
  loadingText: {
    color: '#00f3ff',
    marginTop: 10,
    fontSize: 16,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#1a1a2e',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tab: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#00f3ff',
  },
  tabText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#00f3ff',
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff006e',
    padding: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#1a1a2e',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  input: {
    flex: 1,
    backgroundColor: '#0a0a0f',
    color: '#fff',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 10,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  sendButton: {
    backgroundColor: '#00f3ff',
    padding: 10,
    borderRadius: 8,
    marginLeft: 10,
    justifyContent: 'center',
    minWidth: 70,
  },
  sendButtonDisabled: {
    backgroundColor: '#333',
  },
  sendButtonText: {
    color: '#0a0a0f',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  createButton: {
    backgroundColor: '#8b00ff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  createButtonDisabled: {
    backgroundColor: '#333',
  },
  createButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    padding: 15,
  },
  messageItem: {
    backgroundColor: '#1a1a2e',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#00f3ff',
  },
  messageUsername: {
    color: '#8b00ff',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  messageContent: {
    color: '#fff',
    fontSize: 15,
  },
  messageTime: {
    color: '#666',
    fontSize: 12,
    marginTop: 5,
  },
  questionsContainer: {
    flex: 1,
  },
  questionForm: {
    padding: 15,
    backgroundColor: '#1a1a2e',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  questionsList: {
    padding: 15,
  },
  questionItem: {
    backgroundColor: '#1a1a2e',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#ff006e',
  },
  questionTitle: {
    color: '#00f3ff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  questionContent: {
    color: '#fff',
    fontSize: 15,
    marginBottom: 8,
  },
  questionMeta: {
    color: '#666',
    fontSize: 12,
  },
  privateContainer: {
    flex: 1,
  },
  privateForm: {
    padding: 15,
    backgroundColor: '#1a1a2e',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  separator: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 15,
  },
  chatsList: {
    padding: 15,
  },
  chatItem: {
    backgroundColor: '#1a1a2e',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#39ff14',
  },
  chatName: {
    color: '#00f3ff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  chatMeta: {
    color: '#666',
    fontSize: 12,
  },
  examsContainer: {
    flex: 1,
  },
  warningBox: {
    backgroundColor: '#ff006e',
    padding: 15,
    margin: 15,
    borderRadius: 8,
  },
  warningText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  examsList: {
    padding: 15,
  },
  examItem: {
    backgroundColor: '#1a1a2e',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#8b00ff',
  },
  examTitle: {
    color: '#00f3ff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  examMeta: {
    color: '#8b00ff',
    fontSize: 14,
    marginBottom: 3,
  },
  examDuration: {
    color: '#666',
    fontSize: 12,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    padding: 30,
    fontStyle: 'italic',
  },
  studentsContainer: {
    flex: 1,
  },
  profileSection: {
    padding: 15,
    backgroundColor: '#1a1a2e',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  profileButton: {
    backgroundColor: '#00f3ff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  profileButtonText: {
    color: '#0a0a0f',
    fontWeight: 'bold',
    fontSize: 16,
  },
  profileInfo: {
    color: '#8b00ff',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
  profileSetupModal: {
    backgroundColor: '#1a1a2e',
    padding: 20,
    margin: 15,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#00f3ff',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00f3ff',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  studentsList: {
    padding: 15,
  },
  studentItem: {
    backgroundColor: '#1a1a2e',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#00f3ff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  studentInfo: {
    flex: 1,
    marginRight: 10,
  },
  studentName: {
    color: '#00f3ff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  studentMeta: {
    color: '#8b00ff',
    fontSize: 14,
    marginBottom: 3,
  },
  studentBio: {
    color: '#fff',
    fontSize: 13,
    marginTop: 5,
  },
  connectButton: {
    backgroundColor: '#39ff14',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 6,
  },
  connectButtonText: {
    color: '#0a0a0f',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
