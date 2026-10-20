import React from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  Moon,
  Sun,
  Globe,
  Mic,
  Box,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { CatMascot } from './CatMascot';
import { formatMonthYear } from '../utils/formatters';
import { ActiveTab } from '../types';

interface HeaderProps {
  currentMonthKey: string;
  onMonthChange: (monthKey: string) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  language: 'en' | 'hi';
  onToggleLanguage: () => void;
  canInstallPWA: boolean;
  onInstallPWA: () => void;
  onOpenVoiceAssistant?: () => void;
  onNavigateTab?: (tab: ActiveTab) => void;
  activeTab?: ActiveTab;
}

export const Header: React.FC<HeaderProps> = ({
  currentMonthKey,
  onMonthChange,
  darkMode,
  onToggleDarkMode,
  language,
  onToggleLanguage,
  canInstallPWA,
  onInstallPWA,
  onOpenVoiceAssistant,
  onNavigateTab,
  activeTab,
}) => {
  // Navigation between months
  const handlePrevMonth = () => {
    const [year, month] = currentMonthKey.split('-').map(Number);
    const prevDate = new Date(year, month - 2, 1);
    const newKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
    onMonthChange(newKey);
  };

  const handleNextMonth = () => {
    const [year, month] = currentMonthKey.split('-').map(Number);
    const nextDate = new Date(year, month, 1);
    const newKey = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`;
    onMonthChange(newKey);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 dark:bg-[#141311]/90 backdrop-blur-md border-b border-amber-900/10 dark:border-amber-500/20 shadow-xs">
      {/* Top Banner */}
      <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between">
        {/* Brand & Mascot */}
        <div className="flex items-center gap-3">
          <CatMascot size={42} showGlow={true} />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-bold tracking-wider font-cinzel text-zinc-900 dark:text-amber-100 flex items-center gap-1.5">
                <span>ABHISHEK</span>
                <span className="text-[#D4AF37]">RENT APP</span>
              </h1>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 dark:bg-amber-400/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
              AVHII RENT • Abhishek Ranjan
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* AI Voice Companion Button */}
          {onOpenVoiceAssistant && (
            <button
              onClick={onOpenVoiceAssistant}
              title={language === 'hi' ? 'रॉयल वॉइस असिस्टेंट खोलें' : 'Open Royal Voice Assistant'}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-bold text-xs shadow-md shadow-amber-500/25 hover:brightness-110 active:scale-95 transition-all border border-amber-300"
            >
              <Mic className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-cinzel tracking-wide">
                {language === 'hi' ? 'वॉइस साथी' : 'AI VOICE'}
              </span>
            </button>
          )}

          {/* 3D Studio Quick Toggle */}
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('3d-studio')}
              title={language === 'hi' ? '3D स्टूडियो खोलें' : '3D Studio'}
              className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                activeTab === '3d-studio'
                  ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/30'
                  : 'bg-amber-500/10 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 hover:bg-amber-500/20'
              }`}
            >
              <Box className="w-4 h-4" />
              <span className="hidden md:inline text-[11px]">3D</span>
            </button>
          )}

          {/* Maps Discovery Quick Toggle */}
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('maps')}
              title={language === 'hi' ? 'मैप्स सुविधाएं खोजें' : 'Nearby Maps'}
              className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                activeTab === 'maps'
                  ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/30'
                  : 'bg-amber-500/10 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 hover:bg-amber-500/20'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span className="hidden md:inline text-[11px]">Maps</span>
            </button>
          )}

          {/* PWA Install Quick Button */}
          {canInstallPWA && (
            <button
              onClick={onInstallPWA}
              title="Install App"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-sm hover:brightness-110 active:scale-95 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install App</span>
            </button>
          )}

          {/* Language Toggle */}
          <button
            onClick={onToggleLanguage}
            title={language === 'en' ? 'Switch to Hindi' : 'Switch to English'}
            className="p-2 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 hover:bg-amber-500/20 transition-all flex items-center gap-1 text-xs font-bold"
          >
            <Globe className="w-4 h-4" />
            <span className="text-[11px]">{language === 'en' ? 'EN' : 'HI'}</span>
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={onToggleDarkMode}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 hover:bg-amber-500/20 transition-all"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-amber-700" />}
          </button>
        </div>
      </div>

      {/* Month Navigator Sub-bar */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-amber-500/10 dark:from-amber-950/30 dark:via-zinc-900/50 dark:to-amber-950/30 border-t border-amber-900/5 dark:border-amber-500/10 py-1.5 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              title="Previous Month"
              className="p-1 rounded-lg hover:bg-amber-500/20 active:scale-90 transition-all text-zinc-700 dark:text-zinc-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-white/70 dark:bg-zinc-800/70 border border-amber-500/20 shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-amber-200">
                {formatMonthYear(currentMonthKey, language)}
              </span>
            </div>

            <button
              onClick={handleNextMonth}
              title="Next Month"
              className="p-1 rounded-lg hover:bg-amber-500/20 active:scale-90 transition-all text-zinc-700 dark:text-zinc-300"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Month Picker Dropdown */}
          <div className="flex items-center gap-2">
            <input
              type="month"
              value={currentMonthKey}
              onChange={(e) => e.target.value && onMonthChange(e.target.value)}
              className="text-xs px-2.5 py-1 rounded-lg bg-white/80 dark:bg-zinc-800/80 border border-amber-500/30 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer font-medium"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
