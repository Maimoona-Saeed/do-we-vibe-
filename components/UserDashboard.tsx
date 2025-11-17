import React, { useState, useContext, useRef, useEffect } from 'react';
import { User, View, FeedbackStatus, FeedbackRequest } from '../types';
import { AppContext } from '../App';
import Card from './common/Card';
import Button from './common/Button';
import { ClockIcon, CheckCircleIcon, TrendingUpIcon, ChatBubbleLeftRightIcon, WandIcon, ChatBubbleOvalLeftEllipsisIcon } from './common/icons';
import Modal from './common/Modal';
import { geminiService } from '../services/geminiService';

const getInitials = (name: string) => {
  const names = name.split(' ');
  if (names.length > 1) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const timeSince = (dateString: string) => {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
}

const StatCard: React.FC<{ icon: React.ReactNode; value: string | number; label: string; color: string; }> = ({ icon, value, label, color }) => (
    <Card className="flex items-center p-4">
        <div className={`p-3 rounded-full mr-4 ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        </div>
    </Card>
);

const FeedbackRequestItem: React.FC<{request: FeedbackRequest, onAction: () => void, actionLabel: string}> = ({request, onAction, actionLabel}) => {
    const tagStyles = {
        'Requested': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        'Suggested': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
        'Mandated': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    }
    
    return (
        <Card className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold text-lg">
                    {getInitials(request.requester.name)}
                </div>
                <div>
                    <p className="font-bold text-lg">{request.requester.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{request.requester.department}</p>
                    <div className="flex items-center gap-2 mt-2">
                         <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${tagStyles[request.type]}`}>
                            {request.type} Peership
                        </span>
                        <p className="text-xs text-gray-400">Requested {timeSince(request.createdAt)}</p>
                    </div>
                </div>
            </div>
            <Button size="md" onClick={onAction}>{actionLabel}</Button>
        </Card>
    )
}

const FloatingActionButton: React.FC<{ onClick: () => void, children: React.ReactNode, 'aria-label': string }> = ({ onClick, children, 'aria-label': ariaLabel }) => (
    <button
        onClick={onClick}
        aria-label={ariaLabel}
        className="fixed bottom-8 right-8 bg-brand-600 text-white rounded-full p-4 shadow-lg hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 z-40 transition-transform hover:scale-110"
    >
        {children}
    </button>
);

type ChatMessage = {
    role: 'user' | 'model';
    parts: string;
};

const FeedbackCoach: React.FC<{onClose: () => void}> = ({ onClose }) => {
    const [history, setHistory] = useState<ChatMessage[]>([{ role: 'model', parts: "Hi! I'm your AI Feedback Coach. How can I help you give or receive better feedback today?" }]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [history]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        
        const newHistory: ChatMessage[] = [...history, { role: 'user', parts: input }];
        setHistory(newHistory);
        setInput('');
        setIsLoading(true);

        const response = await geminiService.getFeedbackCoachAdvice(newHistory);
        setHistory(prev => [...prev, { role: 'model', parts: response }]);
        setIsLoading(false);
    };

    return (
        <div className="flex flex-col h-[60vh]">
            <div ref={chatContainerRef} className="flex-grow p-4 space-y-4 overflow-y-auto bg-secondary dark:bg-dark-secondary rounded-t-lg">
                {history.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-brand-600 text-white' : 'bg-card dark:bg-dark-card'}`}>
                            {msg.parts}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="max-w-xs px-4 py-2 rounded-2xl bg-card dark:bg-dark-card animate-pulse">
                           Thinking...
                        </div>
                    </div>
                )}
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask for feedback advice..."
                    className="w-full p-2 border rounded-lg bg-primary dark:bg-dark-primary dark:border-gray-600"
                    disabled={isLoading}
                />
                <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
                    Send
                </Button>
            </div>
        </div>
    );
};


