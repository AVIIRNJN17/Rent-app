import React from 'react';
import {
  Home,
  Building,
  Zap,
  ShoppingBag,
  Receipt,
  History,
  Settings,
  Plus,
  Scale,
  Box,
  MapPin,
} from 'lucide-react';
import { ActiveTab } from '../types';

interface BottomNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenQuickAdd: () => void;
  language: 'en' | 'hi';
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  onOpenQuickAdd,
  language,
}) => {
  const tabs = [
    {
      id: 'dashboard' as ActiveTab,
      label: language === 'hi' ? 'होम' : 'Home',
      icon: Home,
    },
    {
      id: 'rent' as ActiveTab,
      label: language === 'hi' ? 'किराया' : 'Rent',
      icon: Building,
    },
    {
      id: 'electricity' as ActiveTab,
      label: language === 'hi' ? 'बिजली' : 'Power',
      icon: Zap,
    },
    {
      id: 'ration' as ActiveTab,
      label: language === 'hi' ? 'राशन' : 'Ration',
      icon: ShoppingBag,
    },
    {
      id: '3d-studio' as ActiveTab,
      label: '3D Studio',
      icon: Box,
    },
    {
      id: 'maps' as ActiveTab,
      label: language === 'hi' ? 'मैप्स' : 'Maps',
      icon: MapPin,
    },
    {
      id: 'settlement' as ActiveTab,
      label: language === 'hi' ? 'हिसाब' : 'Settle',
      icon: Scale,
    },
    {
      id: 'receipt' as ActiveTab,
      label: language === 'hi' ? 'रसीद' : 'Receipt',
      icon: Receipt,
    },
    {
      id: 'history' as ActiveTab,
      label: language === 'hi' ? 'इतिहास' : 'History',
      icon: History,
    },
    {
      id: 'settings' as ActiveTab,
      label: language === 'hi' ? 'सेटिंग्स' : 'Settings',
      icon: Settings,
    },
  ];

  return (
    <>
      {/* Floating Action Button (FAB) for Quick Add */}
      <div className="fixed bottom-20 right-4 sm:bottom-22 sm:right-6 z-40 no-print">
        <button
          onClick={onOpenQuickAdd}
          aria-label="Add New Entry"
          className="group flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-zinc-950 font-bold shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-105 active:scale-95 transition-all duration-200 border border-amber-200/50"
        >
          <div className="p-0.5 rounded-full bg-zinc-950/20 group-hover:rotate-90 transition-transform">
            <Plus className="w-5 h-5 text-zinc-950" />
          </div>
          <span className="text-sm tracking-wide font-cinzel font-bold">
            {language === 'hi' ? 'जोड़ें' : '+ ADD'}
          </span>
        </button>
      </div>

      {/* Modern Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[#FAF8F5]/95 dark:bg-[#151412]/95 backdrop-blur-lg border-t border-amber-900/10 dark:border-amber-500/20 px-2 py-1 shadow-2xl no-print">
        <div className="max-w-3xl mx-auto flex items-center justify-between sm:justify-around overflow-x-auto no-scrollbar gap-1 px-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all relative ${
                  isActive
                    ? 'text-amber-600 dark:text-amber-400 font-bold scale-105'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                {isActive && (
                  <span className="absolute -top-1 w-6 h-1 rounded-full bg-amber-500 dark:bg-amber-400 shadow-sm shadow-amber-500" />
                )}
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                <span className="text-[10px] mt-0.5 tracking-tight font-medium">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
