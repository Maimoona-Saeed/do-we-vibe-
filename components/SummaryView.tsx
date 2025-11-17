import React, { useState, useEffect, useContext } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { geminiService } from '../services/geminiService';
import { AppContext } from '../App';
import Card from './common/Card';
import Button from './common/Button';
import { ArrowLeftIcon } from './common/icons';

interface SummaryViewProps {
  userId: number;
  quarter: string;
  onBack: () => void;
}

const COLORS = ['#2563eb', '#60a5fa', '#93c5fd']; // Brand blue shades

const mockSentiment = { positive: 70, neutral: 20, negative: 10 };

const SummaryView: React.FC<SummaryViewProps> = ({ userId, quarter, onBack }) => {
  const context = useContext(AppContext);
  const [summary, setSummary] = useState({ strengths: "", growth: "", themes: [] });
  const [vibeTrend, setVibeTrend] = useState<{ quarter: string; score: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const user = context?.users.find(u => u.id === userId);

  useEffect(() => {
    if (!context || !user) return;
    
    const fetchSummary = async () => {
      setIsLoading(true);
      const { feedbackRequests, feedbackData } = context;

      const userRequestIds = feedbackRequests
        .filter(req => (req.requester.id === userId || req.reviewee.id === userId) && req.quarter === quarter)
        .map(req => req.id);

      const userFeedback = feedbackData.filter(f => userRequestIds.includes(f.requestId));
      
      if (userFeedback.length > 0) {
        const result = await geminiService.summarizeFeedback(userFeedback, user.name);
        setSummary(result);
      } else {
        setSummary({ strengths: "No feedback available for this quarter.", growth: "", themes: [] });
      }

      // Calculate Vibe Trend
      const allQuarters = [...new Set(feedbackRequests.map(r => r.quarter))].sort();
      const trend = allQuarters.map(q => {
        const reqIds = feedbackRequests.filter(r => (r.requester.id === userId || r.reviewee.id === userId) && r.quarter === q).map(r => r.id);
        const feedbackInQuarter = feedbackData.filter(f => reqIds.includes(f.requestId));
        const avgScore = feedbackInQuarter.length > 0 ? feedbackInQuarter.reduce((acc, f) => acc + f.vibeRating, 0) / feedbackInQuarter.length : 0;
        return { quarter: q, score: parseFloat(avgScore.toFixed(2)) };
      });
      setVibeTrend(trend);

      setIsLoading(false);
    };
    fetchSummary();
  }, [userId, quarter, context, user]);

  const sentimentData = [
    { name: 'Positive', value: mockSentiment.positive },
    { name: 'Neutral', value: mockSentiment.neutral },
    { name: 'Negative', value: mockSentiment.negative },
  ];

  const themeRadarData = summary.themes.map(theme => ({
      subject: theme,
      A: Math.floor(Math.random() * (5 - 3 + 1) + 3), // Mocking data for radar chart
      fullMark: 5,
  }));
  
  if (!user) return <p>User not found.</p>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Button onClick={onBack} variant="secondary">
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        Back
      </Button>

      <div className="text-center">
        <h2 className="text-3xl font-bold">Feedback Summary for {user.name}</h2>
        <p className="text-xl text-gray-500 dark:text-gray-400">{quarter}</p>
      </div>

      {isLoading ? <p className='text-center'>AI is generating your summary...</p> : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <h3 className="text-xl font-bold text-green-500 mb-2">Strengths Summary</h3>
            <p>{summary.strengths}</p>
          </Card>
           <Card>
            <h3 className="text-xl font-bold mb-2">Key Themes Radar</h3>
            <ResponsiveContainer width="100%" height={250}>
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={themeRadarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={30} domain={[0, 5]}/>
                    <Radar name={user.name} dataKey="A" stroke="#2563eb" fill="#2563eb" fillOpacity={0.6} />
                    <Tooltip />
                </RadarChart>
            </ResponsiveContainer>
          </Card>
          <Card className="lg:col-span-2">
             <h3 className="text-xl font-bold text-orange-500 mb-2">Growth Opportunities Summary</h3>
             <p>{summary.growth}</p>
          </Card>
          <Card>
             <h3 className="text-xl font-bold mb-2">Sentiment Analysis</h3>
             <ResponsiveContainer width="100%" height={250}>
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
                <LineChart data={vibeTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="quarter" />
                    <YAxis domain={[1, 5]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={2} name="Avg. Vibe Score" />
                </LineChart>
             </ResponsiveContainer>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SummaryView;