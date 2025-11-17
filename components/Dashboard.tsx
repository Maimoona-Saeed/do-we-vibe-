import React, { useState, useContext } from 'react';
// FIX: Import FeedbackStatus to resolve 'Cannot find name' error.
import { User, Role, View, FeedbackStatus } from '../types';
import { AppContext } from '../App';
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
  const context = useContext(AppContext);
  const [activeTab, setActiveTab] = useState<'user' | 'admin'>('user');
  const [isRequestModalOpen, setRequestModalOpen] = useState(false);
  
  const handleMandatedRequest = (employee: User, reviewers: User[]) => {
      if (!context) return;
      context.addFeedbackRequests(reviewers, `Mandated request by Admin for ${employee.name}.`, false, 'Mandated');
      alert(`Mandated feedback request for ${employee.name} from ${reviewers.length} peers.`);
  };


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
            className={`${activeTab === 'user' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            My View
          </button>
          {currentUser.role === Role.Admin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`${activeTab === 'admin' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Admin Overview
            </button>
          )}
        </nav>
      </div>

      <div>
        {activeTab === 'user' && <UserDashboard currentUser={currentUser} navigateTo={navigateTo} />}
        {activeTab === 'admin' && currentUser.role === Role.Admin && <AdminDashboard onMandateRequest={handleMandatedRequest} />}
      </div>
      
      <Modal isOpen={isRequestModalOpen} onClose={() => setRequestModalOpen(false)} title="Request Peer Feedback">
        <FeedbackRequestForm onClose={() => setRequestModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default Dashboard;