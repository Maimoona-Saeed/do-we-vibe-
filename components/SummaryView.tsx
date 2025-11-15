
import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { geminiService } from '../services/geminiService';
import { FEEDBACK_DATA, USERS } from '../constants';
import Card from './common/Card';
import Button from './common/Button';

interface SummaryViewProps {
  userId: number;
  quarter: string;
  onBack: () => void;
}

const COLORS = ['#4f46e5', '#818cf8', '#a5b4fc']; // Indigo shades

const mockSummary = {
    strengths: "Excels in collaboration and is seen as a key team player. Project leadership skills are frequently highlighted.",
    growth: "Attention to detail on final QA checks could be improved. Some feedback suggests taking more initiative in cross-departmental communication.",
    themes: ["Collaboration", "Leadership", "QA", "Communication"],
    sentiment: { positive: 70, neutral: 20, negative: 10 },
    vibeTrend: [
        { quarter: 'Q1', score: 4.2 },
        { quarter: 'Q2', score: 4.5 },
        { quarter: 'Q3', score: 4.4 },
    ]
};

const SummaryView: React.FC<SummaryViewProps> = ({ userId, quarter, onBack }) => {
  const [summary, setSummary] = useState(mockSummary);
  const [isLoading, setIsLoading] = useState(true);
  const user = USERS.find(u => u.id === userId);

  useEffect(() => {
    const fetchSummary = async () => {
      if (!user) return;
      setIsLoading(true);
      const result = await geminiService.summarizeFeedback(FEEDBACK_DATA, user.name);
      // Merging AI result with mock data for demo
      setSummary(prev => ({ ...prev, strengths: result.strengths, growth: result.growth, themes: result.themes }));
      setIsLoading(false);
    };
    fetchSummary();
  }, [userId, user]);

  const sentimentData = [
    { name: 'Positive', value: summary.sentiment.positive },
    { name: 'Neutral', value: summary.sentiment.neutral },
    { name: 'Negative', value: summary.sentiment.negative },
  ];
  
  if (!user) return <p>User not found.</p>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Button onClick={onBack} variant="secondary">
        &larr; Back to Dashboard
      </Button>

      <div className="text-center">
        <h2 className="text-3xl font-bold">Feedback Summary for {user.name}</h2>
        <p className="text-xl text-gray-500 dark:text-gray-400">{quarter}</p>
      </div>

      {isLoading ? <p>AI is generating your summary...</p> : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <h3 className="text-xl font-bold text-green-500 mb-2">Strengths Summary</h3>
            <p>{summary.strengths}</p>
          </Card>
          <Card>
            <h3 className="text-xl font-bold mb-2">Key Themes</h3>
            <div className="flex flex-wrap gap-2">
                {summary.themes.map(theme => (
                    <span key={theme} className="bg-indigo-100 text-indigo-800 text-sm font-medium px-2.5 py-0.5 rounded-full dark:bg-indigo-900 dark:text-indigo-300">
                        {theme}
                    </span>
                ))}
            </div>
          </Card>
          <Card className="lg:col-span-2">
             <h3 className="text-xl font-bold text-orange-500 mb-2">Growth Opportunities Summary</h3>
             <p>{summary.growth}</p>
          </Card>
          <Card>
             <h3 className="text-xl font-bold mb-2">Sentiment Analysis</h3>
             <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                    <Pie data={sentimentData} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {sentimentData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                </PieChart>
             </ResponsiveContainer>
          </Card>
          <Card className="lg:col-span-3">
             <h3 className="text-xl font-bold mb-4">Vibe Score Trend</h3>
             <ResponsiveContainer width="100%" height={300}>
                <LineChart data={summary.vibeTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="quarter" />
                    <YAxis domain={[1, 5]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={2} name="Avg. Vibe Score" />
                </LineChart>
             </ResponsiveContainer>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SummaryView;
