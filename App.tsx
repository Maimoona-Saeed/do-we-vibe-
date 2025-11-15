
import React, { useState, useEffect, createContext, useCallback } from 'react';
import { User, View, FeedbackRequest } from './types';
import { USERS } from './constants';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Header from './components/common/Header';
import Modal from './components/common/Modal';
import FeedbackRequestForm from './components/FeedbackRequestForm';
import FeedbackEntryForm from './components/FeedbackEntryForm';
import SummaryView from './components/SummaryView';

type Theme = 'light' | 'dark';

interface AppContextType {
  theme: Theme;
  toggleTheme: () => void;
  currentUser: User | null;
}

export const AppContext = createContext<AppContextType | null>(null);

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>('light');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState<View>({ type: 'login' });
  const [isRequestModalOpen, setRequestModalOpen] = useState(false);

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

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setView({ type: 'dashboard' });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView({ type: 'login' });
  };
  
  const navigateTo = useCallback((newView: View) => {
    setView(newView);
  }, []);

  const renderView = () => {
    if (!currentUser) {
      return <Login users={USERS} onLogin={handleLogin} />;
    }

    switch (view.type) {
      case 'dashboard':
        return <Dashboard currentUser={currentUser} navigateTo={navigateTo} />;
      case 'give-feedback':
        return <FeedbackEntryForm request={view.request} currentUser={currentUser} onBack={() => navigateTo({ type: 'dashboard' })} />;
      case 'view-summary':
        return <SummaryView userId={view.userId} quarter={view.quarter} onBack={() => navigateTo({ type: 'dashboard' })} />;
      case 'login': // Should not happen if currentUser is set, but for completeness
         return <Login users={USERS} onLogin={handleLogin} />;
      default:
        return <Dashboard currentUser={currentUser} navigateTo={navigateTo} />;
    }
  };


  return (
    <AppContext.Provider value={{ theme, toggleTheme, currentUser }}>
      <div className="min-h-screen font-sans antialiased transition-colors duration-300">
        {currentUser && <Header currentUser={currentUser} onLogout={handleLogout} />}
        <main className="p-4 sm:p-6 lg:p-8">
          {renderView()}
        </main>
        {currentUser && view.type === 'dashboard' && (
          <Modal isOpen={isRequestModalOpen} onClose={() => setRequestModalOpen(false)} title="Request Peer Feedback">
            <FeedbackRequestForm currentUser={currentUser} onClose={() => setRequestModalOpen(false)} />
          </Modal>
        )}
      </div>
    </AppContext.Provider>
  );
};

export default App;
