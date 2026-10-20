import React from 'react';
import {
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Zap,
  Building,
  Receipt,
  PlusCircle,
  FileText,
  DollarSign,
  ChevronRight,
  Mic,
  Box,
  MapPin,
  Sparkles,
} from 'lucide-react';
import {
  ActiveTab,
  ElectricityRecord,
  ExpenseRecord,
  RentRecord,
} from '../types';
import { formatINR, formatMonthYear, formatDate } from '../utils/formatters';
import { CatMascot } from './CatMascot';

interface DashboardViewProps {
  currentMonthKey: string;
  rents: RentRecord[];
  electricity: ElectricityRecord[];
  expenses: ExpenseRecord[];
  onNavigate: (tab: ActiveTab) => void;
  onOpenQuickAdd: (type?: 'rent' | 'electricity' | 'expense') => void;
  onOpenVoiceAssistant?: () => void;
  language: 'en' | 'hi';
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentMonthKey,
  rents,
  electricity,
  expenses,
  onNavigate,
  onOpenQuickAdd,
  onOpenVoiceAssistant,
  language,
}) => {
  // Current month records
  const currentRent = rents.find((r) => r.monthKey === currentMonthKey);
  const currentElec = electricity.find((e) => e.monthKey === currentMonthKey);
  const currentMonthExpenses = expenses.filter((e) => e.monthKey === currentMonthKey);

  // Computations
  const rentAmount = currentRent?.monthlyRent || 0;
  const rentAdditional = currentRent?.additionalCharges || 0;
  const elecAmount = currentElec?.totalAmount || 0;
  const totalPersonalExpenses = currentMonthExpenses.reduce((acc, curr) => acc + curr.amount, 0);

  // Grand Total Payable for room & electricity
  const totalPayableAmount = rentAmount + rentAdditional + elecAmount;

  // Paid amounts
  const rentPaid = currentRent?.amountPaid || 0;
  // If payment status is Paid and full paid
  const totalPaid = rentPaid;
  const pendingBalance = Math.max(0, totalPayableAmount - totalPaid);

  // Total monthly outflow (Rent + Electricity + Personal expenses)
  const totalMonthlyOutflow = totalPayableAmount + totalPersonalExpenses;

  // Recent transactions list
  const recentActivities: Array<{
    id: string;
    title: string;
    subtitle: string;
    amount: number;
    date: string;
    type: 'rent' | 'electricity' | 'expense';
  }> = [];

  if (currentRent) {
    recentActivities.push({
      id: currentRent.id,
      title: `Room Rent (${formatMonthYear(currentMonthKey, language)})`,
      subtitle: currentRent.paymentStatus === 'Paid' ? `Paid via ${currentRent.paymentMethod}` : 'Rent payment pending',
      amount: currentRent.monthlyRent + (currentRent.additionalCharges || 0),
      date: currentRent.paymentDate || currentRent.dueDate,
      type: 'rent',
    });
  }

  if (currentElec) {
    recentActivities.push({
      id: currentElec.id,
      title: `Electricity (${currentElec.unitsConsumed} units @ ₹${currentElec.ratePerUnit})`,
      subtitle: `Reading: ${currentElec.previousReading} → ${currentElec.currentReading}`,
      amount: currentElec.totalAmount,
      date: currentElec.readingDate,
      type: 'electricity',
    });
  }

  currentMonthExpenses.forEach((exp) => {
    recentActivities.push({
      id: exp.id,
      title: exp.title,
      subtitle: `${exp.category} • ${exp.paymentMethod}`,
      amount: exp.amount,
      date: exp.date,
      type: 'expense',
    });
  });

  // Sort recent by date desc
  recentActivities.sort((a, b) => (b.date > a.date ? 1 : -1));

  // Category breakdown for chart
  const categoriesList = [
    { label: 'Room Rent', amount: rentAmount, color: 'bg-amber-500' },
    { label: 'Electricity Bill', amount: elecAmount, color: 'bg-yellow-400' },
    { label: 'Personal Expenses', amount: totalPersonalExpenses, color: 'bg-emerald-500' },
  ];

  const totalForBar = Math.max(1, totalMonthlyOutflow);

  return (
    <div className="space-y-6 pb-24 max-w-6xl mx-auto px-4 pt-4">
      {/* Royal Welcome Card with Cat Mascot */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E1C18] via-[#141311] to-[#0D0C0A] text-white p-5 sm:p-7 border border-[#D4AF37]/30 shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-0 p-4 opacity-15 pointer-events-none font-cinzel text-7xl font-black text-amber-300">
          ARA
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <CatMascot size={68} showGlow={true} />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">
                  Personal Finance Suite
                </span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                  {formatMonthYear(currentMonthKey, language)}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-cinzel tracking-wide text-amber-50 mt-0.5">
                ABHISHEK RENT APP
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Owner & Tenant: <strong className="text-zinc-200">Abhishek Ranjan</strong> • Bengaluru
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 sm:pt-0">
            <button
              onClick={() => onNavigate('settlement')}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-xs shadow-md shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all"
            >
              <Receipt className="w-4 h-4" />
              <span>Final Settlement</span>
            </button>
            <button
              onClick={() => onNavigate('receipt')}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-800/90 text-amber-200 border border-amber-500/30 font-bold text-xs hover:bg-zinc-800 active:scale-95 transition-all"
            >
              <FileText className="w-4 h-4" />
              <span>View Receipt</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3D Studio, Gemini Live Voice & Google Maps Showcase Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: 3D Studio */}
        <div
          onClick={() => onNavigate('3d-studio')}
          className="group cursor-pointer rounded-2xl p-5 bg-gradient-to-br from-[#1C1A17] to-[#12110F] border border-amber-500/30 hover:border-amber-400 shadow-lg hover:shadow-amber-500/10 transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="p-2.5 rounded-xl bg-amber-500/15 text-[#D4AF37] border border-amber-500/30">
                <Box className="w-5 h-5" />
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Three.js WebGL
              </span>
            </div>
            <h3 className="mt-3 font-cinzel text-sm sm:text-base font-bold text-amber-100 group-hover:text-amber-300 transition-colors">
              {language === 'hi' ? '3D रॉयल मैस्कॉट व कमरा' : '3D Mascot & Room Studio'}
            </h3>
            <p className="mt-1 text-xs text-zinc-400 line-clamp-2">
              {language === 'hi'
                ? '24K गोल्ड फिनिश, मार्बल व एक्सप्लोडेड व्यू के साथ 3D मॉडल देखें।'
                : 'Interactive procedural 3D model with 24K Gold, Marble finishes and exploded view.'}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs font-bold text-[#D4AF37]">
            <span>{language === 'hi' ? 'स्टूडियो खोलें' : 'Launch 3D Studio'}</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 2: Gemini Live Voice */}
        <div
          onClick={() => onOpenVoiceAssistant?.()}
          className="group cursor-pointer rounded-2xl p-5 bg-gradient-to-br from-amber-500/15 via-[#1E1C18] to-[#12110F] border border-amber-500/40 hover:border-amber-400 shadow-lg hover:shadow-amber-500/20 transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-bold shadow-md shadow-amber-500/30">
                <Mic className="w-5 h-5" />
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Audio</span>
              </span>
            </div>
            <h3 className="mt-3 font-cinzel text-sm sm:text-base font-bold text-amber-100 group-hover:text-amber-300 transition-colors">
              {language === 'hi' ? 'रॉयल वॉइस असिस्टेंट' : 'Gemini Live Voice AI'}
            </h3>
            <p className="mt-1 text-xs text-zinc-400 line-clamp-2">
              {language === 'hi'
                ? 'किराया, बिजली यूनिट्स और राशन खर्चों पर बोलकर तुरंत बातचीत करें।'
                : 'Conversational hands-free voice companion powered by gemini-3.8-live.'}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs font-bold text-[#D4AF37]">
            <span>{language === 'hi' ? 'बातचीत शुरू करें' : 'Start Voice Chat'}</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 3: Google Maps Grounding */}
        <div
          onClick={() => onNavigate('maps')}
          className="group cursor-pointer rounded-2xl p-5 bg-gradient-to-br from-[#1C1A17] to-[#12110F] border border-amber-500/30 hover:border-amber-400 shadow-lg hover:shadow-amber-500/10 transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="p-2.5 rounded-xl bg-amber-500/15 text-[#D4AF37] border border-amber-500/30">
                <MapPin className="w-5 h-5" />
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40">
                Maps Grounded
              </span>
            </div>
            <h3 className="mt-3 font-cinzel text-sm sm:text-base font-bold text-amber-100 group-hover:text-amber-300 transition-colors">
              {language === 'hi' ? 'गूगल मैप्स सुविधाएं' : 'Nearby Stores & Utilities'}
            </h3>
            <p className="mt-1 text-xs text-zinc-400 line-clamp-2">
              {language === 'hi'
                ? 'कमरे के पास किराना, डी-मार्ट व बिजली बिल केंद्रों के सत्यापित मैप लिंक्स।'
                : 'Verified supermarkets, local kirana & electricity bill payment centers.'}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs font-bold text-[#D4AF37]">
            <span>{language === 'hi' ? 'आसपास खोजें' : 'Search Nearby'}</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* 6 Real-time Summary Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold tracking-wider font-cinzel text-zinc-900 dark:text-amber-200 uppercase flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-500" />
            <span>Monthly Financial Overview</span>
          </h3>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {formatMonthYear(currentMonthKey, language)}
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {/* Card 1: Monthly Room Rent */}
          <div
            onClick={() => onNavigate('rent')}
            className="group cursor-pointer rounded-2xl p-4 bg-white dark:bg-[#1A1916] border border-amber-500/20 hover:border-amber-500/50 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                Monthly Room Rent
              </span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500/20 transition-colors">
                <Building className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-lg sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
                {formatINR(rentAmount)}
              </div>
              <div className="flex items-center gap-1 mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                <span>Status:</span>
                <span
                  className={`font-semibold ${
                    currentRent?.paymentStatus === 'Paid'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : currentRent?.paymentStatus === 'Partial'
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-rose-500'
                  }`}
                >
                  {currentRent?.paymentStatus || 'Not recorded'}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Monthly Electricity Bill */}
          <div
            onClick={() => onNavigate('electricity')}
            className="group cursor-pointer rounded-2xl p-4 bg-white dark:bg-[#1A1916] border border-amber-500/20 hover:border-amber-500/50 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                Electricity Bill
              </span>
              <div className="p-2 rounded-xl bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 group-hover:bg-yellow-500/20 transition-colors">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-lg sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
                {formatINR(elecAmount)}
              </div>
              <div className="flex items-center gap-1 mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                <span>{currentElec ? `${currentElec.unitsConsumed} units @ ₹${currentElec.ratePerUnit}` : 'Reading not taken'}</span>
              </div>
            </div>
          </div>

          {/* Card 3: Total Monthly Expenses */}
          <div
            onClick={() => onNavigate('expenses')}
            className="group cursor-pointer rounded-2xl p-4 bg-white dark:bg-[#1A1916] border border-amber-500/20 hover:border-amber-500/50 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                Personal Expenses
              </span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-lg sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
                {formatINR(totalPersonalExpenses)}
              </div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                {currentMonthExpenses.length} transactions recorded
              </div>
            </div>
          </div>

          {/* Card 4: Total Payable Amount (Rent + Elec + Addl) */}
          <div
            onClick={() => onNavigate('settlement')}
            className="group cursor-pointer rounded-2xl p-4 bg-gradient-to-br from-amber-500/10 to-transparent dark:bg-[#1E1B15] border border-amber-500/30 hover:border-amber-500/60 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                Total Payable Amount
              </span>
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-lg sm:text-2xl font-extrabold text-amber-900 dark:text-amber-100">
                {formatINR(totalPayableAmount)}
              </div>
              <div className="text-[11px] text-amber-700/80 dark:text-amber-400/80 mt-1">
                Rent + Power + Maintenance
              </div>
            </div>
          </div>

          {/* Card 5: Total Paid */}
          <div
            onClick={() => onNavigate('rent')}
            className="group cursor-pointer rounded-2xl p-4 bg-white dark:bg-[#1A1916] border border-emerald-500/20 hover:border-emerald-500/40 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                Total Paid
              </span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-lg sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {formatINR(totalPaid)}
              </div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                {currentRent?.paymentDate ? `Paid on ${formatDate(currentRent.paymentDate)}` : 'No payment recorded'}
              </div>
            </div>
          </div>

          {/* Card 6: Pending Balance */}
          <div
            onClick={() => onNavigate('settlement')}
            className={`group cursor-pointer rounded-2xl p-4 border transition-all duration-200 ${
              pendingBalance > 0
                ? 'bg-rose-500/5 dark:bg-rose-950/20 border-rose-500/30 hover:border-rose-500/50'
                : 'bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-500/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-xs font-bold ${
                  pendingBalance > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                Pending Balance
              </span>
              <div
                className={`p-2 rounded-xl ${
                  pendingBalance > 0
                    ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                    : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {pendingBalance > 0 ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
              </div>
            </div>
            <div className="mt-2">
              <div
                className={`text-lg sm:text-2xl font-extrabold ${
                  pendingBalance > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {formatINR(pendingBalance)}
              </div>
              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                {pendingBalance > 0 ? 'Action required' : 'All clear for this month'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Balance Callout Banner if outstanding */}
      {pendingBalance > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500 text-black font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-900 dark:text-amber-100">
                Outstanding Balance of {formatINR(pendingBalance)}
              </p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Due on {formatDate(currentRent?.dueDate || `${currentMonthKey}-05`)}. Generate statement or record payment.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('settlement')}
            className="shrink-0 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold transition-all shadow-sm"
          >
            Settle Now
          </button>
        </div>
      )}

      {/* Monthly Expenditure Visualizer Chart */}
      <div className="rounded-3xl p-5 sm:p-6 bg-white dark:bg-[#1A1916] border border-amber-500/20 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold tracking-wider font-cinzel text-zinc-900 dark:text-amber-200 uppercase">
              Monthly Outflow Distribution
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Total Outflow: <strong className="text-zinc-800 dark:text-zinc-200">{formatINR(totalMonthlyOutflow)}</strong>
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
            {formatMonthYear(currentMonthKey, language)}
          </span>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full h-4 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex shadow-inner">
          {categoriesList.map((item, idx) => {
            const percentage = (item.amount / totalForBar) * 100;
            if (percentage <= 0) return null;
            return (
              <div
                key={idx}
                style={{ width: `${percentage}%` }}
                className={`${item.color} h-full transition-all duration-500 relative group`}
                title={`${item.label}: ${formatINR(item.amount)} (${percentage.toFixed(1)}%)`}
              />
            );
          })}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
          {categoriesList.map((item, idx) => {
            const percentage = ((item.amount / totalForBar) * 100).toFixed(1);
            return (
              <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{item.label}</span>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{formatINR(item.amount)}</div>
                  <div className="text-[10px] text-zinc-400">{percentage}%</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          onClick={() => onOpenQuickAdd('rent')}
          className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white dark:bg-[#1A1916] border border-amber-500/20 hover:border-amber-500/50 shadow-2xs hover:scale-[1.02] active:scale-95 transition-all text-center"
        >
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-2">
            <Building className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Record Rent</span>
          <span className="text-[10px] text-zinc-500">Room lease</span>
        </button>

        <button
          onClick={() => onOpenQuickAdd('electricity')}
          className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white dark:bg-[#1A1916] border border-amber-500/20 hover:border-amber-500/50 shadow-2xs hover:scale-[1.02] active:scale-95 transition-all text-center"
        >
          <div className="p-2.5 rounded-xl bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 mb-2">
            <Zap className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Log Meter</span>
          <span className="text-[10px] text-zinc-500">₹7/unit calc</span>
        </button>

        <button
          onClick={() => onNavigate('ration')}
          className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white dark:bg-[#1A1916] border border-amber-500/20 hover:border-amber-500/50 shadow-2xs hover:scale-[1.02] active:scale-95 transition-all text-center"
        >
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-2">
            <Receipt className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">House Ration</span>
          <span className="text-[10px] text-zinc-500">Ration receipt</span>
        </button>

        <button
          onClick={() => onOpenQuickAdd('expense')}
          className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white dark:bg-[#1A1916] border border-amber-500/20 hover:border-amber-500/50 shadow-2xs hover:scale-[1.02] active:scale-95 transition-all text-center"
        >
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-2">
            <PlusCircle className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Add Expense</span>
          <span className="text-[10px] text-zinc-500">Personal</span>
        </button>

        <button
          onClick={() => onNavigate('receipt')}
          className="col-span-2 sm:col-span-1 flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white dark:bg-[#1A1916] border border-amber-500/20 hover:border-amber-500/50 shadow-2xs hover:scale-[1.02] active:scale-95 transition-all text-center"
        >
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mb-2">
            <FileText className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Rent Receipt</span>
          <span className="text-[10px] text-zinc-500">Landlord PDF</span>
        </button>
      </div>

      {/* Recent Transactions List */}
      <div className="rounded-3xl p-5 bg-white dark:bg-[#1A1916] border border-amber-500/20 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold tracking-wider font-cinzel text-zinc-900 dark:text-amber-200 uppercase">
            Recent Activity ({formatMonthYear(currentMonthKey, language)})
          </h3>
          <button
            onClick={() => onNavigate('history')}
            className="text-xs text-amber-600 dark:text-amber-400 font-bold hover:underline flex items-center gap-1"
          >
            <span>Full History</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentActivities.length === 0 ? (
          <div className="text-center py-8">
            <CatMascot size={48} showGlow={false} className="mx-auto opacity-40 mb-2" />
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              No activity recorded for {formatMonthYear(currentMonthKey, language)} yet.
            </p>
            <button
              onClick={() => onOpenQuickAdd()}
              className="mt-3 px-3.5 py-1.5 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold text-xs hover:bg-amber-500/20 transition-all"
            >
              + Add First Record
            </button>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {recentActivities.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="py-3 flex items-center justify-between gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 px-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-xl ${
                      item.type === 'rent'
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        : item.type === 'electricity'
                        ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {item.type === 'rent' ? (
                      <Building className="w-4 h-4" />
                    ) : item.type === 'electricity' ? (
                      <Zap className="w-4 h-4" />
                    ) : (
                      <DollarSign className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{item.title}</p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{item.subtitle}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100">
                    {formatINR(item.amount)}
                  </p>
                  <p className="text-[10px] text-zinc-400">{formatDate(item.date)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
