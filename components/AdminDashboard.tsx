import React, { useState, useEffect, useCallback, useContext } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import Card from './common/Card';
import Button from './common/Button';
import { geminiService } from '../services/geminiService';
import { WandIcon, ArrowDownTrayIcon } from './common/icons';
import { User, Feedback, FeedbackRequest, FeedbackStatus } from '../types';
import { AppContext } from '../App';

const quarters = ['Q3 2024', 'Q4 2024'];

const WordCloud = ({ words }: { words: string[] }) => {
    const sizes = ['text-lg', 'text-xl', 'text-2xl', 'text-3xl'];
    const colors = ['text-brand-500', 'text-blue-500', 'text-purple-500', 'text-pink-500'];
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

interface AdminDashboardProps {
    onMandateRequest: (employee: User, reviewers: User[]) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onMandateRequest }) => {
    const context = useContext(AppContext);
    const [selectedQuarter, setSelectedQuarter] = useState(quarters[quarters.length - 1]);
    const [advice, setAdvice] = useState('');
    const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);
    
    const [mandateEmployee, setMandateEmployee] = useState<string>('');
    const [mandateReviewers, setMandateReviewers] = useState<string[]>([]);

    const [dashboardData, setDashboardData] = useState<any>({
        participationData: [],
        vibeScoreData: [],
        topThemes: [],
    });

    const calculateDashboardData = useCallback((quarter: string, users: User[], requests: FeedbackRequest[], feedback: Feedback[]) => {
        // Participation Rate
        const departments = [...new Set(users.map(u => u.department))];
        const participationData = departments.map(dept => {
            const usersInDept = users.filter(u => u.department === dept);
            const reviewerIdsInDept = new Set(feedback
                .filter(f => {
                    const req = requests.find(r => r.id === f.requestId);
                    return f.reviewer && f.reviewer.department === dept && req?.quarter === quarter;
                })
                .map(f => f.reviewer!.id));
            const rate = usersInDept.length > 0 ? (reviewerIdsInDept.size / usersInDept.length) * 100 : 0;
            return { name: dept, rate: Math.round(rate) };
        });

        // Vibe Score
        const vibeScoreData = quarters.map(q => {
            const feedbackInQuarter = feedback.filter(f => requests.find(r => r.id === f.requestId)?.quarter === q);
            const avgScore = feedbackInQuarter.length > 0
                ? feedbackInQuarter.reduce((acc, f) => acc + f.vibeRating, 0) / feedbackInQuarter.length
                : 0;
            return { name: q, score: parseFloat(avgScore.toFixed(2)) };
        });

        // Themes
        const feedbackForThemeAnalysis = feedback.filter(f => requests.find(r => r.id === f.requestId)?.quarter === quarter);
        geminiService.getFeedbackThemes(feedbackForThemeAnalysis).then(themes => {
             setDashboardData(prev => ({ ...prev, topThemes: themes }));
        });

        return { participationData, vibeScoreData, topThemes: dashboardData.topThemes };
    }, [dashboardData.topThemes]);

    useEffect(() => {
        if (context) {
            const data = calculateDashboardData(selectedQuarter, context.users, context.feedbackRequests, context.feedbackData);
            setDashboardData(data);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedQuarter, context]);


    const fetchAdvice = useCallback(async () => {
        if (!dashboardData.participationData.length) return;
        setIsLoadingAdvice(true);
        const metrics = {
            quarter: selectedQuarter,
            participation: dashboardData.participationData,
            vibeScores: dashboardData.vibeScoreData,
            themes: dashboardData.topThemes,
        };
        const result = await geminiService.getAdminAdvice(metrics);
        setAdvice(result);
        setIsLoadingAdvice(false);
    }, [dashboardData, selectedQuarter]);
    
    useEffect(() => {
        fetchAdvice();
    }, [fetchAdvice]);

    const handleMandateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!context) return;
        const employee = context.users.find(u => u.id === parseInt(mandateEmployee));
        const reviewers = context.users.filter(u => mandateReviewers.includes(u.id.toString()));
        if (employee && reviewers.length > 0) {
            onMandateRequest(employee, reviewers);
            setMandateEmployee('');
            setMandateReviewers([]);
        } else {
            alert("Please select a valid employee and at least one reviewer.");
        }
    };

    const handleExport = () => {
        const headers = ["Metric", "Department/Quarter", "Value"];
        const rows = [
            ...dashboardData.participationData.map((d: any) => ["Participation Rate", d.name, `${d.rate}%`]),
            ...dashboardData.vibeScoreData.map((d: any) => ["Avg Vibe Score", d.name, d.score]),
            ["Top Themes", "", dashboardData.topThemes.join(", ")],
            ["AI Advice", "", `"${advice.replace(/"/g, '""')}"`]
        ];
        
        let csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n" 
            + rows.map(e => e.join(",")).join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `feedback_report_${selectedQuarter}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    if (!context) return null;
    const { users } = context;

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex gap-4">
                <Button onClick={() => alert("This would trigger a notification for all employees to start the peer review cycle.")}>
                    Trigger Q4 Review Cycle
                </Button>
                <Button variant="secondary" onClick={handleExport}>
                    <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                    Export Report
                </Button>
            </div>
            <div className="flex items-center">
                <label htmlFor="quarter-select" className="text-sm font-medium mr-2">Viewing Data For:</label>
                <select
                    id="quarter-select"
                    value={selectedQuarter}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedQuarter(e.target.value)}
                    className="p-2 border rounded-lg bg-secondary dark:bg-dark-secondary dark:border-gray-600 focus:ring-2 focus:ring-brand-500"
                >
                    {quarters.map(q => <option key={q} value={q}>{q}</option>)}
                </select>
            </div>
        </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <Card>
          <h3 className="text-xl font-bold mb-4">Participation Rate</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dashboardData.participationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis unit="%" />
              <Tooltip />
              <Bar dataKey="rate" fill="#2563eb" name="Participation Rate" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        
        <Card>
          <h3 className="text-xl font-bold mb-4">Vibe Score Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dashboardData.vibeScoreData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[3, 5]} />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#2563eb" name="Avg. Vibe Score" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="text-xl font-bold mb-4">Top Themes</h3>
          <WordCloud words={dashboardData.topThemes} />
        </Card>

        <Card className="xl:col-span-2 flex flex-col">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <WandIcon className="h-6 w-6 text-brand-500" />
              AI Advisor
          </h3>
          <div className="flex-grow p-4 bg-secondary dark:bg-dark-secondary rounded-lg space-y-4 prose prose-sm dark:prose-invert min-h-[200px] flex flex-col">
              <div className="flex-grow">
                {isLoadingAdvice ? <p>Generating insights for {selectedQuarter}...</p> : 
                    <div dangerouslySetInnerHTML={{ __html: advice.replace(/\n/g, '<br />') }} />
                }
              </div>
               <div className="flex gap-2 pt-2 border-t border-gray-300 dark:border-gray-600">
                  <input type="text" placeholder={`Ask a follow-up about ${selectedQuarter}...`} className="w-full p-2 border rounded-lg bg-primary dark:bg-dark-primary dark:border-gray-600 focus:ring-2 focus:ring-brand-500" />
                  <Button onClick={fetchAdvice} disabled={isLoadingAdvice}>
                    {isLoadingAdvice ? '...' : 'Ask'}
                  </Button>
               </div>
          </div>
        </Card>

        <Card>
            <h3 className="text-xl font-bold mb-4">Mandate Feedback</h3>
            <form onSubmit={handleMandateSubmit} className="space-y-4">
                <div>
                    <label htmlFor="mandate-employee" className="block text-sm font-medium mb-1">Select Employee</label>
                    <select id="mandate-employee" value={mandateEmployee} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setMandateEmployee(e.target.value)} className="w-full p-2 border rounded-lg bg-secondary dark:bg-dark-secondary dark:border-gray-600">
                        <option value="">Select an employee...</option>
                        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="mandate-reviewers" className="block text-sm font-medium mb-1">Request Feedback From</label>
                    <select multiple value={mandateReviewers} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setMandateReviewers(Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value))} className="w-full h-32 p-2 border rounded-lg bg-secondary dark:bg-dark-secondary dark:border-gray-600">
                        {users.filter(u => u.id !== parseInt(mandateEmployee)).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                </div>
                <Button type="submit" className="w-full" disabled={!mandateEmployee || mandateReviewers.length === 0}>
                    Create Request
                </Button>
            </form>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;