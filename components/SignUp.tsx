import React, { useState } from 'react';
import { Role, View } from '../types';
import Card from './common/Card';
import Button from './common/Button';
import { VibeCodeIcon } from './common/icons';

const DEPARTMENTS = ['Engineering', 'Product', 'Design', 'Marketing', 'Sales', 'HR', 'Leadership'];

interface SignUpProps {
  onSignUp: (newUser: { name: string, email: string, department: string, role: Role }) => void;
  navigateTo: (view: View) => void;
}

const SignUp: React.FC<SignUpProps> = ({ onSignUp, navigateTo }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [role, setRole] = useState<Role>(Role.Employee);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.toLowerCase().endsWith('@acme.com')) {
      setError('Please use your @acme.com work email to sign up.');
      return;
    }

    if (!name || !department) {
        setError('Please fill out all fields.');
        return;
    }

    onSignUp({ name, email, department, role });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary dark:bg-dark-primary p-4">
      <Card className="w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <VibeCodeIcon className="h-16 w-16 text-brand-600 mb-4" />
          <h1 className="text-3xl font-bold">Create your account</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Join the Acme Peer Feedback platform.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">Full Name</label>
            <input
              id="name" type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Alex Johnson"
              className="w-full p-3 border rounded-lg bg-secondary dark:bg-dark-secondary dark:border-gray-600" required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">Work Email</label>
            <input
              id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="alex.johnson@acme.com"
              className="w-full p-3 border rounded-lg bg-secondary dark:bg-dark-secondary dark:border-gray-600" required
            />
          </div>
          <div>
            <label htmlFor="department" className="block text-sm font-medium mb-1">Department</label>
            <select
              id="department" value={department} onChange={(e) => setDepartment(e.target.value)}
              className="w-full p-3 border rounded-lg bg-secondary dark:bg-dark-secondary dark:border-gray-600" required
            >
              {DEPARTMENTS.map(dep => <option key={dep} value={dep}>{dep}</option>)}
            </select>
          </div>
          <div>
             <label className="block text-sm font-medium mb-2">Role</label>
             <div className="flex gap-4">
                <label className="flex items-center">
                    <input type="radio" name="role" value={Role.Employee} checked={role === Role.Employee} onChange={() => setRole(Role.Employee)} className="h-4 w-4 text-brand-600"/>
                    <span className="ml-2">Employee</span>
                </label>
                 <label className="flex items-center">
                    <input type="radio" name="role" value={Role.Admin} checked={role === Role.Admin} onChange={() => setRole(Role.Admin)} className="h-4 w-4 text-brand-600"/>
                    <span className="ml-2">Admin</span>
                </label>
             </div>
          </div>
          
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <Button type="submit" className="w-full" size="lg">
            Create Account
          </Button>
        </form>

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-6 text-center">
          Already have an account?{' '}
          <button onClick={() => navigateTo({ type: 'login' })} className="font-semibold text-brand-600 hover:text-brand-500">
            Sign in
          </button>
        </p>
      </Card>
    </div>
  );
};

export default SignUp;