import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  Calendar,
  Store,
  Camera,
  X,
  Save,
  Download,
  Share2,
  Printer,
  MessageSquare,
  Receipt,
  FileCheck,
  CheckCircle2,
  Package,
  Layers,
  UtensilsCrossed,
  Droplet,
  Flame,
  Coffee,
  Sparkles,
  Info,
  ChevronDown,
  Target,
  PiggyBank,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Percent,
  SlidersHorizontal,
  Wallet,
  Check,
} from 'lucide-react';
import {
  AppProfile,
  PaymentMethod,
  RationCategory,
  RationItem,
  RationReceiptRecord,
} from '../types';
import { StorageService } from '../services/storage';
import {
  formatINR,
  formatMonthYear,
  formatDate,
  getTodayDate,
  numberToWordsINR,
  generateRationWhatsAppMessage,
} from '../utils/formatters';
import { generateReceiptPDF, downloadBlob } from '../utils/pdfGenerator';
import { CatMascot } from './CatMascot';

interface RationExpensesViewProps {
  currentMonthKey: string;
  rationItems: RationItem[];
  rationReceipts: RationReceiptRecord[];
  onSaveRationItem: (item: RationItem) => void;
  onDeleteRationItem: (id: string) => void;
  onSaveRationReceipt: (receipt: RationReceiptRecord) => void;
  onUpdateProfile?: (profile: AppProfile) => void;
  profile: AppProfile;
  language: 'en' | 'hi';
}

