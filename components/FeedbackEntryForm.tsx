import React, { useState, useEffect, useContext } from 'react';
import type { FeedbackRequest, SBI } from '../types';
import { AppContext } from '../App';
import Card from './common/Card';
import Button from './common/Button';
import { geminiService } from '../services/geminiService';
import { WandIcon, ArrowLeftIcon } from './common/icons';

interface FeedbackEntryFormProps {
  request: FeedbackRequest;
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

const ToneFeedbackTextarea: React.FC<{
  id: string;
  value: string;
  onChange: (value: string) => void;
  label: string;
  description: string;
}> = ({ id, value, onChange, label, description }) => {
  const [toneSuggestion, setToneSuggestion] = useState('');
  const [isCheckingTone, setIsCheckingTone] = useState(false);

  useEffect(() => {
    setToneSuggestion('');
    if (value.trim().length < 15) {
      setIsCheckingTone(false);
      return;
    }
    const handler = setTimeout(async () => {
      setIsCheckingTone(true);
      const suggestion = await geminiService.rephraseTone(value);
      setToneSuggestion(suggestion);
      setIsCheckingTone(false);
    }, 1500);
    return () => clearTimeout(handler);
  }, [value]);

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold">{label}</label>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{description}</p>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full p-2 border rounded-lg bg-secondary dark:bg-dark-secondary dark:border-gray-600"
      />
      {isCheckingTone && (
        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
          <WandIcon className="h-4 w-4 animate-spin" />
          <span>Checking tone...</span>
        </div>
      )}
      {toneSuggestion && !isCheckingTone && (
        <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm font-semibold text-brand-700 dark:text-brand-300 flex items-center gap-2">
            <WandIcon className="h-4 w-4" />
            AI Suggestion
          </p>
          <p className="mt-1 text-sm text-card-foreground dark:text-dark-card_foreground">"{toneSuggestion}"</p>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="mt-2"
            onClick={() => {
              onChange(toneSuggestion);
              setToneSuggestion('');
            }}
          >
            Apply Suggestion
          </Button>
        </div>
      )}
    </div>
  );
};

const FeedbackEntryForm: React.FC<FeedbackEntryFormProps> = ({ request, onBack }) => {
  const context = useContext(AppContext);
  const [strengths, setStrengths] = useState<SBI>({ situation: '', behavior: '', impact: '' });
  const [growth, setGrowth] = useState<SBI>({ situation: '', behavior: '', impact: '' });
  const [vibeRating, setVibeRating] = useState(0);
  const [vibeComment, setVibeComment] = useState('');

  const handleStrengthsChange = (field: keyof SBI, value: string) => {
    setStrengths(prev => ({ ...prev, [field]: value }));
  };
  
  const handleGrowthChange = (field: keyof SBI, value: string) => {
      setGrowth(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!context) return;
    if (!strengths.situation.trim() || !strengths.behavior.trim() || !strengths.impact.trim() ||
        !growth.situation.trim() || !growth.behavior.trim() || !growth.impact.trim() ||
        vibeRating === 0) {
        alert("Please fill out all SBI fields for Strengths and Growth, and provide a vibe rating.");
        return;
    }
    context.submitFeedback(request, {
        strengths,
        growthOpportunities: growth,
        vibeRating,
        vibeComment,
    });
    alert('Feedback submitted successfully!');
    onBack();
  };

  return (
    <div className="max-w-4xl mx-auto">
       <Button onClick={onBack} variant="secondary" className="mb-6">
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        Back
      </Button>
      <form onSubmit={handleSubmit} className="space-y-8">
        <h2 className="text-3xl font-bold">Giving Feedback to {request.requester.name}</h2>
        <p className="text-gray-500 dark:text-gray-400">Request Context: "{request.context}"</p>
        
        <Card>
          <h3 className="text-xl font-bold">Strengths</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 my-2">Use the SBI model (Situation-Behavior-Impact) for specific and helpful feedback. E.g., "In the Q3 planning meeting (Situation), you clearly articulated the project goals (Behavior), which helped the team align quickly (Impact)."</p>
          <div className="space-y-4 mt-4">
            <div>
              <label htmlFor="strengths-situation" className="block text-sm font-semibold">Situation</label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">When/where did this happen?</p>
              <textarea id="strengths-situation" value={strengths.situation} onChange={e => handleStrengthsChange('situation', e.target.value)} rows={2} className="w-full p-2 border rounded-lg bg-secondary dark:bg-dark-secondary dark:border-gray-600" />
            </div>
            <ToneFeedbackTextarea
              id="strengths-behavior"
              value={strengths.behavior}
              onChange={value => handleStrengthsChange('behavior', value)}
              label="Behavior"
              description="What was the specific action or behavior you observed?"
            />
            <ToneFeedbackTextarea
              id="strengths-impact"
              value={strengths.impact}
              onChange={value => handleStrengthsChange('impact', value)}
              label="Impact"
              description="What was the result or impact of this behavior?"
            />
          </div>
        </Card>

        <Card>
          <h3 className="text-xl font-bold">Growth Opportunities</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 my-2">Frame this constructively. What could they start, stop, or continue doing to be even more effective?</p>
           <div className="space-y-4 mt-4">
            <div>
              <label htmlFor="growth-situation" className="block text-sm font-semibold">Situation</label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">When/where could there be an opportunity for growth?</p>
              <textarea id="growth-situation" value={growth.situation} onChange={e => handleGrowthChange('situation', e.target.value)} rows={2} className="w-full p-2 border rounded-lg bg-secondary dark:bg-dark-secondary dark:border-gray-600" />
            </div>
            <ToneFeedbackTextarea
              id="growth-behavior"
              value={growth.behavior}
              onChange={value => handleGrowthChange('behavior', value)}
              label="Behavior"
              description="What different behavior could have been demonstrated?"
            />
            <ToneFeedbackTextarea
              id="growth-impact"
              value={growth.impact}
              onChange={value => handleGrowthChange('impact', value)}
              label="Impact"
              description="What could the positive impact of this new behavior be?"
            />
          </div>
        </Card>

        <Card>
          <label className="text-xl font-bold">Vibe Rating</label>
          <p className="text-sm text-gray-500 dark:text-gray-400 my-2">How was your overall experience collaborating with this person?</p>
          <StarRating rating={vibeRating} setRating={setVibeRating} />
          <textarea value={vibeComment} onChange={e => setVibeComment(e.target.value)} rows={2} className="w-full p-2 border rounded-lg bg-secondary dark:bg-dark-secondary dark:border-gray-600 mt-4" placeholder="Optional comment..."/>
        </Card>
        
        {request.isAnonymous && <p className="text-sm text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300 p-3 rounded-lg text-center">Your feedback will be submitted anonymously.</p>}

        <div className="flex justify-end">
          <Button type="submit" size="lg">Submit Feedback</Button>
        </div>
      </form>
    </div>
  );
};

export default FeedbackEntryForm;