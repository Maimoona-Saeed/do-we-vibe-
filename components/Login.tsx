import React, { useState } from 'react';
import type { User, View } from '../types';
import Card from './common/Card';
import Button from './common/Button';
import { VibeCodeIcon, GoogleIcon } from './common/icons';

interface LoginProps {
  users: User[];
  onLogin: (user: User) => void;
  navigateTo: (view: View) => void;
}

const Login: React.FC<LoginProps> = ({ users, onLogin, navigateTo }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      onLogin(user);
    } else {
      setError('No user found with that email address. Please check your email or sign up.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary dark:bg-dark-primary p-4">
      <Card className="w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
            <VibeCodeIcon className="h-16 w-16 text-brand-600 mb-4"/>
            <h1 className="text-3xl font-bold">Acme Peer Feedback</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Sign in to your account</p>
        </div>
        
        <div className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">Company Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  placeholder="alex@acme.com"
                  className="w-full p-3 border rounded-lg bg-secondary dark:bg-dark-secondary dark:border-gray-600 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  required
                />
                 {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
              </div>
              <Button type="submit" className="w-full" size="lg">
                Sign In
              </Button>
            </form>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-card dark:bg-dark-card text-gray-500 dark:text-gray-400">
                    Or
                    </span>
                </div>
            </div>

            <Button variant="secondary" className="w-full" size="lg">
                <GoogleIcon />
                Sign In with Google
            </Button>
        </div>

         <p className="text-sm text-gray-500 dark:text-gray-400 mt-6 text-center">
            Don't have an account?{' '}
            <button onClick={() => navigateTo({ type: 'signup' })} className="font-semibold text-brand-600 hover:text-brand-500">
                Sign up
            </button>
        </p>
      </Card>
    </div>
  );
};

export default Login;