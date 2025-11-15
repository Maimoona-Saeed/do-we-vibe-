
import React, { useState } from 'react';
import { User, Role, View } from '../types';
import UserDashboard from './UserDashboard';
import AdminDashboard from './AdminDashboard';
import Button from './common/Button';
import Modal from './common/Modal';
import FeedbackRequestForm from './FeedbackRequestForm';

interface DashboardProps {
  currentUser: User;
  navigateTo: (view: View) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ currentUser, navigateTo }) => {
  const [activeTab, setActiveTab] = useState<'user' | 'admin'>('user');
  const [isRequestModalOpen, setRequestModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Dashboard</h2>
          <p className="text-gray-500 dark:text-gray-400">Welcome back, {currentUser.name}!</p>
        </div>
        <Button onClick={() => setRequestModalOpen(true)}>Request Feedback</Button>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('user')}
            className={`${activeTab === 'user' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            My View
          </button>
          {currentUser.role === Role.Admin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`${activeTab === 'admin' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Admin Overview
            </button>
          )}
        </nav>
      </div>

      <div>
        {activeTab === 'user' && <UserDashboard currentUser={currentUser} navigateTo={navigateTo} />}
        {activeTab === 'admin' && currentUser.role === Role.Admin && <AdminDashboard />}
      </div>
      
      <Modal isOpen={isRequestModalOpen} onClose={() => setRequestModalOpen(false)} title="Request Peer Feedback">
        <FeedbackRequestForm currentUser={currentUser} onClose={() => setRequestModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default Dashboard;
