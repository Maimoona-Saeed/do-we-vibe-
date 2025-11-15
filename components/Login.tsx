import React, { useState } from 'react';
import type { User } from '../types';
import Card from './common/Card';
import Button from './common/Button';
import { VibeCodeIcon } from './common/icons';

interface LoginProps {
  users: User[];
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ users, onLogin }) => {
  const [selectedUserId, setSelectedUserId] = useState<string>(users[1]?.id.toString() || '');

  const handleLogin = () => {
    const user = users.find(u => u.id.toString() === selectedUserId);
    if (user) {
      onLogin(user);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary dark:bg-dark-primary p-4">
      <Card className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
            <VibeCodeIcon className="h-16 w-16 text-indigo-500 mb-4"/>
            <h1 className="text-3xl font-bold">Welcome to Quarterly Peer Review</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-center">Simple, human-centered, AI-enhanced feedback.</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="user-select" className="block text-sm font-medium mb-1">Select your profile (for demo)</label>
            <select
              id="user-select"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full p-3 border rounded-lg bg-secondary dark:bg-dark-secondary dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
          </div>
          <Button onClick={handleLogin} className="w-full" size="lg">
            Login
          </Button>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-6 text-center">
            This is a prototype. No real authentication is used.
        </p>
      </Card>
    </div>
  );
};

export default Login;