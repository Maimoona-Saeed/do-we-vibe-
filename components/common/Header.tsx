import React, { useContext } from 'react';
import { AppContext } from '../../App';
import type { User } from '../../types';
import Toggle from './Toggle';
import { SunIcon, MoonIcon, VibeCodeIcon } from './icons';

interface HeaderProps {
  currentUser: User;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentUser, onLogout }) => {
  const context = useContext(AppContext);

  if (!context) {
    return null;
  }

  const { theme, toggleTheme } = context;

  return (
    <header className="bg-card dark:bg-dark-card shadow-sm p-4 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <VibeCodeIcon className="h-8 w-8 text-indigo-500" />
        <h1 className="text-xl font-bold text-card-foreground dark:text-dark-card_foreground hidden sm:block">Quarterly Peer Review</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
           <SunIcon className="h-6 w-6 text-yellow-500"/>
           <Toggle isEnabled={theme === 'dark'} onToggle={toggleTheme} />
           <MoonIcon className="h-6 w-6 text-slate-400"/>
        </div>
         <div className="flex items-center gap-3">
          <img src={currentUser.avatar} alt={currentUser.name} className="h-10 w-10 rounded-full" />
          <div className='hidden md:block'>
            <p className="font-semibold text-card-foreground dark:text-dark-card_foreground">{currentUser.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{currentUser.role}</p>
          </div>
        </div>
        <button onClick={onLogout} className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm font-medium">
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;