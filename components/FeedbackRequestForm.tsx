import React, { useState, useEffect, useContext } from 'react';
import type { User } from '../types';
import { AppContext } from '../App';
import { geminiService } from '../services/geminiService';
import Button from './common/Button';
import Toggle from './common/Toggle';
import { WandIcon } from './common/icons';

interface FeedbackRequestFormProps {
  onClose: () => void;
}

type RequestType = 'Suggested' | 'Requested' | 'Nudge';

const FeedbackRequestForm: React.FC<FeedbackRequestFormProps> = ({ onClose }) => {
  const context = useContext(AppContext);
  const [requestType, setRequestType] = useState<RequestType>('Requested');
  const [selectedPeers, setSelectedPeers] = useState<User[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [contextText, setContextText] = useState('');
  const [isLoadingPeers, setIsLoadingPeers] = useState(false);

  if (!context || !context.currentUser) return null;
  const { currentUser, users, addFeedbackRequests } = context;

  const availablePeers = users.filter(u => u.id !== currentUser.id);

  useEffect(() => {
    if (requestType === 'Suggested') {
      const fetchSuggestedPeers = async () => {
        setIsLoadingPeers(true);
        const peerNames = await geminiService.suggestPeers(currentUser, users);
        const suggested = users.filter(u => peerNames.includes(u.name));
        setSelectedPeers(suggested);
        setIsLoadingPeers(false);
      };
      fetchSuggestedPeers();
    } else {
        setSelectedPeers([]);
    }
  }, [requestType, currentUser, users]);

  const handlePeerToggle = (peer: User) => {
    setSelectedPeers(prev =>
      prev.some(p => p.id === peer.id) ? prev.filter(p => p.id !== peer.id) : [...prev, peer]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPeers.length === 0) {
        alert("Please select at least one peer.");
        return;
    }
    addFeedbackRequests(selectedPeers, contextText, isAnonymous, requestType);
    alert('Feedback request submitted!');
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block font-medium mb-2">Request Type</label>
        <div className="flex flex-wrap gap-2">
          {(['Suggested', 'Requested', 'Nudge'] as RequestType[]).map(type => (
            <Button
              key={type}
              type="button"
              variant={requestType === type ? 'primary' : 'secondary'}
              onClick={() => setRequestType(type)}
            >
              {type === 'Suggested' && <WandIcon className="h-4 w-4" />}
              {type} Peership
            </Button>
          ))}
        </div>
      </div>
      
      <div>
        <label className="block font-medium mb-2">Select Peers</label>
        {isLoadingPeers ? <p>AI is suggesting peers...</p> : (
        <div className="max-h-48 overflow-y-auto space-y-2 p-2 border rounded-lg dark:border-gray-600">
          {availablePeers.map(peer => (
            <div key={peer.id} className="flex items-center justify-between p-2 rounded-md hover:bg-secondary dark:hover:bg-dark-secondary">
                <div className="flex items-center gap-3">
                    <img src={peer.avatar} alt={peer.name} className="h-8 w-8 rounded-full" />
                    <span>{peer.name}</span>
                </div>
              <input
                type="checkbox"
                checked={selectedPeers.some(p => p.id === peer.id)}
                onChange={() => handlePeerToggle(peer)}
                className="h-5 w-5 rounded text-brand-600 focus:ring-brand-500"
              />
            </div>
          ))}
        </div>
        )}
      </div>

      <div>
        <label htmlFor="context" className="block font-medium mb-1">Context (Optional)</label>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">What do you want feedback on? e.g., "My presentation skills in the Q4 review."</p>
        <textarea
          id="context"
          value={contextText}
          onChange={(e) => setContextText(e.target.value)}
          rows={3}
          className="w-full p-2 border rounded-lg bg-secondary dark:bg-dark-secondary dark:border-gray-600 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
        />
      </div>

      <div className="flex items-center justify-between p-3 bg-secondary dark:bg-dark-secondary rounded-lg">
        <div>
            <label className="font-medium">Keep my name hidden</label>
            <p className="text-sm text-gray-500 dark:text-gray-400">Your feedback will be submitted anonymously.</p>
        </div>
        <Toggle isEnabled={isAnonymous} onToggle={() => setIsAnonymous(!isAnonymous)} />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button type="submit">Send Request</Button>
      </div>
    </form>
  );
};

export default FeedbackRequestForm;