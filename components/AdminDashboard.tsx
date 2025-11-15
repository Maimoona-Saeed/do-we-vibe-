import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import Card from './common/Card';
import Button from './common/Button';
import { geminiService } from '../services/geminiService';
import { WandIcon } from './common/icons';

const adminDashboardData = {
  'Q4 2024': {
    participationData: [
      { name: 'Engineering', rate: 90 },
      { name: 'Product', rate: 85 },
      { name: 'Design', rate: 70 },
      { name: 'Marketing', rate: 95 },
    ],
    vibeScoreData: [
      { name: 'Q1 2024', score: 4.2 },
      { name: 'Q2 2024', score: 4.5 },
      { name: 'Q3 2024', score: 4.4 },
      { name: 'Q4 2024', score: 4.6 },
    ],
    topThemes: ['collaboration', 'communication', 'leadership', 'innovation', 'mentorship', 'project management'],
  },
  'Q3 2024': {
    participationData: [
      { name: 'Engineering', rate: 88 },
      { name: 'Product', rate: 92 },
      { name: 'Design', rate: 65 },
      { name: 'Marketing', rate: 90 },
    ],
    vibeScoreData: [
      { name: 'Q1 2024', score: 4.2 },
      { name: 'Q2 2024', score: 4.5 },
      { name: 'Q3 2024', score: 4.4 },
    ],
    topThemes: ['leadership', 'communication', 'deadlines', 'cross-functional', 'documentation'],
  },
};

const quarters = Object.keys(adminDashboardData);

const WordCloud = ({ words }: { words: string[] }) => {
    const sizes = ['text-lg', 'text-xl', 'text-2xl', 'text-3xl'];
    const colors = ['text-indigo-500', 'text-blue-500', 'text-purple-500', 'text-pink-500'];
    return (
        <div className="flex flex-wrap items-center justify-center gap-4 p-4 min-h-[100px]">
            {words.map((word, index) => (
                <span key={index} className={`${sizes[index % sizes.length]} ${colors[index % colors.length]} font-bold`}>
                    {word}
                </span>
            ))}
        </div>
    );
};


const AdminDashboard: React.FC = () => {
    const [selectedQuarter, setSelectedQuarter] = useState<keyof typeof adminDashboardData>('Q4 2024');
    const [advice, setAdvice] = useState('');
    const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);

    const currentData = adminDashboardData[selectedQuarter];

    const fetchAdvice = useCallback(async () => {
        setIsLoadingAdvice(true);
        const metrics = {
            participation: currentData.participationData,
            vibeScores: currentData.vibeScoreData,
            themes: currentData.topThemes,
        };
        const result = await geminiService.getAdminAdvice(metrics);
        setAdvice(result);
        setIsLoadingAdvice(false);
    }, [currentData]);

    useEffect(() => {
        fetchAdvice();
    }, [fetchAdvice]);

  return (
    <div className="space-y-6">
       <div className="flex justify-end items-center">
            <label htmlFor="quarter-select" className="text-sm font-medium mr-2">Viewing Data For:</label>
            <select
                id="quarter-select"
                value={selectedQuarter}
                onChange={(e) => setSelectedQuarter(e.target.value as keyof typeof adminDashboardData)}
                className="p-2 border rounded-lg bg-secondary dark:bg-dark-secondary dark:border-gray-600 focus:ring-2 focus:ring-indigo-500"
            >
                {quarters.map(q => <option key={q} value={q}>{q}</option>)}
            </select>
        </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-xl font-bold mb-4">Participation Rate by Department</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={currentData.participationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis unit="%" />
              <Tooltip />
              <Legend />
              <Bar dataKey="rate" fill="#4f46e5" name="Participation Rate" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        
        <Card>
          <h3 className="text-xl font-bold mb-4">Average Vibe Score Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={currentData.vibeScoreData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[3, 5]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="score" stroke="#4f46e5" name="Avg. Vibe Score" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="text-xl font-bold mb-4">Top Themes this Quarter</h3>
          <WordCloud words={currentData.topThemes} />
        </Card>

        <Card className="flex flex-col">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <WandIcon className="h-6 w-6 text-indigo-500" />
              AI Advisor
          </h3>
          <div className="flex-grow p-4 bg-secondary dark:bg-dark-secondary rounded-lg space-y-4 prose prose-sm dark:prose-invert min-h-[150px]">
              {isLoadingAdvice ? <p>Generating insights for {selectedQuarter}...</p> : 
                  advice.split('\n').map((line, i) => <p key={i}>{line}</p>)}
          </div>
          <Button onClick={fetchAdvice} disabled={isLoadingAdvice} className="mt-4 self-start">
            {isLoadingAdvice ? 'Regenerating...' : 'Regenerate Advice'}
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
