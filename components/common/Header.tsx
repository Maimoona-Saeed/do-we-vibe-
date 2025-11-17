import React, { useContext, useState, useRef, useEffect } from 'react';
import { AppContext } from '../../App';
import type { User, View } from '../../types';
import Toggle from './Toggle';
import { SunIcon, MoonIcon, VibeCodeIcon } from './icons';

interface HeaderProps {
  onLogout: () => void;
  navigateTo: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ onLogout, navigateTo }) => {
  const context = useContext(AppContext);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!context || !context.currentUser) {
    return null;
  }

  const { theme, toggleTheme, currentUser } = context;

  return (
    <header className="bg-card dark:bg-dark-card shadow-sm p-4 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <VibeCodeIcon className="h-8 w-8 text-brand-600" />
        <h1 className="text-xl font-bold text-card-foreground dark:text-dark-card_foreground hidden sm:block">Acme Peer Feedback</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
           <SunIcon className="h-6 w-6 text-yellow-500"/>
           <Toggle isEnabled={theme === 'dark'} onToggle={toggleTheme} />
           <MoonIcon className="h-6 w-6 text-slate-400"/>
        </div>
        <div className="relative" ref={dropdownRef}>
          <button onClick={() => setDropdownOpen(!isDropdownOpen)} className="flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 rounded-full">
            <img src={currentUser.avatar} alt={currentUser.name} className="h-10 w-10 rounded-full" />
            <div className='hidden md:block text-left'>
              <p className="font-semibold text-card-foreground dark:text-dark-card_foreground">{currentUser.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{currentUser.role}</p>
            </div>
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-popover dark:bg-dark-popover rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5">
              <button
                onClick={() => {
                  navigateTo({ type: 'settings' });
                  setDropdownOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-popover-foreground dark:text-dark-popover_foreground hover:bg-secondary dark:hover:bg-dark-secondary"
              >
                Settings
              </button>
              <button
                onClick={() => {
                  onLogout();
                  setDropdownOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-secondary dark:hover:bg-dark-secondary"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;