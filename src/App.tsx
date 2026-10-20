import React, { useState, useEffect } from 'react';
import {
  ActiveTab,
  AppProfile,
  ElectricityRecord,
  ExpenseRecord,
  FinalSettlement,
  ReceiptRecord,
  RentRecord,
  RationItem,
  RationReceiptRecord,
} from './types';
import { StorageService } from './services/storage';
import { getCurrentMonthKey } from './utils/formatters';

import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { QuickAddModal } from './components/QuickAddModal';
import { DashboardView } from './components/DashboardView';
import { RentView } from './components/RentView';
import { ElectricityView } from './components/ElectricityView';
import { ExpensesView } from './components/ExpensesView';
import { RationExpensesView } from './components/RationExpensesView';
import { SettlementView } from './components/SettlementView';
import { ReceiptView } from './components/ReceiptView';
import { HistoryView } from './components/HistoryView';
import { SettingsView } from './components/SettingsView';
import { ThreeStudioView } from './components/ThreeStudioView';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { MapsDiscoveryView } from './components/MapsDiscoveryView';
import { Mic, Sparkles } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [currentMonthKey, setCurrentMonthKey] = useState<string>(getCurrentMonthKey());
  const [profile, setProfile] = useState<AppProfile>(StorageService.getProfile());
  const [rents, setRents] = useState<RentRecord[]>([]);
  const [electricity, setElectricity] = useState<ElectricityRecord[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [rationItems, setRationItems] = useState<RationItem[]>([]);
  const [rationReceipts, setRationReceipts] = useState<RationReceiptRecord[]>([]);
  const [settlements, setSettlements] = useState<FinalSettlement[]>([]);
  const [receipts, setReceipts] = useState<ReceiptRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modal State
  const [quickAddOpen, setQuickAddOpen] = useState<boolean>(false);
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState<boolean>(false);

  // Theme & Language
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');

  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstallPWA, setCanInstallPWA] = useState<boolean>(false);

  // Initialize data on mount
  useEffect(() => {
    async function loadData() {
      try {
        const prof = StorageService.getProfile();
        setProfile(prof);
        setLanguage(prof.language || 'en');
        const isDark = prof.theme === 'dark' || (prof.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        setDarkMode(isDark);
        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }

        const [rData, elData, expData, sData, recData, ratData, ratRecData] = await Promise.all([
          StorageService.getRents(),
          StorageService.getElectricity(),
          StorageService.getExpenses(),
          StorageService.getSettlements(),
          StorageService.getReceipts(),
          StorageService.getRationItems(),
          StorageService.getRationReceipts(),
        ]);

        setRents(rData);
        setElectricity(elData);
        setExpenses(expData);
        setSettlements(sData);
        setReceipts(recData);
        setRationItems(ratData);
        setRationReceipts(ratRecData);
      } catch (e) {
        console.error('Error loading initial state:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();

    // Listen for PWA beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstallPWA(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Sync dark mode class
  const handleToggleDarkMode = () => {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    const updatedProf: AppProfile = {
      ...profile,
      theme: nextDark ? 'dark' : 'light',
    };
    setProfile(updatedProf);
    StorageService.saveProfile(updatedProf);
  };

  // Toggle Language
  const handleToggleLanguage = () => {
    const nextLang = language === 'en' ? 'hi' : 'en';
    setLanguage(nextLang);
    const updatedProf: AppProfile = {
      ...profile,
      language: nextLang,
    };
    setProfile(updatedProf);
    StorageService.saveProfile(updatedProf);
  };

  // PWA Install Trigger
  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setCanInstallPWA(false);
        setDeferredPrompt(null);
      }
    } else {
      // Explain how to install on home screen
      alert(
        'To install AVHII RENT APP on Android, open your browser menu (⋮) and tap "Install app" or "Add to Home screen".'
      );
    }
  };

  // Profile Save
  const handleUpdateProfile = (newProfile: AppProfile) => {
    setProfile(newProfile);
    StorageService.saveProfile(newProfile);
  };

  // Rent CRUD
  const handleSaveRent = async (record: RentRecord) => {
    const existingIdx = rents.findIndex((r) => r.id === record.id || r.monthKey === record.monthKey);
    let updated: RentRecord[];
    if (existingIdx >= 0) {
      updated = [...rents];
      updated[existingIdx] = record;
    } else {
      updated = [record, ...rents];
    }
    setRents(updated);
    await StorageService.saveRents(updated);
  };

  const handleDeleteRent = async (id: string) => {
    const updated = rents.filter((r) => r.id !== id);
    setRents(updated);
    await StorageService.saveRents(updated);
  };

  // Electricity CRUD
  const handleSaveElectricity = async (record: ElectricityRecord) => {
    const existingIdx = electricity.findIndex((e) => e.id === record.id || e.monthKey === record.monthKey);
    let updated: ElectricityRecord[];
    if (existingIdx >= 0) {
      updated = [...electricity];
      updated[existingIdx] = record;
    } else {
      updated = [record, ...electricity];
    }
    setElectricity(updated);
    await StorageService.saveElectricity(updated);
  };

  const handleDeleteElectricity = async (id: string) => {
    const updated = electricity.filter((e) => e.id !== id);
    setElectricity(updated);
    await StorageService.saveElectricity(updated);
  };

  // Expense CRUD
  const handleSaveExpense = async (expense: ExpenseRecord) => {
    const existingIdx = expenses.findIndex((e) => e.id === expense.id);
    let updated: ExpenseRecord[];
    if (existingIdx >= 0) {
      updated = [...expenses];
      updated[existingIdx] = expense;
    } else {
      updated = [expense, ...expenses];
    }
    setExpenses(updated);
    await StorageService.saveExpenses(updated);
  };

  const handleDeleteExpense = async (id: string) => {
    const updated = expenses.filter((e) => e.id !== id);
    setExpenses(updated);
    await StorageService.saveExpenses(updated);
  };

  // Settlement CRUD
  const handleSaveSettlement = async (settlement: FinalSettlement) => {
    const existingIdx = settlements.findIndex((s) => s.id === settlement.id || s.monthKey === settlement.monthKey);
    let updated: FinalSettlement[];
    if (existingIdx >= 0) {
      updated = [...settlements];
      updated[existingIdx] = settlement;
    } else {
      updated = [settlement, ...settlements];
    }
    setSettlements(updated);
    await StorageService.saveSettlements(updated);

    // Also sync the Rent payment status for this month!
    const rIdx = rents.findIndex((r) => r.monthKey === settlement.monthKey);
    if (rIdx >= 0) {
      const updatedRents = [...rents];
      updatedRents[rIdx] = {
        ...updatedRents[rIdx],
        amountPaid: settlement.amountPaid,
        paymentStatus: settlement.remainingBalance === 0 ? 'Paid' : settlement.amountPaid > 0 ? 'Partial' : 'Pending',
        paymentDate: settlement.paymentDate,
        paymentMethod: settlement.paymentMethod,
        transactionRef: settlement.transactionRef,
      };
      setRents(updatedRents);
      await StorageService.saveRents(updatedRents);
    }
  };

  // Receipt Save
  const handleSaveReceipt = async (receipt: ReceiptRecord) => {
    const existingIdx = receipts.findIndex((rc) => rc.id === receipt.id || rc.receiptNumber === receipt.receiptNumber);
    let updated: ReceiptRecord[];
    if (existingIdx >= 0) {
      updated = [...receipts];
      updated[existingIdx] = receipt;
    } else {
      updated = [receipt, ...receipts];
    }
    setReceipts(updated);
    await StorageService.saveReceipts(updated);
  };

  // Ration CRUD
  const handleSaveRationItem = async (item: RationItem) => {
    const existingIdx = rationItems.findIndex((r) => r.id === item.id);
    let updated: RationItem[];
    if (existingIdx >= 0) {
      updated = [...rationItems];
      updated[existingIdx] = item;
    } else {
      updated = [item, ...rationItems];
    }
    setRationItems(updated);
    await StorageService.saveRationItems(updated);
  };

  const handleDeleteRationItem = async (id: string) => {
    const updated = rationItems.filter((r) => r.id !== id);
    setRationItems(updated);
    await StorageService.saveRationItems(updated);
  };

  const handleSaveRationReceipt = async (receipt: RationReceiptRecord) => {
    const existingIdx = rationReceipts.findIndex((r) => r.id === receipt.id || r.receiptNumber === receipt.receiptNumber);
    let updated: RationReceiptRecord[];
    if (existingIdx >= 0) {
      updated = [...rationReceipts];
      updated[existingIdx] = receipt;
    } else {
      updated = [receipt, ...rationReceipts];
    }
    setRationReceipts(updated);
    await StorageService.saveRationReceipts(updated);
  };

  // Reset to Demo
  const handleResetData = async () => {
    setIsLoading(true);
    await StorageService.resetToDemo();
    const [rData, elData, expData, sData, recData, ratData, ratRecData] = await Promise.all([
      StorageService.getRents(),
      StorageService.getElectricity(),
      StorageService.getExpenses(),
      StorageService.getSettlements(),
      StorageService.getReceipts(),
      StorageService.getRationItems(),
      StorageService.getRationReceipts(),
    ]);
    setRents(rData);
    setElectricity(elData);
    setExpenses(expData);
    setSettlements(sData);
    setReceipts(recData);
    setRationItems(ratData);
    setRationReceipts(ratRecData);
    setIsLoading(false);
  };

  // Clear all data
  const handleClearData = async () => {
    setIsLoading(true);
    await StorageService.clearAllData();
    setRents([]);
    setElectricity([]);
    setExpenses([]);
    setSettlements([]);
    setReceipts([]);
    setRationItems([]);
    setRationReceipts([]);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5] dark:bg-[#121210]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <h2 className="text-lg font-bold font-cinzel text-zinc-800 dark:text-amber-100">
            AVHII RENT APP
          </h2>
          <p className="text-xs text-zinc-500">Loading secure records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#121210] text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Sticky Header */}
      <Header
        currentMonthKey={currentMonthKey}
        onMonthChange={setCurrentMonthKey}
        darkMode={darkMode}
        onToggleDarkMode={handleToggleDarkMode}
        language={language}
        onToggleLanguage={handleToggleLanguage}
        canInstallPWA={canInstallPWA}
        onInstallPWA={handleInstallPWA}
        onOpenVoiceAssistant={() => setIsVoiceAssistantOpen(true)}
        onNavigateTab={setActiveTab}
        activeTab={activeTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto">
        {activeTab === 'dashboard' && (
          <DashboardView
            currentMonthKey={currentMonthKey}
            rents={rents}
            electricity={electricity}
            expenses={expenses}
            onNavigate={setActiveTab}
            onOpenQuickAdd={(type) => {
              if (type) setActiveTab(type === 'rent' ? 'rent' : type === 'electricity' ? 'electricity' : 'expenses');
              else setQuickAddOpen(true);
            }}
            onOpenVoiceAssistant={() => setIsVoiceAssistantOpen(true)}
            language={language}
          />
        )}

        {activeTab === '3d-studio' && (
          <ThreeStudioView language={language} />
        )}

        {activeTab === 'maps' && (
          <MapsDiscoveryView profile={profile} language={language} />
        )}

        {activeTab === 'rent' && (
          <RentView
            currentMonthKey={currentMonthKey}
            rents={rents}
            onSaveRent={handleSaveRent}
            onDeleteRent={handleDeleteRent}
            profile={profile}
            language={language}
          />
        )}

        {activeTab === 'electricity' && (
          <ElectricityView
            currentMonthKey={currentMonthKey}
            electricity={electricity}
            onSaveElectricity={handleSaveElectricity}
            onDeleteElectricity={handleDeleteElectricity}
            defaultRate={profile.defaultElectricityRate || 7}
            language={language}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpensesView
            currentMonthKey={currentMonthKey}
            expenses={expenses}
            onSaveExpense={handleSaveExpense}
            onDeleteExpense={handleDeleteExpense}
            language={language}
          />
        )}

        {activeTab === 'ration' && (
          <RationExpensesView
            currentMonthKey={currentMonthKey}
            rationItems={rationItems}
            rationReceipts={rationReceipts}
            onSaveRationItem={handleSaveRationItem}
            onDeleteRationItem={handleDeleteRationItem}
            onSaveRationReceipt={handleSaveRationReceipt}
            onUpdateProfile={handleUpdateProfile}
            profile={profile}
            language={language}
          />
        )}

        {activeTab === 'settlement' && (
          <SettlementView
            currentMonthKey={currentMonthKey}
            onMonthChange={setCurrentMonthKey}
            rents={rents}
            electricity={electricity}
            settlements={settlements}
            onSaveSettlement={handleSaveSettlement}
            onNavigate={setActiveTab}
            language={language}
          />
        )}

        {activeTab === 'receipt' && (
          <ReceiptView
            currentMonthKey={currentMonthKey}
            rents={rents}
            electricity={electricity}
            settlements={settlements}
            receipts={receipts}
            onSaveReceipt={handleSaveReceipt}
            onNavigate={setActiveTab}
            profile={profile}
            language={language}
          />
        )}

        {activeTab === 'history' && (
          <HistoryView
            rents={rents}
            electricity={electricity}
            expenses={expenses}
            receipts={receipts}
            rationItems={rationItems}
            rationReceipts={rationReceipts}
            onSelectMonth={setCurrentMonthKey}
            onNavigate={setActiveTab}
            language={language}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            canInstallPWA={canInstallPWA}
            onInstallPWA={handleInstallPWA}
            onResetData={handleResetData}
            onClearData={handleClearData}
            darkMode={darkMode}
            onToggleDarkMode={handleToggleDarkMode}
            language={language}
            onToggleLanguage={handleToggleLanguage}
          />
        )}
      </main>

      {/* Floating AI Voice Conversation Launcher (Available across all tabs) */}
      <button
        onClick={() => setIsVoiceAssistantOpen(true)}
        title={language === 'hi' ? 'रॉयल वॉइस असिस्टेंट से बात करें' : 'Talk with Gemini Live Voice'}
        className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-zinc-950 font-bold text-xs shadow-xl shadow-amber-500/30 hover:scale-105 active:scale-95 transition-all border border-amber-300 group no-print"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        <div className="flex items-center gap-1.5">
          <Mic className="w-4 h-4 text-zinc-950 group-hover:rotate-12 transition-transform" />
          <span className="font-cinzel tracking-wider text-[11px] sm:text-xs font-black">
            {language === 'hi' ? 'वॉइस बातचीत' : 'AI VOICE'}
          </span>
          <Sparkles className="w-3.5 h-3.5 text-zinc-950" />
        </div>
      </button>

      {/* Royal Voice Assistant Modal */}
      <VoiceAssistantModal
        isOpen={isVoiceAssistantOpen}
        onClose={() => setIsVoiceAssistantOpen(false)}
        language={language}
        activeTab={activeTab}
        onNavigateTab={setActiveTab}
      />

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        onSelectAction={setActiveTab}
        language={language}
      />

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenQuickAdd={() => setQuickAddOpen(true)}
        language={language}
      />
    </div>
  );
}
