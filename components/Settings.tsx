
import React from 'react';
import { UserSettings } from '../types';
import { Moon, Sun, Type, RotateCcw, Mail, Monitor, Smartphone, Volume2 } from 'lucide-react';

interface SettingsProps {
  settings: UserSettings;
  setSettings: (s: UserSettings) => void;
  onRestartOnboarding: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ settings, setSettings, onRestartOnboarding }) => {
  
  const toggleTheme = (theme: 'light' | 'dark') => {
    setSettings({ ...settings, theme });
  };

  const toggleFont = (size: 'normal' | 'large') => {
    setSettings({ ...settings, fontSize: size });
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in duration-500 pb-20">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Settings</h2>
        <p className="text-slate-500 dark:text-slate-400">Customize your KitchenSync experience.</p>
      </div>

      <div className="space-y-6">
        {/* Appearance */}
        <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <h3 className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
              <Monitor size={18} /> Appearance
            </h3>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-800 dark:text-white">Theme</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Choose your preferred visual style</p>
              </div>
              <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
                <button 
                  onClick={() => toggleTheme('light')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${settings.theme === 'light' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                >
                  <Sun size={16} /> Light
                </button>
                <button 
                  onClick={() => toggleTheme('dark')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${settings.theme === 'dark' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                >
                  <Moon size={16} /> Dark
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-6">
              <div>
                <p className="font-medium text-slate-800 dark:text-white">Font Size</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Adjust text size for better readability</p>
              </div>
              <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
                <button 
                  onClick={() => toggleFont('normal')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${settings.fontSize === 'normal' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                >
                  <span className="text-xs">A</span> Normal
                </button>
                <button 
                  onClick={() => toggleFont('large')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${settings.fontSize === 'large' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                >
                  <span className="text-lg">A</span> Large
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Preferences */}
        <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
           <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <h3 className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
              <Smartphone size={18} /> Preferences
            </h3>
          </div>
          <div className="p-6">
             <div className="flex items-center justify-between">
                <div>
                   <p className="font-medium text-slate-800 dark:text-white">Smart Inventory Decay</p>
                   <p className="text-sm text-slate-500 dark:text-slate-400">Automatically reduce stock based on usage history</p>
                </div>
                <button 
                   onClick={() => setSettings({...settings, smartDecay: !settings.smartDecay})}
                   className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.smartDecay ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                >
                   <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${settings.smartDecay ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </button>
             </div>
          </div>
        </section>

        {/* Support */}
        <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
           <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <h3 className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
              <Volume2 size={18} /> Help & Support
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <button 
               onClick={onRestartOnboarding}
               className="w-full text-left p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 transition-colors flex items-center gap-3 text-slate-700 dark:text-slate-200"
            >
               <div className="bg-white dark:bg-slate-600 p-2 rounded-full text-indigo-600 dark:text-indigo-400">
                  <RotateCcw size={20} />
               </div>
               <div>
                  <p className="font-bold">Replay Walkthrough</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">View the onboarding tutorial again.</p>
               </div>
            </button>

            <a 
               href="mailto:daskoon@gmail.com?subject=KitchenSync Support Request"
               className="w-full text-left p-4 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 transition-colors flex items-center gap-3 text-indigo-800 dark:text-indigo-200"
            >
               <div className="bg-indigo-100 dark:bg-indigo-800 p-2 rounded-full text-indigo-600 dark:text-indigo-300">
                  <Mail size={20} />
               </div>
               <div>
                  <p className="font-bold">Contact Developer</p>
                  <p className="text-xs text-indigo-600/80 dark:text-indigo-400/80">Send feedback or report bugs directly.</p>
               </div>
            </a>
          </div>
        </section>

        <div className="text-center text-xs text-slate-400 mt-8">
           <p>KitchenSync v1.0.0</p>
           <p>&copy; 2025 KitchenSync Inc.</p>
        </div>
      </div>
    </div>
  );
};
