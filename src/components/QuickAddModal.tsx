import React from 'react';
import {
  X,
  Building,
  Zap,
  ShoppingBag,
  DollarSign,
  Receipt,
  Scale,
  Plus,
} from 'lucide-react';
import { ActiveTab } from '../types';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (tab: ActiveTab) => void;
  language: 'en' | 'hi';
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  onSelectAction,
  language,
}) => {
  if (!isOpen) return null;

  const actions = [
    {
      tab: 'rent' as ActiveTab,
      title: language === 'hi' ? 'कमरे का किराया दर्ज करें' : 'Record Room Rent',
      desc: language === 'hi' ? 'किराया, भुगतान और मकान मालिक विवरण' : 'Enter monthly rent, paid status & due date',
      icon: Building,
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
    },
    {
      tab: 'electricity' as ActiveTab,
      title: language === 'hi' ? 'बिजली मीटर रीडिंग दर्ज करें' : 'Log Electricity Meter Reading',
      desc: language === 'hi' ? 'रीडिंग दर्ज करें (₹7 प्रति यूनिट स्वतः गणना)' : 'Record readings (Auto ₹7/unit calculation)',
      icon: Zap,
      color: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/30',
    },
    {
      tab: 'ration' as ActiveTab,
      title: language === 'hi' ? 'घर का राशन / दैनिक खर्च जोड़ें' : 'Add Monthly House Ration Item',
      desc: language === 'hi' ? 'आटा, तेल, चावल, दाल, मसाले व घरेलू सामान' : 'Flour, oil, rice, pulses, spices & kitchen ration',
      icon: ShoppingBag,
      color: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30',
    },
    {
      tab: 'expenses' as ActiveTab,
      title: language === 'hi' ? 'व्यक्तिगत खर्च जोड़ें' : 'Add Personal Expense',
      desc: language === 'hi' ? 'यात्रा, मोबाइल, मेंटेनेंस व अन्य खर्च' : 'Transport, recharge, maintenance & bills',
      icon: DollarSign,
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    },
    {
      tab: 'settlement' as ActiveTab,
      title: language === 'hi' ? 'अंतिम मासिक हिसाब करें' : 'Calculate Final Settlement',
      desc: language === 'hi' ? 'किराया + बिजली + बकाया का समाधान' : 'Reconcile total room rent + power bills',
      icon: Scale,
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
    },
    {
      tab: 'receipt' as ActiveTab,
      title: language === 'hi' ? 'रसीद व विवरणी बनाएं' : 'Generate Receipts & Statements',
      desc: language === 'hi' ? 'मकान मालिक रसीद या घर के राशन का बिल' : 'Landlord Rent or Monthly House Ration Statement',
      icon: Receipt,
      color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
    },
  ];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md bg-[#FAF8F5] dark:bg-[#181714] rounded-t-3xl sm:rounded-3xl border border-amber-500/40 shadow-2xl p-6 space-y-4 max-h-[85vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500 text-black">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-cinzel text-zinc-900 dark:text-amber-100">
                {language === 'hi' ? 'नया रिकॉर्ड जोड़ें' : 'Add New Entry'}
              </h3>
              <p className="text-[11px] text-zinc-500">
                {language === 'hi' ? 'अपनी जरूरत अनुसार विकल्प चुनें' : 'Select what you want to record'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        <div className="space-y-2.5">
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.tab}
                onClick={() => {
                  onSelectAction(act.tab);
                  onClose();
                }}
                className="w-full p-3.5 rounded-2xl bg-white dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800 hover:border-amber-500/50 flex items-center gap-3.5 text-left transition-all hover:scale-[1.01] active:scale-98 shadow-2xs"
              >
                <div className={`p-2.5 rounded-2xl border ${act.color} shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {act.title}
                  </p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {act.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