const UserDashboard: React.FC<{ currentUser: User; navigateTo: (view: View) => void; }> = ({ currentUser, navigateTo }) => {
  const context = useContext(AppContext);
  const [activeTab, setActiveTab] = useState<'pending' | 'completed' | 'summary'>('pending');
  const [isCoachOpen, setCoachOpen] = useState(false);
  
  if (!context) return null;
  const { feedbackRequests, feedbackData } = context;

  const feedbackToGive = feedbackRequests.filter(
    req => req.reviewee.id === currentUser.id && req.status === FeedbackStatus.Pending
  );
  
  const completedFeedback = feedbackRequests.filter(req => 
    (req.requester.id === currentUser.id || req.reviewee.id === currentUser.id) && req.status === FeedbackStatus.Completed
  );
  
  const myRequestIds = feedbackRequests
    .filter(req => req.requester.id === currentUser.id || req.reviewee.id === currentUser.id)
    .map(req => req.id);

  const receivedFeedback = feedbackData.filter(f => myRequestIds.includes(f.requestId) && (f.reviewer === null || f.reviewer?.id !== currentUser.id));
  
  const avgVibe = receivedFeedback.length > 0
    ? (receivedFeedback.reduce((acc, f) => acc + f.vibeRating, 0) / receivedFeedback.length).toFixed(1)
    : 'N/A';

  const totalRequestsThisQuarter = feedbackRequests.filter(
    req => (req.requester.id === currentUser.id || req.reviewee.id === currentUser.id) && req.quarter === 'Q4 2024'
  ).length;

  const mySummaries = ['Q2 2024', 'Q3 2024', 'Q4 2024'].map(q => ({ userId: currentUser.id, quarter: q }));

  const renderContent = () => {
    switch(activeTab) {
        case 'pending':
            return (
                <div className="space-y-4">
                    {feedbackToGive.length > 0 ? (
                        feedbackToGive.map(req => (
                           <FeedbackRequestItem 
                             key={req.id} 
                             request={req} 
                             onAction={() => navigateTo({ type: 'give-feedback', request: req })}
                             actionLabel="Give Feedback"
                           />
                        ))
                    ) : <p className="text-center text-gray-500 dark:text-gray-400 py-8">No pending requests!</p>}
                </div>
            )
        case 'completed':
            return (
                <div className="space-y-4">
                    {completedFeedback.length > 0 ? (
                        completedFeedback.map(req => (
                           <Card key={req.id} className="p-4 flex justify-between items-center">
                               <div>
                                   <p className="font-semibold">Feedback for {req.requester.id === currentUser.id ? req.reviewee.name : req.requester.name}</p>
                                   <p className="text-sm text-gray-500 dark:text-gray-400">"{req.context}"</p>
                               </div>
                               <span className="text-sm text-green-600">Completed</span>
                           </Card>
                        ))
                    ) : <p className="text-center text-gray-500 dark:text-gray-400 py-8">No completed feedback yet.</p>}
                </div>
            )
        case 'summary':
             return (
                <div className="space-y-4">
                    {mySummaries.map(summary => (
                        <Card key={summary.quarter} className="p-4 flex justify-between items-center">
                            <p className="font-semibold">{summary.quarter} Summary</p>
                            <Button size="sm" onClick={() => navigateTo({ type: 'view-summary', userId: summary.userId, quarter: summary.quarter })}>View Summary</Button>
                        </Card>
                    ))}
                </div>
            )
    }
  }

  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon={<ClockIcon className="h-6 w-6 text-blue-800"/>} value={feedbackToGive.length} label="Pending" color="bg-blue-200 dark:bg-blue-800/50" />
            <StatCard icon={<CheckCircleIcon className="h-6 w-6 text-green-800"/>} value={completedFeedback.length} label="Completed" color="bg-green-200 dark:bg-green-800/50"/>
            <StatCard icon={<TrendingUpIcon className="h-6 w-6 text-indigo-800"/>} value={avgVibe} label="Avg Vibe" color="bg-indigo-200 dark:bg-indigo-800/50"/>
            <StatCard icon={<ChatBubbleLeftRightIcon className="h-6 w-6 text-pink-800"/>} value={totalRequestsThisQuarter} label="Total Q4" color="bg-pink-200 dark:bg-pink-800/50"/>
        </div>

        <div>
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button onClick={() => setActiveTab('pending')} className={`${activeTab === 'pending' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-base`}>
                        Pending Requests ({feedbackToGive.length})
                    </button>
                    <button onClick={() => setActiveTab('completed')} className={`${activeTab === 'completed' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-base`}>
                        Completed ({completedFeedback.length})
                    </button>
                    <button onClick={() => setActiveTab('summary')} className={`${activeTab === 'summary' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-base`}>
                        My Summary
                    </button>
                </nav>
            </div>
            <div className="mt-6">
                {renderContent()}
            </div>
        </div>
        
        <FloatingActionButton onClick={() => setCoachOpen(true)} aria-label="Open AI Feedback Coach">
            <ChatBubbleOvalLeftEllipsisIcon className="h-6 w-6" />
        </FloatingActionButton>

        <Modal isOpen={isCoachOpen} onClose={() => setCoachOpen(false)} title="AI Feedback Coach">
            <FeedbackCoach onClose={() => setCoachOpen(false)} />
        </Modal>
    </div>
  );
};

export default UserDashboard;