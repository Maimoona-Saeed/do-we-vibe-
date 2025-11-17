import React, { useState, useContext } from 'react';
import { User } from '../types';
import Card from './common/Card';
import Button from './common/Button';
import { AppContext } from '../App';
import { ArrowLeftIcon } from './common/icons';
import Toggle from './common/Toggle';

interface SettingsProps {
  user: User;
  onBack: () => void;
}

const Settings: React.FC<SettingsProps> = ({ user, onBack }) => {
  const context = useContext(AppContext);
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'notifications'>('profile');
  const [profile, setProfile] = useState(user.profile);
  const [preferences, setPreferences] = useState(user.preferences);
  const [notifications, setNotifications] = useState(user.notificationSettings);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };
  
  const handleSaveChanges = () => {
    if (context) {
        const updatedUser = { ...user, profile, preferences, notificationSettings: notifications };
        context.updateCurrentUser(updatedUser);
        alert("Changes saved!");
        onBack();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
       <Button onClick={onBack} variant="secondary">
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back
        </Button>
      <div>
        <h2 className="text-3xl font-bold">Settings</h2>
        <p className="text-gray-500 dark:text-gray-400">Manage your profile and preferences.</p>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('profile')}
            className={`${activeTab === 'profile' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`${activeTab === 'preferences' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Feedback Preferences
          </button>
           <button
            onClick={() => setActiveTab('notifications')}
            className={`${activeTab === 'notifications' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Notifications
          </button>
        </nav>
      </div>

      <Card>
        {activeTab === 'profile' && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
                <img src={user.avatar} alt={user.name} className="h-20 w-20 rounded-full" />
                <div>
                    <h3 className="text-2xl font-bold">{user.name}</h3>
                    <p className="text-gray-500">{user.email}</p>
                </div>
            </div>
            <div>
              <label htmlFor="bio" className="block text-sm font-medium mb-1">Bio</label>
              <textarea name="bio" id="bio" rows={3} value={profile.bio} onChange={handleProfileChange} className="w-full p-2 border rounded-lg bg-secondary dark:bg-dark-secondary dark:border-gray-600" />
            </div>
            <div>
              <label htmlFor="linkedin" className="block text-sm font-medium mb-1">LinkedIn URL</label>
              <input type="url" name="linkedin" id="linkedin" value={profile.linkedin} onChange={handleProfileChange} className="w-full p-2 border rounded-lg bg-secondary dark:bg-dark-secondary dark:border-gray-600" />
            </div>
             <div>
              <label htmlFor="github" className="block text-sm font-medium mb-1">GitHub URL</label>
              <input type="url" name="github" id="github" value={profile.github} onChange={handleProfileChange} className="w-full p-2 border rounded-lg bg-secondary dark:bg-dark-secondary dark:border-gray-600" />
            </div>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="space-y-6">
            <div>
                <h3 className="font-bold text-lg">Areas to receive feedback on</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Help peers give you relevant feedback. This will tailor AI suggestions for them.</p>
                <input type="text" value={preferences.receive.join(', ')} onChange={(e) => setPreferences({...preferences, receive: e.target.value.split(',').map(s => s.trim())})} className="w-full p-2 border rounded-lg bg-secondary dark:bg-dark-secondary dark:border-gray-600" placeholder="e.g., Communication, Leadership" />
            </div>
             <div>
                <h3 className="font-bold text-lg">Areas you prefer to give feedback on</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Let the AI know your strengths for peer suggestions.</p>
                <input type="text" value={preferences.give.join(', ')} onChange={(e) => setPreferences({...preferences, give: e.target.value.split(',').map(s => s.trim())})} className="w-full p-2 border rounded-lg bg-secondary dark:bg-dark-secondary dark:border-gray-600" placeholder="e.g., Code Review, Public Speaking" />
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
            <div className="space-y-4">
                 <div className="flex items-center justify-between p-3 rounded-lg">
                    <div>
                        <label className="font-medium">New Feedback Request</label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Send me an email when someone requests my feedback.</p>
                    </div>
                    <Toggle isEnabled={notifications.newRequestEmail} onToggle={() => setNotifications(p => ({...p, newRequestEmail: !p.newRequestEmail}))} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg">
                    <div>
                        <label className="font-medium">Feedback Submitted</label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Notify me when I receive new feedback from a peer.</p>
                    </div>
                    <Toggle isEnabled={notifications.feedbackSubmittedEmail} onToggle={() => setNotifications(p => ({...p, feedbackSubmittedEmail: !p.feedbackSubmittedEmail}))} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg">
                    <div>
                        <label className="font-medium">Weekly Summary</label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Send me a weekly digest of my feedback activity.</p>
                    </div>
                    <Toggle isEnabled={notifications.weeklySummaryEmail} onToggle={() => setNotifications(p => ({...p, weeklySummaryEmail: !p.weeklySummaryEmail}))} />
                </div>
            </div>
        )}
      </Card>
      
       <div className="flex justify-end">
          <Button onClick={handleSaveChanges} size="lg">Save Changes</Button>
        </div>
    </div>
  );
};

export default Settings;