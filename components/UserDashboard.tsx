
import React from 'react';
import { User, View, FeedbackStatus } from '../types';
import { FEEDBACK_REQUESTS } from '../constants';
import Card from './common/Card';
import Button from './common/Button';

interface UserDashboardProps {
  currentUser: User;
  navigateTo: (view: View) => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ currentUser, navigateTo }) => {
  const feedbackToGive = FEEDBACK_REQUESTS.filter(
    req => req.reviewee.id === currentUser.id && req.status === FeedbackStatus.Pending
  );
  
  const myRequests = FEEDBACK_REQUESTS.filter(
    req => req.requester.id === currentUser.id
  );

  const mySummaries = ['Q2 2024', 'Q3 2024'].map(q => ({ userId: currentUser.id, quarter: q }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Feedback to Give */}
      <Card className="flex flex-col">
        <h3 className="text-xl font-bold mb-4">Feedback to Give ({feedbackToGive.length})</h3>
        <div className="flex-grow space-y-3 overflow-y-auto">
          {feedbackToGive.length > 0 ? (
            feedbackToGive.map(req => (
              <div key={req.id} className="p-3 bg-secondary dark:bg-dark-secondary rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-semibold">{req.requester.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Context: {req.context}</p>
                </div>
                <Button size="sm" onClick={() => navigateTo({ type: 'give-feedback', request: req })}>Give</Button>
              </div>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">No pending requests.</p>
          )}
        </div>
      </Card>

      {/* My Requests */}
      <Card className="flex flex-col">
        <h3 className="text-xl font-bold mb-4">My Requests ({myRequests.length})</h3>
        <div className="flex-grow space-y-3 overflow-y-auto">
          {myRequests.map(req => (
            <div key={req.id} className="p-3 bg-secondary dark:bg-dark-secondary rounded-lg">
              <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">Request for {req.reviewee.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">"{req.context}"</p>
                  </div>
                   <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    req.status === FeedbackStatus.Completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {req.status}
                  </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* My Summaries */}
      <Card className="flex flex-col">
        <h3 className="text-xl font-bold mb-4">My Summaries</h3>
        <div className="flex-grow space-y-3 overflow-y-auto">
           {mySummaries.map(summary => (
            <div key={summary.quarter} className="p-3 bg-secondary dark:bg-dark-secondary rounded-lg flex justify-between items-center">
              <p className="font-semibold">{summary.quarter} Summary</p>
              <Button size="sm" onClick={() => navigateTo({ type: 'view-summary', userId: summary.userId, quarter: summary.quarter })}>View</Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default UserDashboard;
