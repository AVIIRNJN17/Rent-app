import React, { useState } from 'react';
import {
  Settings,
  Download,
  Smartphone,
  Upload,
  Database,
  Trash2,
  RefreshCw,
  User,
  Shield,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Code2,
  Copy,
  Check,
  Moon,
  Sun,
  Globe,
} from 'lucide-react';
import { AppProfile } from '../types';
import { StorageService } from '../services/storage';
import { CatMascot } from './CatMascot';

interface SettingsViewProps {
  profile: AppProfile;
  onUpdateProfile: (profile: AppProfile) => void;
  canInstallPWA: boolean;
  onInstallPWA: () => void;
  onResetData: () => void;
  onClearData: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  language: 'en' | 'hi';
  onToggleLanguage: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  onUpdateProfile,
  canInstallPWA,
  onInstallPWA,
  onResetData,
  onClearData,
  darkMode,
  onToggleDarkMode,
  language,
  onToggleLanguage,
}) => {
  const [formData, setFormData] = useState<AppProfile>(profile);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleExportBackup = async () => {
    const jsonStr = await StorageService.exportBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AVHII_RENT_BACKUP_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const text = ev.target?.result as string;
        const ok = await StorageService.importBackup(text);
        if (ok) {
          alert('Backup restored successfully! The page will now refresh.');
          window.location.reload();
        } else {
          alert('Failed to import backup. Please ensure the file is a valid JSON backup.');
        }
      };
      reader.readAsText(file);
    }
  };

  const capacitorCommands = `npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "AVHII RENT APP" "com.abhishekranjan.avhiirent" --web-dir dist
npm run build
npx cap add android
npx cap open android`;

  const copyCapacitorCommands = () => {
    navigator.clipboard.writeText(capacitorCommands);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto px-4 pt-4">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Settings className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-cinzel text-zinc-900 dark:text-amber-100">
              App Settings & Installation
            </h2>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Install PWA on Android, configure defaults, export backup, and Android APK guide
          </p>
        </div>

        <CatMascot size={46} showGlow={true} />
      </div>

      {/* PWA Download & Android Installation Card */}
      <div className="rounded-3xl p-6 bg-gradient-to-br from-amber-500/15 via-amber-400/5 to-transparent dark:from-[#211E18] dark:to-[#171613] border-2 border-amber-500/40 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-md">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                Progressive Web App (PWA) & Mobile App
              </span>
              <h3 className="text-lg font-black font-cinzel text-zinc-900 dark:text-amber-100">
                DOWNLOAD AVHII RENT APP
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                Install directly on your Android phone home-screen with offline support
              </p>
            </div>
          </div>

          <div>
            <button
              onClick={onInstallPWA}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-black font-black text-xs shadow-lg shadow-amber-500/30 hover:brightness-110 active:scale-95 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>{canInstallPWA ? 'INSTALL AVHII RENT APP' : 'INSTALL ON HOME SCREEN'}</span>
            </button>
          </div>
        </div>

        {/* Instructions for installing on Android and iOS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-amber-500/20 text-xs">
          <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-zinc-900/80 border border-amber-500/20">
            <p className="font-bold text-zinc-900 dark:text-zinc-100 mb-1">
              📱 Android Chrome Instructions:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-zinc-600 dark:text-zinc-400 text-[11px]">
              <li>Tap the three dots <strong>⋮ (Menu)</strong> in top-right of Chrome.</li>
              <li>Select <strong>&quot;Install app&quot;</strong> or <strong>&quot;Add to Home screen&quot;</strong>.</li>
              <li>Launch from your Android app drawer with the Golden Cat icon!</li>
            </ol>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-zinc-900/80 border border-amber-500/20">
            <p className="font-bold text-zinc-900 dark:text-zinc-100 mb-1">
              🍎 iOS Safari Instructions:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-zinc-600 dark:text-zinc-400 text-[11px]">
              <li>Tap the <strong>Share</strong> button (box with upward arrow).</li>
              <li>Scroll down and tap <strong>&quot;Add to Home Screen&quot;</strong>.</li>
              <li>Enjoy full-screen offline experience without browser bars.</li>
            </ol>
          </div>
        </div>

        {/* Android Native APK Build Process (Capacitor Guide) */}
        <div className="mt-4 p-4 rounded-2xl bg-zinc-900 text-zinc-200 border border-amber-500/30 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold font-cinzel text-amber-400 flex items-center gap-1.5">
              <Code2 className="w-4 h-4" />
              <span>Build Native Android APK with Capacitor</span>
            </span>
            <button
              onClick={copyCapacitorCommands}
              className="flex items-center gap-1 text-[11px] text-amber-300 bg-zinc-800 px-2.5 py-1 rounded-lg hover:bg-zinc-700 transition-all"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copied!' : 'Copy Commands'}</span>
            </button>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            This repository is structured for native compilation. Run these terminal commands locally to package an Android `.apk` or `.aab` for the Google Play Store:
          </p>
          <pre className="p-2.5 rounded-xl bg-black font-mono text-[11px] text-amber-300 overflow-x-auto">
            {capacitorCommands}
          </pre>
        </div>
      </div>

      {/* Tenancy & Defaults Profile Settings */}
      <div className="rounded-3xl p-6 bg-white dark:bg-[#1A1916] border border-amber-500/20 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-bold tracking-wider font-cinzel text-zinc-900 dark:text-amber-200 uppercase">
              Tenant & Landlord Default Profile
            </h3>
          </div>
          {saveSuccess && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Defaults Saved!</span>
            </span>
          )}
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Tenant Name (You)
              </label>
              <input
                type="text"
                required
                value={formData.tenantName}
                onChange={(e) => setFormData({ ...formData, tenantName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-amber-500/30 bg-white dark:bg-zinc-900 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Landlord Name
              </label>
              <input
                type="text"
                required
                value={formData.landlordName}
                onChange={(e) => setFormData({ ...formData, landlordName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-amber-500/30 bg-white dark:bg-zinc-900 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Landlord WhatsApp / Mobile
              </label>
              <input
                type="tel"
                value={formData.landlordMobile}
                onChange={(e) => setFormData({ ...formData, landlordMobile: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-amber-500/30 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Rented Room / Property Address
              </label>
              <input
                type="text"
                required
                value={formData.roomAddress}
                onChange={(e) => setFormData({ ...formData, roomAddress: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-amber-500/30 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Default Monthly Room Rent (₹)
              </label>
              <input
                type="number"
                min="0"
                value={formData.defaultRent}
                onChange={(e) => setFormData({ ...formData, defaultRent: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-amber-500/30 bg-white dark:bg-zinc-900 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Default Electricity Rate (₹/unit)
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                value={formData.defaultElectricityRate}
                onChange={(e) =>
                  setFormData({ ...formData, defaultElectricityRate: Number(e.target.value) })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-amber-500/30 bg-white dark:bg-zinc-900 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-xs shadow-md shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all"
            >
              Save Profile Defaults
            </button>
          </div>
        </form>
      </div>

      {/* Backup & Persistence Management */}
      <div className="rounded-3xl p-6 bg-white dark:bg-[#1A1916] border border-amber-500/20 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <Database className="w-5 h-5 text-amber-500" />
          <h3 className="text-sm font-bold tracking-wider font-cinzel text-zinc-900 dark:text-amber-200 uppercase">
            Data Storage & Backup
          </h3>
        </div>

        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          All your rents, meter readings, expense receipts, and generated landlord statements are securely stored locally via <strong>IndexedDB</strong> in your browser and device.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* Export Backup */}
          <button
            onClick={handleExportBackup}
            className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 hover:border-amber-500 text-xs font-bold text-zinc-800 dark:text-zinc-200 transition-all"
          >
            <Download className="w-4 h-4 text-amber-500" />
            <span>Export Full JSON Backup</span>
          </button>

          {/* Import Backup */}
          <div>
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              id="import-backup-input"
              className="hidden"
            />
            <label
              htmlFor="import-backup-input"
              className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 hover:border-amber-500 text-xs font-bold text-zinc-800 dark:text-zinc-200 transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4 text-emerald-500" />
              <span>Import / Restore Backup</span>
            </label>
          </div>
        </div>

        {/* Demo Data Management */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <button
            onClick={onResetData}
            className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 text-xs font-bold hover:bg-amber-500/20 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset to Abhishek Sample Data</span>
          </button>

          <button
            onClick={() => setConfirmClearOpen(true)}
            className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-bold hover:bg-rose-500/20 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear All Data</span>
          </button>
        </div>
      </div>

      {/* App Tribute & Credits */}
      <div className="text-center py-6 text-xs text-zinc-500 dark:text-zinc-400 space-y-1">
        <CatMascot size={40} showGlow={false} className="mx-auto mb-2 opacity-60" />
        <p className="font-bold text-zinc-800 dark:text-zinc-200 font-cinzel">
          AVHII RENT APP • Version 1.0.0
        </p>
        <p>
          Conceived & Developed for <strong>Abhishek Ranjan</strong>
        </p>
        <p className="text-[10px] text-zinc-400">
          Mobile-First Progressive Web Application with Fixed Rate ₹7/unit Electricity Engine
        </p>
      </div>

      {/* Clear Confirmation Modal */}
      {confirmClearOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-[#181714] rounded-3xl p-6 border border-rose-500/40 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-500">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Clear All Application Data?
              </h3>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              This will remove all rents, readings, receipts, and personal expenses. You can always restore later if you exported a backup.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmClearOpen(false)}
                className="px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onClearData();
                  setConfirmClearOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-all"
              >
                Yes, Clear Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
