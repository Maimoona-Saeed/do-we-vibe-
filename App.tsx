import React, { useState, useEffect, createContext, useCallback } from 'react';
import { User, View, Role, FeedbackRequest, Feedback, FeedbackStatus } from './types';
import { USERS as USERS_DATA, FEEDBACK_REQUESTS as FEEDBACK_REQUESTS_DATA, FEEDBACK_DATA as FEEDBACK_DATA_DATA } from './data';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Dashboard from './components/Dashboard';
import Header from './components/common/Header';
import FeedbackEntryForm from './components/FeedbackEntryForm';
import SummaryView from './components/SummaryView';
import Settings from './components/Settings';

type Theme = 'light' | 'dark';

interface AppContextType {
  theme: Theme;
  toggleTheme: () => void;
  currentUser: User | null;
  updateCurrentUser: (updatedUser: User) => void;
  users: User[];
  feedbackRequests: FeedbackRequest[];
  feedbackData: Feedback[];
  addFeedbackRequests: (peers: User[], context: string, isAnonymous: boolean, type: FeedbackRequest['type']) => void;
  submitFeedback: (request: FeedbackRequest, feedback: Omit<Feedback, 'id' | 'requestId' | 'submittedAt' | 'reviewer'>) => void;
}

export const AppContext = createContext<AppContextType | null>(null);

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>('light');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(USERS_DATA);
  const [feedbackRequests, setFeedbackRequests] = useState<FeedbackRequest[]>(FEEDBACK_REQUESTS_DATA);
  const [feedbackData, setFeedbackData] = useState<Feedback[]>(FEEDBACK_DATA_DATA);
  const [view, setView] = useState<View>({ type: 'login' });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };
  
  const updateCurrentUser = (updatedUser: User) => {
      setCurrentUser(updatedUser);
      setUsers(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const addFeedbackRequests = (peers: User[], context: string, isAnonymous: boolean, type: FeedbackRequest['type']) => {
    if (!currentUser) return;
    const newRequests: FeedbackRequest[] = peers.map((peer, index) => ({
      id: feedbackRequests.length + index + 1,
      requester: currentUser,
      reviewee: peer,
      status: FeedbackStatus.Pending,
      isAnonymous,
      context: context || `General feedback request from ${currentUser.name}.`,
      createdAt: new Date().toISOString(),
      quarter: 'Q4 2024', // This could be dynamic
      type,
    }));
    setFeedbackRequests(prev => [...prev, ...newRequests]);
  };

  const submitFeedback = (request: FeedbackRequest, feedback: Omit<Feedback, 'id' | 'requestId' | 'submittedAt' | 'reviewer'>) => {
    const newFeedback: Feedback = {
      ...feedback,
      id: feedbackData.length + 1,
      requestId: request.id,
      reviewer: request.isAnonymous ? null : currentUser,
      submittedAt: new Date().toISOString(),
    };
    setFeedbackData(prev => [...prev, newFeedback]);
    setFeedbackRequests(prev => prev.map(req => req.id === request.id ? { ...req, status: FeedbackStatus.Completed } : req));
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setView({ type: 'dashboard' });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView({ type: 'login' });
  };
  
  const handleSignUp = (newUser: { name: string; email: string; department: string; role: Role; }) => {
    const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    const user: User = {
        ...newUser,
        id: newId,
        avatar: `https://i.pravatar.cc/150?u=${newId}`,
        managerId: null, // Assign manager logic could be added here
        profile: {
            bio: `A new ${newUser.department} professional at Acme Inc.`,
            linkedin: '',
            github: '',
            website: '',
        },
        preferences: {
            receive: [],
            give: [],
        },
        notificationSettings: {
            newRequestEmail: true,
            feedbackSubmittedEmail: true,
            weeklySummaryEmail: false,
        }
    };
    setUsers(prev => [...prev, user]);
    setCurrentUser(user);
    setView({ type: 'dashboard' });
  };

  const navigateTo = useCallback((newView: View) => {
    setView(newView);
  }, []);

  const renderView = () => {
    if (!currentUser) {
      switch (view.type) {
        case 'signup':
          return <SignUp onSignUp={handleSignUp} navigateTo={navigateTo} />;
        case 'login':
        default:
          return <Login users={users} onLogin={handleLogin} navigateTo={navigateTo} />;
      }
    }

    switch (view.type) {
      case 'dashboard':
        return <Dashboard currentUser={currentUser} navigateTo={navigateTo} />;
      case 'give-feedback':
        return <FeedbackEntryForm request={view.request} onBack={() => navigateTo({ type: 'dashboard' })} />;
      case 'view-summary':
        return <SummaryView userId={view.userId} quarter={view.quarter} onBack={() => navigateTo({ type: 'dashboard' })} />;
      case 'settings':
        return <Settings user={currentUser} onBack={() => navigateTo({ type: 'dashboard' })} />;
      case 'login': // Should not happen if currentUser exists, but for type safety
         return <Login users={users} onLogin={handleLogin} navigateTo={navigateTo} />;
      default:
        return <Dashboard currentUser={currentUser} navigateTo={navigateTo} />;
    }
  };


  return (
    <AppContext.Provider value={{ theme, toggleTheme, currentUser, updateCurrentUser, users, feedbackRequests, feedbackData, addFeedbackRequests, submitFeedback }}>
      <div className="min-h-screen font-sans antialiased transition-colors duration-300">
        {currentUser && <Header onLogout={handleLogout} navigateTo={navigateTo} />}
        <main className="p-4 sm:p-6 lg:p-8">
          {renderView()}
        </main>
      </div>
    </AppContext.Provider>
  );
};

export default App;