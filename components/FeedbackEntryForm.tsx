import React, { useState, useEffect } from 'react';
import type { User, FeedbackRequest } from '../types';
import Card from './common/Card';
import Button from './common/Button';
import { geminiService } from '../services/geminiService';
import { WandIcon } from './common/icons';

interface FeedbackEntryFormProps {
  request: FeedbackRequest;
  currentUser: User;
  onBack: () => void;
}

const StarRating = ({ rating, setRating }: { rating: number, setRating: (r: number) => void }) => (
  <div className="flex space-x-1">
    {[1, 2, 3, 4, 5].map(star => (
      <button key={star} type="button" onClick={() => setRating(star)} className="focus:outline-none">
        <svg className={`w-8 h-8 ${rating >= star ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.955a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.368 2.445a1 1 0 00-.364 1.118l1.287 3.955c.3.921-.755 1.688-1.54 1.118l-3.368-2.445a1 1 0 00-1.175 0l-3.368 2.445c-.784.57-1.838-.197-1.539-1.118l1.287-3.955a1 1 0 00-.364-1.118L2.05 9.382c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z" />
        </svg>
      </button>
    ))}
  </div>
);

const FeedbackEntryForm: React.FC<FeedbackEntryFormProps> = ({ request, onBack }) => {
  const [strengths, setStrengths] = useState('');
  const [growth, setGrowth] = useState('');
  const [vibeRating, setVibeRating] = useState(0);
  const [vibeComment, setVibeComment] = useState('');
  
  const [strengthsToneSuggestion, setStrengthsToneSuggestion] = useState('');
  const [isCheckingStrengthsTone, setIsCheckingStrengthsTone] = useState(false);
  const [growthToneSuggestion, setGrowthToneSuggestion] = useState('');
  const [isCheckingGrowthTone, setIsCheckingGrowthTone] = useState(false);
  
  // Debounce logic for strengths tone checking
  useEffect(() => {
    setStrengthsToneSuggestion(''); // Clear previous suggestion when user types
    if (strengths.trim().length < 15) { // Minimum length to trigger check
      return;
    }

    const handler = setTimeout(async () => {
      setIsCheckingStrengthsTone(true);
      const suggestion = await geminiService.rephraseTone(strengths);
      setStrengthsToneSuggestion(suggestion);
      setIsCheckingStrengthsTone(false);
    }, 1500); // 1.5 second debounce

    return () => {
      clearTimeout(handler);
    };
  }, [strengths]);

  // Debounce logic for growth tone checking
  useEffect(() => {
    setGrowthToneSuggestion(''); // Clear previous suggestion when user types
    if (growth.trim().length < 15) { // Minimum length to trigger check
      return;
    }

    const handler = setTimeout(async () => {
      setIsCheckingGrowthTone(true);
      const suggestion = await geminiService.rephraseTone(growth);
      setGrowthToneSuggestion(suggestion);
      setIsCheckingGrowthTone(false);
    }, 1500); // 1.5 second debounce

    return () => {
      clearTimeout(handler);
    };
  }, [growth]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to submit feedback
    alert('Feedback submitted successfully!');
    onBack();
  };

  return (
    <div className="max-w-4xl mx-auto">
       <Button onClick={onBack} variant="secondary" className="mb-4">
        &larr; Back to Dashboard
      </Button>
      <form onSubmit={handleSubmit} className="space-y-8">
        <h2 className="text-3xl font-bold">Giving Feedback to {request.requester.name}</h2>
        <p className="text-gray-500 dark:text-gray-400">Request Context: "{request.context}"</p>
        
        <Card>
          <label htmlFor="strengths" className="text-xl font-bold">Strengths</label>
          <p className="text-sm text-gray-500 dark:text-gray-400 my-2">Use the SBI model (Situation-Behavior-Impact) for specific and helpful feedback. E.g., "In the Q3 planning meeting (Situation), you clearly articulated the project goals (Behavior), which helped the team align quickly (Impact)."</p>
          <textarea id="strengths" value={strengths} onChange={e => setStrengths(e.target.value)} rows={5} className="w-full p-2 border rounded-lg bg-secondary dark:bg-dark-secondary dark:border-gray-600 mt-1" />
          {isCheckingStrengthsTone && (
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <WandIcon className="h-4 w-4 animate-spin" />
              <span>Checking tone...</span>
            </div>
          )}
          {strengthsToneSuggestion && !isCheckingStrengthsTone && (
            <div className="mt-2 p-3 bg-indigo-50 dark:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800 rounded-lg">
              <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                <WandIcon className="h-4 w-4" />
                AI Suggestion
              </p>
              <p className="mt-1 text-sm text-card-foreground dark:text-dark-card_foreground">"{strengthsToneSuggestion}"</p>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="mt-2"
                onClick={() => {
                  setStrengths(strengthsToneSuggestion);
                  setStrengthsToneSuggestion('');
                }}
              >
                Apply Suggestion
              </Button>
            </div>
          )}
        </Card>

        <Card>
          <label htmlFor="growth" className="text-xl font-bold">Growth Opportunities</label>
           <p className="text-sm text-gray-500 dark:text-gray-400 my-2">Frame this constructively. What could they start, stop, or continue doing to be even more effective?</p>
          <textarea id="growth" value={growth} onChange={e => setGrowth(e.target.value)} rows={5} className="w-full p-2 border rounded-lg bg-secondary dark:bg-dark-secondary dark:border-gray-600 mt-1" />
          {isCheckingGrowthTone && (
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <WandIcon className="h-4 w-4 animate-spin" />
              <span>Checking tone...</span>
            </div>
          )}
          {growthToneSuggestion && !isCheckingGrowthTone && (
            <div className="mt-2 p-3 bg-indigo-50 dark:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800 rounded-lg">
              <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                <WandIcon className="h-4 w-4" />
                AI Suggestion
              </p>
              <p className="mt-1 text-sm text-card-foreground dark:text-dark-card_foreground">"{growthToneSuggestion}"</p>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="mt-2"
                onClick={() => {
                  setGrowth(growthToneSuggestion);
                  setGrowthToneSuggestion('');
                }}
              >
                Apply Suggestion
              </Button>
            </div>
          )}
        </Card>

        <Card>
          <label className="text-xl font-bold">Vibe Rating</label>
          <p className="text-sm text-gray-500 dark:text-gray-400 my-2">How was your overall experience collaborating with this person?</p>
          <StarRating rating={vibeRating} setRating={setVibeRating} />
          <textarea value={vibeComment} onChange={e => setVibeComment(e.target.value)} rows={2} className="w-full p-2 border rounded-lg bg-secondary dark:bg-dark-secondary dark:border-gray-600 mt-4" placeholder="Optional comment..."/>
        </Card>
        
        {request.isAnonymous && <p className="text-sm text-yellow-600 bg-yellow-100 p-3 rounded-lg text-center">Your feedback will be submitted anonymously.</p>}

        <div className="flex justify-end">
          <Button type="submit" size="lg">Submit Feedback</Button>
        </div>
      </form>
    </div>
  );
};

export default FeedbackEntryForm;