const RATION_CATEGORIES: Array<{
  name: RationCategory;
  icon: React.ElementType;
  color: string;
}> = [
  { name: 'Flour & Grains', icon: Package, color: 'text-amber-600 bg-amber-500/10 border-amber-500/30' },
  { name: 'Oils & Ghee', icon: Droplet, color: 'text-yellow-600 bg-yellow-500/10 border-yellow-500/30' },
  { name: 'Pulses & Dal', icon: Layers, color: 'text-orange-600 bg-orange-500/10 border-orange-500/30' },
  { name: 'Spices & Masala', icon: Flame, color: 'text-red-600 bg-red-500/10 border-red-500/30' },
  { name: 'Dairy & Milk', icon: Coffee, color: 'text-blue-600 bg-blue-500/10 border-blue-500/30' },
  { name: 'Fresh Vegetables', icon: UtensilsCrossed, color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/30' },
  { name: 'Snacks & Beverages', icon: Coffee, color: 'text-purple-600 bg-purple-500/10 border-purple-500/30' },
  { name: 'Cleaning & Household', icon: Sparkles, color: 'text-teal-600 bg-teal-500/10 border-teal-500/30' },
  { name: 'Personal Care', icon: ShoppingBag, color: 'text-pink-600 bg-pink-500/10 border-pink-500/30' },
  { name: 'Other Ration', icon: Package, color: 'text-zinc-600 bg-zinc-500/10 border-zinc-500/30' },
];

export const RationExpensesView: React.FC<RationExpensesViewProps> = ({
  currentMonthKey,
  rationItems,
  rationReceipts,
  onSaveRationItem,
  onDeleteRationItem,
  onSaveRationReceipt,
  onUpdateProfile,
  profile,
  language,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [viewingPhoto, setViewingPhoto] = useState<string | null>(null);

  // Budget State
  const currentBudget = profile.monthlyRationBudgets?.[currentMonthKey] || profile.defaultRationBudget || 5000;
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState<number>(currentBudget);
  const [applyAsDefault, setApplyAsDefault] = useState<boolean>(true);

  useEffect(() => {
    setBudgetInput(currentBudget);
  }, [currentBudget, currentMonthKey]);

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const newBudget = Number(budgetInput);
    if (isNaN(newBudget) || newBudget <= 0) {
      alert('Please enter a valid monthly budget amount (minimum ₹100).');
      return;
    }
    const updatedProfile: AppProfile = {
      ...profile,
      defaultRationBudget: applyAsDefault ? newBudget : (profile.defaultRationBudget || 5000),
      monthlyRationBudgets: {
        ...(profile.monthlyRationBudgets || {}),
        [currentMonthKey]: newBudget,
      },
    };
    if (onUpdateProfile) {
      onUpdateProfile(updatedProfile);
    } else {
      StorageService.saveProfile(updatedProfile);
    }
    setIsEditingBudget(false);
  };

  // Form State
  const [formData, setFormData] = useState<RationItem>({
    id: `rat-${Date.now()}`,
    itemName: '',
    category: 'Flour & Grains',
    quantity: '1 kg',
    pricePerUnit: 0,
    totalAmount: 0,
    date: getTodayDate(),
    monthKey: currentMonthKey,
    storeName: 'D-Mart Supermarket',
    paymentMethod: 'UPI',
    notes: '',
    billPhoto: '',
    createdAt: new Date().toISOString(),
  });

  const handleOpenAdd = (existing?: RationItem) => {
    if (existing) {
      setFormData(existing);
    } else {
      setFormData({
        id: `rat-${Date.now()}`,
        itemName: '',
        category: 'Flour & Grains',
        quantity: '1 unit',
        pricePerUnit: 0,
        totalAmount: 0,
        date: getTodayDate(),
        monthKey: currentMonthKey,
        storeName: 'D-Mart Supermarket',
        paymentMethod: 'UPI',
        notes: '',
        billPhoto: '',
        createdAt: new Date().toISOString(),
      });
    }
    setIsEditing(true);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, billPhoto: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.itemName || formData.totalAmount <= 0) {
      alert('Please enter an item name and valid amount.');
      return;
    }

    const monthKey = formData.date.slice(0, 7);
    onSaveRationItem({
      ...formData,
      totalAmount: Number(formData.totalAmount),
      pricePerUnit: formData.pricePerUnit ? Number(formData.pricePerUnit) : undefined,
      monthKey,
    });
    setIsEditing(false);
  };

  // Month-filtered items
  const monthItems = rationItems.filter((item) => item.monthKey === currentMonthKey);

  // Search and Category filtered items
  const filteredItems = monthItems.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.itemName.toLowerCase().includes(q);
      const matchStore = item.storeName?.toLowerCase().includes(q);
      const matchNotes = item.notes?.toLowerCase().includes(q);
      if (!matchName && !matchStore && !matchNotes) return false;
    }
    return true;
  });

  // Sort by date descending
  filteredItems.sort((a, b) => (b.date > a.date ? 1 : -1));

  // Calculations for this month's ration
  const totalRationMonthAmount = monthItems.reduce((acc, curr) => acc + curr.totalAmount, 0);

  // Budget progress calculations
  const progressRatio = currentBudget > 0 ? totalRationMonthAmount / currentBudget : 0;
  const progressPercentage = Math.round(progressRatio * 100);
  const cappedPercentage = Math.min(100, Math.max(0, progressPercentage));
  const remainingBudget = Math.max(0, currentBudget - totalRationMonthAmount);
  const isOverBudget = totalRationMonthAmount > currentBudget;
  const overAmount = totalRationMonthAmount - currentBudget;

  // Month days & spending pace calculation
  const [yearStr, monthStr] = currentMonthKey.split('-');
  const yearNum = parseInt(yearStr || '2026', 10);
  const monthNum = parseInt(monthStr || '10', 10);
  const totalDaysInMonth = new Date(yearNum, monthNum, 0).getDate();
  const now = new Date();
  const isCurrentCalendarMonth = now.getFullYear() === yearNum && (now.getMonth() + 1) === monthNum;
  const currentDay = isCurrentCalendarMonth ? now.getDate() : totalDaysInMonth;
  const daysRemaining = Math.max(1, totalDaysInMonth - currentDay);
  const safeDailySpend = remainingBudget > 0 ? Math.round(remainingBudget / daysRemaining) : 0;
  const currentDailyAvg = currentDay > 0 ? Math.round(totalRationMonthAmount / currentDay) : 0;

  // Category breakdown
  const categoryBreakdown: Record<string, number> = {};
  monthItems.forEach((item) => {
    categoryBreakdown[item.category] = (categoryBreakdown[item.category] || 0) + item.totalAmount;
  });

  // Unique receipt number for house ration
  const receiptNumber = `HRE-${currentMonthKey.replace('-', '')}-001`;

  // 1. Download PDF of Monthly House Ration
  const handleDownloadRationPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const fakeReceiptRecord: any = {
        receiptNumber,
        monthKey: currentMonthKey,
      };
      const res = await generateReceiptPDF('a4-ration-receipt-document', fakeReceiptRecord);
      if (res.success && res.blob) {
        downloadBlob(res.blob, `HOUSE_RATION_STATEMENT_${currentMonthKey}.pdf`);
      }
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // 2. Share via WhatsApp
  const handleShareWhatsApp = () => {
    const text = generateRationWhatsAppMessage({
      householdName: `${profile.tenantName} Household`,
      monthName: formatMonthYear(currentMonthKey, language),
      totalItems: monthItems.length,
      totalAmount: totalRationMonthAmount,
      categoryBreakdown,
    });
    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  // 3. Native Android Share
  const handleAndroidShare = async () => {
    const text = generateRationWhatsAppMessage({
      householdName: `${profile.tenantName} Household`,
      monthName: formatMonthYear(currentMonthKey, language),
      totalItems: monthItems.length,
      totalAmount: totalRationMonthAmount,
      categoryBreakdown,
    });

    if (navigator.share) {
      try {
        await navigator.share({
          title: `House Ration Statement - ${formatMonthYear(currentMonthKey, language)}`,
          text,
        });
      } catch {
        // ignore
      }
    } else {
      navigator.clipboard.writeText(text);
      alert('Ration statement text copied to clipboard!');
    }
  };

  // 4. Print
  const handlePrint = () => {
    window.print();
  };

  // 5. Save Receipt to Archive
  const handleSaveReceiptRecord = () => {
    const record: RationReceiptRecord = {
      id: `ratrec-${currentMonthKey}`,
      receiptNumber,
      monthKey: currentMonthKey,
      generatedDate: getTodayDate(),
      householdName: `${profile.tenantName} Household`,
      totalItems: monthItems.length,
      totalAmount: totalRationMonthAmount,
      items: monthItems,
      categorySummary: categoryBreakdown,
      notes: 'Independent monthly house ration statement',
    };
    onSaveRationReceipt(record);
    alert('Ration Statement successfully archived in History!');
  };

  return (
    <div className="space-y-6 pb-24 max-w-5xl mx-auto px-4 pt-4">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-cinzel text-zinc-900 dark:text-amber-100">
              Monthly House Ration & Daily Expenses
            </h2>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
              Independent of Room Rent
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {formatMonthYear(currentMonthKey, language)} • Grocery, Food & Household
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowReceiptModal(true)}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-zinc-800 text-amber-200 border border-amber-500/30 font-bold text-xs hover:bg-zinc-700 active:scale-95 transition-all"
          >
            <Receipt className="w-4 h-4" />
            <span>Generate Ration Receipt</span>
          </button>

          <button
            onClick={() => handleOpenAdd()}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-xs shadow-md shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Ration Item</span>
          </button>
        </div>
      </div>

      {/* Info Callout for Independence */}
      <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2.5 text-xs text-amber-900 dark:text-amber-200">
        <Info className="w-4 h-4 text-amber-600 shrink-0" />
        <p>
          <strong>Notice:</strong> This house ration expense log is maintained strictly separate from landlord room rent calculations, and creates its own independent monthly statement for future household accounting and verification.
        </p>
      </div>

      {/* Monthly Ration Budget & Goal Progress Card */}
      <div className="rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-amber-500/15 via-amber-400/5 to-transparent dark:from-[#221E17] dark:to-[#171613] border-2 border-amber-500/35 shadow-xl space-y-4">
        {/* Top Header of Budget */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-black shadow-md shadow-amber-500/20 shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base sm:text-lg font-black font-cinzel text-zinc-900 dark:text-amber-100">
                  {language === 'hi' ? 'मासिक राशन बजट एवं लक्ष्य' : 'Monthly Ration Budget'}
                </h3>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shadow-2xs flex items-center gap-1 ${
                    isOverBudget
                      ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
                      : progressPercentage >= 80
                      ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
                      : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                  }`}
                >
                  {isOverBudget ? (
                    <>
                      <AlertTriangle className="w-3 h-3" />
                      <span>{language === 'hi' ? 'बजट सीमा पार' : 'Budget Exceeded'}</span>
                    </>
                  ) : progressPercentage >= 80 ? (
                    <>
                      <TrendingUp className="w-3 h-3" />
                      <span>{language === 'hi' ? 'सीमा के करीब' : 'Approaching Limit'}</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3 h-3" />
                      <span>{language === 'hi' ? 'नियंत्रण में' : 'On Track'}</span>
                    </>
                  )}
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Target Budget: <strong className="text-zinc-800 dark:text-zinc-200">{formatINR(currentBudget)}</strong> for {formatMonthYear(currentMonthKey, language)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setBudgetInput(currentBudget);
                setIsEditingBudget(true);
              }}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-xs shadow-md shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all w-full sm:w-fit"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'बजट सेट करें' : 'Set Monthly Budget'}</span>
            </button>
          </div>
        </div>

        {/* Progress Bar Container */}
        <div className="space-y-2 pt-1 bg-white/50 dark:bg-zinc-900/40 p-4 rounded-2xl border border-amber-500/20">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <span className="font-mono text-sm font-black text-amber-700 dark:text-amber-400">{progressPercentage}%</span>
              <span>{language === 'hi' ? 'खर्च हुआ' : 'Utilized'}</span>
              <span className="text-[11px] text-zinc-400 font-normal">({formatINR(totalRationMonthAmount)} of {formatINR(currentBudget)})</span>
            </span>
            <span
              className={`font-mono text-xs font-extrabold px-2 py-0.5 rounded-lg ${
                isOverBudget
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
              }`}
            >
              {isOverBudget
                ? `+${formatINR(overAmount)} Over Budget`
                : `${formatINR(remainingBudget)} Remaining`}
            </span>
          </div>

          {/* Actual Visual Progress Bar */}
          <div className="w-full h-5 rounded-full bg-zinc-200/90 dark:bg-zinc-800 p-1 overflow-hidden relative shadow-inner">
            <div
              style={{ width: `${cappedPercentage}%` }}
              className={`h-full rounded-full transition-all duration-700 relative shadow-sm ${
                isOverBudget
                  ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-red-600 animate-pulse'
                  : progressPercentage >= 80
                  ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500'
                  : 'bg-gradient-to-r from-emerald-500 via-emerald-400 to-amber-400'
              }`}
            >
              {/* Shimmer light effect */}
              <div className="absolute inset-0 bg-white/20 rounded-full animate-[pulse_2s_infinite]" />
            </div>
          </div>

          {/* Milestone markers */}
          <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono pt-0.5">
            <span className="flex items-center gap-0.5">₹0 <span className="text-[9px] text-zinc-400">(0%)</span></span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span className="font-bold text-amber-700 dark:text-amber-300">Goal ({formatINR(currentBudget)})</span>
          </div>
        </div>

        {/* 4 Metric Summary Boxes */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          {/* Box 1: Budget Goal */}
          <div
            onClick={() => {
              setBudgetInput(currentBudget);
              setIsEditingBudget(true);
            }}
            className="p-3 sm:p-3.5 rounded-2xl bg-white/80 dark:bg-zinc-900/80 border border-amber-500/20 shadow-2xs hover:border-amber-500 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                Monthly Goal
              </span>
              <Edit2 className="w-3 h-3 text-amber-500 opacity-60 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-base sm:text-lg font-black font-cinzel text-zinc-900 dark:text-zinc-100 mt-0.5">
              {formatINR(currentBudget)}
            </p>
            <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold truncate">
              Click to customize
            </p>
          </div>

          {/* Box 2: Total Spent */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-white/80 dark:bg-zinc-900/80 border border-amber-500/20 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
              Total Spent
            </span>
            <p className="text-base sm:text-lg font-black font-cinzel text-zinc-900 dark:text-zinc-100 mt-0.5">
              {formatINR(totalRationMonthAmount)}
            </p>
            <p className="text-[10px] text-zinc-500 truncate">
              {monthItems.length} items logged
            </p>
          </div>

          {/* Box 3: Remaining / Over Budget */}
          <div
            className={`p-3 sm:p-3.5 rounded-2xl border shadow-2xs ${
              isOverBudget
                ? 'bg-rose-500/10 dark:bg-rose-950/20 border-rose-500/30'
                : 'bg-emerald-500/10 dark:bg-emerald-950/20 border-emerald-500/30'
            }`}
          >
            <span
              className={`text-[10px] uppercase font-bold tracking-wider truncate block ${
                isOverBudget ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'
              }`}
            >
              {isOverBudget ? 'Over Budget' : 'Safe to Spend'}
            </span>
            <p
              className={`text-base sm:text-lg font-black font-cinzel mt-0.5 truncate ${
                isOverBudget ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-300'
              }`}
            >
              {isOverBudget ? `+${formatINR(overAmount)}` : formatINR(remainingBudget)}
            </p>
            <p className="text-[10px] text-zinc-500 truncate">
              {isOverBudget ? 'Exceeded limit' : `${Math.max(0, 100 - cappedPercentage)}% left`}
            </p>
          </div>

          {/* Box 4: Spending Pace */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-white/80 dark:bg-zinc-900/80 border border-amber-500/20 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
              {isOverBudget ? 'Daily Average' : 'Safe Daily Pace'}
            </span>
            <p className="text-base sm:text-lg font-black font-cinzel text-zinc-900 dark:text-zinc-100 mt-0.5">
              {isOverBudget ? `${formatINR(currentDailyAvg)}/day` : `${formatINR(safeDailySpend)}/day`}
            </p>
            <p className="text-[10px] text-zinc-500 truncate">
              {isOverBudget ? `${currentDay} days spent` : `${daysRemaining} days left in month`}
            </p>
          </div>
        </div>

        {/* Quick Budget Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
          <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
            <Wallet className="w-3 h-3 text-amber-500" />
            Quick Presets:
          </span>
          {[3000, 5000, 7500, 10000, 15000].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => {
                const updatedProfile: AppProfile = {
                  ...profile,
                  defaultRationBudget: preset,
                  monthlyRationBudgets: {
                    ...(profile.monthlyRationBudgets || {}),
                    [currentMonthKey]: preset,
                  },
                };
                if (onUpdateProfile) {
                  onUpdateProfile(updatedProfile);
                } else {
                  StorageService.saveProfile(updatedProfile);
                }
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold font-mono transition-all border ${
                currentBudget === preset
                  ? 'bg-amber-500 text-black border-amber-600 font-black shadow-xs'
                  : 'bg-white/80 dark:bg-zinc-900/80 border-amber-500/20 text-zinc-700 dark:text-zinc-300 hover:border-amber-500'
              }`}
            >
              {formatINR(preset)}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setBudgetInput(currentBudget);
              setIsEditingBudget(true);
            }}
            className="text-[11px] font-bold text-amber-700 dark:text-amber-400 hover:underline ml-1"
          >
            Custom...
          </button>
        </div>
      </div>

      {/* Monthly Summary Card */}
      <div className="rounded-3xl p-6 bg-white dark:bg-[#1A1916] border border-amber-500/30 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#D4AF37]">
              House Ration Total For
            </span>
            <h3 className="text-2xl sm:text-3xl font-black font-cinzel text-zinc-900 dark:text-amber-100 mt-0.5">
              {formatMonthYear(currentMonthKey, language)}
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Household: <strong className="text-zinc-800 dark:text-zinc-200">{profile.tenantName}</strong>
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/30 text-right">
              <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold uppercase block">
                Total Month Outflow
              </span>
              <p className="text-2xl font-black font-cinzel text-zinc-900 dark:text-zinc-100">
                {formatINR(totalRationMonthAmount)}
              </p>
              <span className="text-[10px] text-zinc-500">{monthItems.length} items logged</span>
            </div>
          </div>
        </div>

        {/* Category breakdown pill list */}
        <div className="pt-4">
          <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide block mb-2">
            Category Breakdown ({formatMonthYear(currentMonthKey, language)})
          </span>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 border transition-all ${
                selectedCategory === 'all'
                  ? 'bg-amber-500 text-black border-amber-500'
                  : 'bg-zinc-50 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
              }`}
            >
              All Ration ({monthItems.length})
            </button>

            {RATION_CATEGORIES.map((cat) => {
              const amount = categoryBreakdown[cat.name] || 0;
              const isSelected = selectedCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 border transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-amber-500 text-black border-amber-500 font-bold'
                      : 'bg-zinc-50 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                  }`}
                >
                  <span>{cat.name}</span>
                  {amount > 0 && <span className="opacity-75 font-mono text-[10px]">({formatINR(amount)})</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search ration by item name, store, or notes..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-[#1A1916] border border-amber-500/20 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-3 text-xs text-zinc-400 hover:text-zinc-600"
          >
            Clear
          </button>
        )}
      </div>

      {/* Itemized House Ration List */}
      <div className="rounded-3xl p-5 sm:p-6 bg-white dark:bg-[#1A1916] border border-amber-500/20 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold tracking-wider font-cinzel text-zinc-900 dark:text-amber-200 uppercase">
            Ration Itemized Purchases ({filteredItems.length})
          </h3>
          <span className="text-xs text-amber-600 font-bold font-mono">
            Total: {formatINR(filteredItems.reduce((acc, curr) => acc + curr.totalAmount, 0))}
          </span>
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-center py-10">
            <Package className="w-10 h-10 mx-auto text-zinc-300 dark:text-zinc-700 mb-2" />
            <p className="text-xs font-semibold text-zinc-500">
              No ration items logged for this category in {formatMonthYear(currentMonthKey, language)}.
            </p>
            <button
              onClick={() => handleOpenAdd()}
              className="mt-3 px-3.5 py-1.5 rounded-xl bg-amber-500 text-black font-bold text-xs hover:bg-amber-600 transition-all"
            >
              + Add First Ration Item
            </button>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {filteredItems.map((item) => {
              const catObj = RATION_CATEGORIES.find((c) => c.name === item.category);
              const Icon = catObj?.icon || Package;

              return (
                <div
                  key={item.id}
                  className="py-3.5 flex items-center justify-between gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 px-2 rounded-2xl transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-2xl border shrink-0 ${catObj?.color || 'bg-zinc-100 text-zinc-600 border-zinc-200'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          {item.itemName}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold">
                          {item.quantity}
                        </span>
                        {item.billPhoto && (
                          <button
                            onClick={() => setViewingPhoto(item.billPhoto || null)}
                            title="View Attached Slip"
                            className="p-1 rounded-md bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 transition-all"
                          >
                            <Camera className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300">{item.category}</span>
                        {item.storeName && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Store className="w-3 h-3 text-zinc-400" />
                              <span>{item.storeName}</span>
                            </span>
                          </>
                        )}
                        <span>•</span>
                        <span>{formatDate(item.date)}</span>
                      </div>
                      {item.notes && (
                        <p className="text-[11px] text-zinc-400 italic mt-0.5 line-clamp-1">
                          {item.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                        {formatINR(item.totalAmount)}
                      </span>
                      {item.pricePerUnit && (
                        <p className="text-[10px] text-zinc-400">
                          @ ₹{item.pricePerUnit}/unit
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenAdd(item)}
                        title="Edit"
                        className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-amber-500/20 hover:text-amber-600 transition-all"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteRationItem(item.id)}
                        title="Delete"
                        className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-rose-500/20 hover:text-rose-600 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Ration Item Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-[#FAF8F5] dark:bg-[#181714] rounded-3xl border border-amber-500/40 shadow-2xl p-6 my-8 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500 text-black">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-cinzel text-zinc-900 dark:text-amber-100">
                    {rationItems.some((r) => r.id === formData.id) ? 'Edit Ration Item' : 'Add Monthly House Ration'}
                  </h3>
                  <span className="text-xs text-amber-600 font-semibold">
                    Billing Month: {formatMonthYear(formData.monthKey, language)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5 text-zinc-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Item Name & Quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Ration Item Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.itemName}
                    onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                    placeholder="e.g. Aashirvaad Atta, Fortune Mustard Oil"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-amber-500/30 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Quantity / Packing *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="e.g. 10 kg, 2 Ltr, 4 pkts, 500g"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-amber-500/30 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Total Amount & Price per unit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Total Amount Paid (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.totalAmount}
                    onChange={(e) => setFormData({ ...formData, totalAmount: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-amber-500/30 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Unit Rate / Price (₹ per kg/ltr)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.pricePerUnit || ''}
                    onChange={(e) => setFormData({ ...formData, pricePerUnit: Number(e.target.value) })}
                    placeholder="e.g. 44"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-amber-500/30 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Category & Purchase Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Ration Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as RationCategory })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-amber-500/30 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {RATION_CATEGORIES.map((cat) => (
                      <option key={cat.name} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Purchase Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-amber-500/30 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Store & Payment Method */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Store / Supermarket Name
                  </label>
                  <input
                    type="text"
                    value={formData.storeName || ''}
                    onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                    placeholder="e.g. D-Mart, Blinkit, Local Kirana"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-amber-500/30 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-amber-500/30 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Card / NetBanking</option>
                  </select>
                </div>
              </div>

              {/* Notes & Slip Attachment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Notes
                  </label>
                  <input
                    type="text"
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="e.g. Stock for next 2 months"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-amber-500/30 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Attach Bill / Slip
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      id="ration-photo-input"
                      className="hidden"
                    />
                    <label
                      htmlFor="ration-photo-input"
                      className="px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold border border-zinc-300 dark:border-zinc-700 cursor-pointer flex items-center gap-1.5"
                    >
                      <Camera className="w-3.5 h-3.5 text-amber-500" />
                      <span>Upload Bill</span>
                    </label>
                    {formData.billPhoto && (
                      <div className="relative">
                        <img
                          src={formData.billPhoto}
                          alt="preview"
                          className="w-9 h-9 object-cover rounded-lg border border-amber-500"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, billPhoto: '' })}
                          className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full p-0.5"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 font-bold text-zinc-700 dark:text-zinc-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold shadow-md shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all text-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Ration Item</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Set / Edit Monthly Ration Budget Modal */}
      {isEditingBudget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-[#FAF8F5] dark:bg-[#181714] rounded-3xl border border-amber-500/40 shadow-2xl p-6 my-8 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-black shadow-md shadow-amber-500/20">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-cinzel text-zinc-900 dark:text-amber-100">
                    {language === 'hi' ? 'मासिक राशन बजट निर्धारित करें' : 'Set Monthly Ration Budget'}
                  </h3>
                  <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
                    {formatMonthYear(currentMonthKey, language)} • Grocery & Staples Goal
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsEditingBudget(false)}
                className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5 text-zinc-500" />
              </button>
            </div>

            {/* Explanation / Notice */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <PiggyBank className="w-4 h-4 text-amber-600 shrink-0" />
                Grocery Budget Goal & Progress Tracker
              </p>
              <p className="text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-300">
                Set a monthly spending limit for household grocery staples (atta, dal, oil, spices, veggies, milk). The progress bar on your dashboard updates in real-time with each purchase, staying completely separate from landlord rent.
              </p>
            </div>

            <form onSubmit={handleSaveBudget} className="space-y-4 text-xs">
              {/* Budget Amount Input */}
              <div className="space-y-2">
                <label className="block font-bold text-zinc-700 dark:text-zinc-300">
                  Monthly Ration Budget (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-black text-amber-600">
                    ₹
                  </span>
                  <input
                    type="number"
                    required
                    min="100"
                    step="100"
                    value={budgetInput || ''}
                    onChange={(e) => setBudgetInput(Number(e.target.value))}
                    placeholder="e.g. 5000"
                    className="w-full pl-9 pr-4 py-3 rounded-2xl border-2 border-amber-500/40 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-mono font-black text-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-inner"
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                  <span>Current Target: <strong className="text-zinc-700 dark:text-zinc-300">{formatINR(currentBudget)}</strong></span>
                  <span>Month: <strong>{formatMonthYear(currentMonthKey, language)}</strong></span>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Quick Presets:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[3000, 5000, 7500, 10000, 12000, 15000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setBudgetInput(preset)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold font-mono transition-all border ${
                        budgetInput === preset
                          ? 'bg-amber-500 text-black border-amber-600 shadow-sm font-black scale-[1.02]'
                          : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-amber-500/40'
                      }`}
                    >
                      {formatINR(preset)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Impact Preview */}
              {budgetInput > 0 && (
                <div className="p-3.5 rounded-2xl bg-zinc-100/80 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Live Progress Preview for {formatMonthYear(currentMonthKey, language)}
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-zinc-500">Already Spent:</span>{' '}
                      <strong className="text-zinc-800 dark:text-zinc-200">{formatINR(totalRationMonthAmount)}</strong>
                    </div>
                    <div>
                      <span className="text-zinc-500">Proposed Budget:</span>{' '}
                      <strong className="text-amber-600 dark:text-amber-400">{formatINR(budgetInput)}</strong>
                    </div>
                    <div>
                      <span className="text-zinc-500">Progress:</span>{' '}
                      <strong className={totalRationMonthAmount > budgetInput ? 'text-rose-600' : 'text-emerald-600'}>
                        {Math.round((totalRationMonthAmount / budgetInput) * 100)}%
                      </strong>
                    </div>
                    <div>
                      <span className="text-zinc-500">Balance Status:</span>{' '}
                      <strong className={totalRationMonthAmount > budgetInput ? 'text-rose-600' : 'text-emerald-600'}>
                        {totalRationMonthAmount > budgetInput
                          ? `+${formatINR(totalRationMonthAmount - budgetInput)} Over`
                          : `${formatINR(budgetInput - totalRationMonthAmount)} Left`}
                      </strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Scope Checkbox */}
              <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={applyAsDefault}
                    onChange={(e) => setApplyAsDefault(e.target.checked)}
                    className="mt-0.5 rounded border-zinc-300 text-amber-600 focus:ring-amber-500 w-4 h-4"
                  />
                  <div>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200 block text-xs">
                      Set as default budget for subsequent months
                    </span>
                    <span className="text-[11px] text-zinc-500 block mt-0.5 leading-tight">
                      When selected, this amount will automatically become the monthly target for all future months.
                    </span>
                  </div>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsEditingBudget(false)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 font-bold text-zinc-700 dark:text-zinc-300 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold shadow-md shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all text-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Budget Goal</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dedicated Monthly House Ration A4 Receipt / Statement Modal */}
      {showReceiptModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-4xl bg-white text-zinc-900 rounded-3xl p-4 sm:p-6 my-6 shadow-2xl space-y-4 max-h-[95vh] overflow-y-auto">
            {/* Modal Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200 no-print">
              <div>
                <h3 className="text-base sm:text-lg font-black font-cinzel text-zinc-900 flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-amber-600" />
                  <span>Monthly House Ration Statement & Receipt</span>
                </h3>
                <p className="text-xs text-zinc-500">
                  Document ID: <strong className="font-mono text-amber-800">{receiptNumber}</strong> • {formatMonthYear(currentMonthKey, language)}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleDownloadRationPDF}
                  disabled={isGeneratingPDF}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-xs shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isGeneratingPDF ? 'Generating...' : 'Download PDF'}</span>
                </button>

                <button
                  onClick={handleShareWhatsApp}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>

                <button
                  onClick={handleAndroidShare}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 text-zinc-100 font-bold text-xs"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="p-1.5 rounded-xl bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                  title="Print"
                >
                  <Printer className="w-4 h-4" />
                </button>

                <button
                  onClick={handleSaveReceiptRecord}
                  className="p-1.5 rounded-xl bg-amber-500/20 text-amber-800 font-bold text-xs flex items-center gap-1"
                  title="Archive Receipt"
                >
                  <Save className="w-4 h-4" />
                  <span>Archive</span>
                </button>

                <button
                  onClick={() => setShowReceiptModal(false)}
                  className="p-1.5 rounded-full hover:bg-zinc-200 transition-colors ml-2"
                >
                  <X className="w-5 h-5 text-zinc-500" />
                </button>
              </div>
            </div>

            {/* Printable A4 Document Body */}
            <div
              id="a4-ration-receipt-document"
              className="bg-white p-6 sm:p-8 rounded-2xl border-2 border-amber-500/40 space-y-5 text-xs text-zinc-900"
            >
              {/* Header Ribbon */}
              <div className="w-full h-2 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 rounded-full" />

              {/* Title & Brand */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b-2 border-amber-500/30">
                <div className="flex items-center gap-3">
                  <CatMascot size={52} showGlow={false} />
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black font-cinzel tracking-wider text-amber-950 flex items-center gap-1.5">
                      <span>AVHII</span>
                      <span className="text-amber-600">RENT APP</span>
                    </h1>
                    <p className="text-[11px] text-zinc-500 uppercase tracking-widest font-bold">
                      House Ration & Daily Grocery Statement
                    </p>
                    <p className="text-[10px] text-zinc-400">
                      Record Owner: {profile.tenantName}
                    </p>
                  </div>
                </div>

                <div className="text-right sm:border-l-2 sm:border-amber-500/20 sm:pl-4">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">
                    Statement Number
                  </span>
                  <p className="font-mono text-sm sm:text-base font-extrabold text-amber-800">
                    {receiptNumber}
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Month: <strong>{formatMonthYear(currentMonthKey, language)}</strong>
                  </p>
                  <p className="text-[10px] text-zinc-400">
                    Generated Date: {formatDate(getTodayDate())}
                  </p>
                </div>
              </div>

              {/* Notice Banner */}
              <div className="py-2.5 px-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center">
                <h2 className="text-sm sm:text-base font-black font-cinzel tracking-wider text-amber-950">
                  MONTHLY HOUSE RATION & DAILY EXPENSE STATEMENT
                </h2>
                <p className="text-[11px] text-amber-800 mt-0.5 font-semibold">
                  (Dedicated Record — Kept 100% Independent of Room Rent)
                </p>
              </div>

              {/* Itemized Table */}
              <div className="rounded-xl border border-zinc-200 overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-amber-500/15 text-amber-950 border-b border-amber-500/30">
                      <th className="py-2 px-3 font-bold uppercase text-[10px]">#</th>
                      <th className="py-2 px-3 font-bold uppercase text-[10px]">Date</th>
                      <th className="py-2 px-3 font-bold uppercase text-[10px]">Item & Packing</th>
                      <th className="py-2 px-3 font-bold uppercase text-[10px]">Category</th>
                      <th className="py-2 px-3 font-bold uppercase text-[10px]">Store / Mode</th>
                      <th className="py-2 px-3 font-bold uppercase text-[10px] text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {monthItems.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-zinc-50">
                        <td className="py-2 px-3 text-zinc-400 font-mono text-[10px]">{idx + 1}</td>
                        <td className="py-2 px-3 text-zinc-600">{formatDate(item.date)}</td>
                        <td className="py-2 px-3 font-bold text-zinc-900">
                          {item.itemName} <span className="text-zinc-500 font-normal">({item.quantity})</span>
                        </td>
                        <td className="py-2 px-3 text-zinc-600">{item.category}</td>
                        <td className="py-2 px-3 text-zinc-500 text-[11px]">
                          {item.storeName || 'Local'} • {item.paymentMethod}
                        </td>
                        <td className="py-2 px-3 text-right font-extrabold text-zinc-900">{formatINR(item.totalAmount)}</td>
                      </tr>
                    ))}

                    <tr className="bg-amber-500/10 font-bold border-t-2 border-zinc-300">
                      <td colSpan={5} className="py-2.5 px-3 text-amber-950 uppercase text-[11px]">
                        Total Monthly House Ration Outflow
                      </td>
                      <td className="py-2.5 px-3 text-right text-base font-black text-amber-950">
                        {formatINR(totalRationMonthAmount)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Amount in words & Category Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                  <span className="text-[10px] font-bold uppercase text-zinc-400">Total in Indian Words</span>
                  <p className="font-bold text-zinc-800 italic mt-0.5">
                    {numberToWordsINR(totalRationMonthAmount)}
                  </p>
                  <p className="text-[10px] text-zinc-500 mt-2">
                    Total Purchases: <strong>{monthItems.length} items</strong> logged for {formatMonthYear(currentMonthKey, language)}.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-zinc-400">Major Category Totals</span>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-zinc-700">
                    {Object.entries(categoryBreakdown).slice(0, 6).map(([cat, amt]) => (
                      <div key={cat} className="flex justify-between">
                        <span className="truncate">{cat}:</span>
                        <strong className="font-mono">{formatINR(amt)}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Signatures */}
              <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs">
                <div>
                  <div className="border-b border-zinc-400 border-dashed w-40 mx-auto mb-1" />
                  <p className="font-bold text-zinc-800">{profile.tenantName}</p>
                  <p className="text-[10px] text-zinc-400 uppercase">Purchaser / Verified By</p>
                </div>

                <div>
                  <div className="border-b border-zinc-400 border-dashed w-40 mx-auto mb-1" />
                  <p className="font-bold text-zinc-800">Household Archives</p>
                  <p className="text-[10px] text-zinc-400 uppercase">AVHII RENT Record Keeper</p>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 text-center border-t border-zinc-200 text-[10px] text-zinc-400">
                Official Monthly House Ration & Daily Expenses Statement • AVHII RENT APP • Abhishek Ranjan
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Photo Preview Lightbox */}
      {viewingPhoto && (
        <div
          onClick={() => setViewingPhoto(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs cursor-pointer"
        >
          <div className="relative max-w-xl max-h-[90vh]">
            <img
              src={viewingPhoto}
              alt="Ration slip preview"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl border border-amber-500/50 shadow-2xl"
            />
            <button
              onClick={() => setViewingPhoto(null)}
              className="absolute -top-3 -right-3 p-2 bg-amber-500 text-black rounded-full font-bold shadow-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
