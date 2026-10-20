import React, { useState, useEffect } from 'react';
import {
  Scale,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building,
  Zap,
  CreditCard,
  FileText,
  AlertCircle,
  Save,
  RotateCcw,
  Plus,
  Minus,
  Tag,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  ActiveTab,
  ElectricityRecord,
  FinalSettlement,
  PaymentMethod,
  RentRecord,
} from '../types';
import { formatINR, formatMonthYear, formatDate, getTodayDate } from '../utils/formatters';

interface SettlementViewProps {
  currentMonthKey: string;
  onMonthChange: (monthKey: string) => void;
  rents: RentRecord[];
  electricity: ElectricityRecord[];
  settlements: FinalSettlement[];
  onSaveSettlement: (settlement: FinalSettlement) => void;
  onNavigate: (tab: ActiveTab) => void;
  language: 'en' | 'hi';
}

export const SettlementView: React.FC<SettlementViewProps> = ({
  currentMonthKey,
  onMonthChange,
  rents,
  electricity,
  settlements,
  onSaveSettlement,
  onNavigate,
  language,
}) => {
  // Existing settlement for this month
  const existingSettlement = settlements.find((s) => s.monthKey === currentMonthKey);
  const currentRent = rents.find((r) => r.monthKey === currentMonthKey);
  const currentElec = electricity.find((e) => e.monthKey === currentMonthKey);

  // Editable Settlement State
  const [rentAmount, setRentAmount] = useState<number>(0);
  const [previousReading, setPreviousReading] = useState<number>(0);
  const [currentReading, setCurrentReading] = useState<number>(0);
  const [electricityUnits, setElectricityUnits] = useState<number>(0);
  const [electricityRate, setElectricityRate] = useState<number>(7);
  const [electricityBill, setElectricityBill] = useState<number>(0);
  const [additionalCharges, setAdditionalCharges] = useState<number>(0);
  const [previousDue, setPreviousDue] = useState<number>(0);
  const [advanceAdjustment, setAdvanceAdjustment] = useState<number>(0);
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'deduct'>('add');
  const [adjustmentAmount, setAdjustmentAmount] = useState<number>(0);
  const [adjustmentReason, setAdjustmentReason] = useState<string>('');
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [paymentDate, setPaymentDate] = useState<string>(getTodayDate());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  // Sync state whenever month changes or records change
  useEffect(() => {
    if (existingSettlement) {
      setRentAmount(existingSettlement.rentAmount);
      setPreviousReading(existingSettlement.previousReading);
      setCurrentReading(existingSettlement.currentReading);
      setElectricityUnits(existingSettlement.electricityUnits);
      setElectricityRate(existingSettlement.electricityRate);
      setElectricityBill(existingSettlement.electricityBill);
      setAdditionalCharges(existingSettlement.additionalCharges);
      setPreviousDue(existingSettlement.previousDue);
      setAdvanceAdjustment(existingSettlement.advanceAdjustment);

      if (existingSettlement.adjustmentAmount !== undefined && existingSettlement.adjustmentAmount > 0) {
        setAdjustmentType(existingSettlement.adjustmentType || 'add');
        setAdjustmentAmount(existingSettlement.adjustmentAmount);
        setAdjustmentReason(existingSettlement.adjustmentReason || '');
      } else if (existingSettlement.advanceAdjustment > 0) {
        setAdjustmentType('deduct');
        setAdjustmentAmount(existingSettlement.advanceAdjustment);
        setAdjustmentReason('Advance / deposit adjustment');
      } else if (existingSettlement.previousDue > 0) {
        setAdjustmentType('add');
        setAdjustmentAmount(existingSettlement.previousDue);
        setAdjustmentReason('Previous unpaid dues');
      } else {
        setAdjustmentType('add');
        setAdjustmentAmount(0);
        setAdjustmentReason('');
      }

      setAmountPaid(existingSettlement.amountPaid);
      setPaymentDate(existingSettlement.paymentDate || getTodayDate());
      setPaymentMethod(existingSettlement.paymentMethod || 'UPI');
      setTransactionRef(existingSettlement.transactionRef || '');
      setNotes(existingSettlement.notes || '');
    } else {
      // Auto-retrieve from saved records
      const rAmount = currentRent?.monthlyRent || 9500;
      const addl = currentRent?.additionalCharges || 0;
      const prev = currentElec?.previousReading || 1250;
      const curr = currentElec?.currentReading || 1340;
      const units = currentElec ? currentElec.unitsConsumed : Math.max(0, curr - prev);
      const rate = currentElec?.ratePerUnit || 7;
      const eBill = currentElec ? currentElec.totalAmount : units * rate;
      const paid = currentRent?.amountPaid || 0;

      setRentAmount(rAmount);
      setPreviousReading(prev);
      setCurrentReading(curr);
      setElectricityUnits(units);
      setElectricityRate(rate);
      setElectricityBill(eBill);
      setAdditionalCharges(addl);
      setPreviousDue(0);
      setAdvanceAdjustment(0);
      setAdjustmentType('add');
      setAdjustmentAmount(0);
      setAdjustmentReason('');
      setAmountPaid(paid);
      setPaymentDate(currentRent?.paymentDate || getTodayDate());
      setPaymentMethod(currentRent?.paymentMethod || 'UPI');
      setTransactionRef(currentRent?.transactionRef || '');
      setNotes('');
    }
  }, [currentMonthKey, existingSettlement, currentRent, currentElec]);

  // Handle unit recalculations if readings change manually
  const handleReadingUpdate = (prev: number, curr: number, rate: number) => {
    setPreviousReading(prev);
    setCurrentReading(curr);
    const u = Math.max(0, curr - prev);
    setElectricityUnits(u);
    setElectricityRate(rate);
    setElectricityBill(u * rate);
  };

  // Calculations
  const effectiveAdjustment =
    adjustmentType === 'deduct' ? -Math.abs(adjustmentAmount) : Math.abs(adjustmentAmount);

  const grandTotal = Math.max(
    0,
    rentAmount + electricityBill + additionalCharges + effectiveAdjustment
  );
  const remainingBalance = Math.max(0, grandTotal - amountPaid);
  const isSettled = remainingBalance === 0 && grandTotal > 0 && amountPaid >= grandTotal;

  const handlePayInFull = () => {
    setAmountPaid(grandTotal);
    if (!paymentDate) setPaymentDate(getTodayDate());
  };

  const handleFinalizeSettlement = () => {
    const record: FinalSettlement = {
      id: existingSettlement?.id || `settle-${currentMonthKey}`,
      monthKey: currentMonthKey,
      rentAmount,
      previousReading,
      currentReading,
      electricityUnits,
      electricityRate,
      electricityBill,
      additionalCharges,
      previousDue: adjustmentType === 'add' ? adjustmentAmount : 0,
      advanceAdjustment: adjustmentType === 'deduct' ? adjustmentAmount : 0,
      adjustmentType,
      adjustmentAmount,
      adjustmentReason,
      grandTotal,
      amountPaid,
      remainingBalance,
      paymentDate: paymentDate || getTodayDate(),
      paymentMethod,
      transactionRef,
      notes,
      isConfirmed: true,
      finalizedAt: new Date().toISOString(),
    };

    onSaveSettlement(record);
    setShowConfirmModal(false);

    // Fire celebration confetti!
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#FFF2B2', '#E5C158', '#4ade80'],
      });
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6 pb-24 max-w-5xl mx-auto px-4 pt-4">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Scale className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-cinzel text-zinc-900 dark:text-amber-100">
              Final Monthly Settlement
            </h2>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Reconcile Room Rent, Electricity Units @ ₹7, dues & advance for landlord payout
          </p>
        </div>

        <div className="flex items-center gap-2">
          {existingSettlement?.isConfirmed && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs border border-emerald-500/30">
              <ShieldCheck className="w-4 h-4" />
              <span>Settlement Finalized</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Calculation Card */}
      <div className="rounded-3xl p-6 bg-white dark:bg-[#1A1916] border border-amber-500/30 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#D4AF37]">
              Reconciliation Statement
            </span>
            <h3 className="text-2xl font-black font-cinzel text-zinc-900 dark:text-amber-100 mt-0.5">
              {formatMonthYear(currentMonthKey, language)}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-zinc-500">Switch Month:</label>
            <input
              type="month"
              value={currentMonthKey}
              onChange={(e) => e.target.value && onMonthChange(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-xl border border-amber-500/30 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold"
            />
          </div>
        </div>

        {/* Section 1: Room Rent Component */}
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
                1. Monthly Room Rent
              </span>
            </div>
            <span className="text-xs text-zinc-500">
              {currentRent ? 'Synced from Rent tab' : 'Default rate'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Room Rent (₹)
              </label>
              <input
                type="number"
                min="0"
                value={rentAmount}
                onChange={(e) => setRentAmount(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-amber-500/30 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Additional Charges / Maintenance (₹)
              </label>
              <input
                type="number"
                min="0"
                value={additionalCharges}
                onChange={(e) => setAdditionalCharges(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-amber-500/30 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-bold"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Electricity Component */}
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
                2. Electricity Consumption (₹{electricityRate}/unit)
              </span>
            </div>
            <span className="text-xs text-amber-600 font-semibold">
              {currentElec ? 'Synced from Electricity tab' : 'Manual values'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
                Previous Reading
              </label>
              <input
                type="number"
                value={previousReading}
                onChange={(e) =>
                  handleReadingUpdate(Number(e.target.value), currentReading, electricityRate)
                }
                className="w-full px-3 py-2 rounded-xl border border-amber-500/30 bg-white dark:bg-zinc-900 font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
                Current Reading
              </label>
              <input
                type="number"
                value={currentReading}
                onChange={(e) =>
                  handleReadingUpdate(previousReading, Number(e.target.value), electricityRate)
                }
                className="w-full px-3 py-2 rounded-xl border border-amber-500/30 bg-white dark:bg-zinc-900 font-bold"
              />
            </div>

            <div>
              <span className="block text-[11px] font-semibold text-zinc-500 mb-1">
                Units Consumed
              </span>
              <div className="px-3 py-2 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 font-extrabold border border-amber-500/20">
                {electricityUnits} units
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 mb-1">
                Rate (₹)
              </label>
              <input
                type="number"
                value={electricityRate}
                onChange={(e) =>
                  handleReadingUpdate(previousReading, currentReading, Number(e.target.value))
                }
                className="w-full px-3 py-2 rounded-xl border border-amber-500/30 bg-white dark:bg-zinc-900 font-bold"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <span className="block text-[11px] font-semibold text-zinc-500 mb-1">
                Power Bill
              </span>
              <div className="px-3 py-2 rounded-xl bg-amber-500 text-black font-extrabold">
                {formatINR(electricityBill)}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Add / Deduct Adjustment (if any +/-) */}
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide flex items-center gap-1.5">
                <span>3. Add / Deduct (यदि कोई बकाया या एक्स्ट्रा कैश डिपॉजिट हो +/-)</span>
              </span>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Add previous dues/charges (+) or deduct extra cash deposit/advance (−) from total bill
              </p>
            </div>

            {/* Toggle + Add vs - Deduct */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-200/70 dark:bg-zinc-900/80 border border-zinc-300 dark:border-zinc-700 w-fit">
              <button
                type="button"
                onClick={() => setAdjustmentType('add')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  adjustmentType === 'add'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add (Dues / Arrears)</span>
              </button>
              <button
                type="button"
                onClick={() => setAdjustmentType('deduct')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  adjustmentType === 'deduct'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                <Minus className="w-3.5 h-3.5" />
                <span>− Deduct (Cash Deposit / Adv)</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            {/* Amount Input */}
            <div className="sm:col-span-4">
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                {adjustmentType === 'add' ? '+ Add Amount (₹)' : '− Deduct Amount (₹)'}
              </label>
              <div className="relative">
                <span
                  className={`absolute left-3 top-2.5 font-bold text-xs ${
                    adjustmentType === 'add' ? 'text-rose-600' : 'text-emerald-600'
                  }`}
                >
                  {adjustmentType === 'add' ? '+₹' : '-₹'}
                </span>
                <input
                  type="number"
                  min="0"
                  value={adjustmentAmount || ''}
                  onChange={(e) => setAdjustmentAmount(Math.max(0, Number(e.target.value)))}
                  placeholder="0"
                  className="w-full pl-8 pr-3.5 py-2 rounded-xl border border-amber-500/30 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-bold"
                />
              </div>
            </div>

            {/* Reason / Note Input */}
            <div className="sm:col-span-8">
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Reason / विवरण (उदा. "Cash deposit extra diya", "Purana dues bacha tha")
              </label>
              <input
                type="text"
                value={adjustmentReason}
                onChange={(e) => setAdjustmentReason(e.target.value)}
                placeholder={
                  adjustmentType === 'deduct'
                    ? 'उदा. Extra cash deposit diya tha / Purana advance adjustment'
                    : 'उदा. Previous month dues pending / Late fee'
                }
                className="w-full px-3.5 py-2 rounded-xl border border-amber-500/30 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-xs"
              />
            </div>
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] font-semibold text-zinc-400">Quick Presets:</span>
            {[
              { label: 'Cash Deposit Extra', type: 'deduct', amount: 1000 },
              { label: 'Cash Advance Paid', type: 'deduct', amount: 500 },
              { label: 'Previous Month Dues', type: 'add', amount: 500 },
              { label: 'Maintenance Share', type: 'add', amount: 300 },
            ].map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setAdjustmentType(preset.type as any);
                  setAdjustmentAmount(preset.amount);
                  setAdjustmentReason(preset.label);
                }}
                className="text-[10px] px-2.5 py-1 rounded-lg bg-zinc-200/80 dark:bg-zinc-700/60 hover:bg-amber-500/20 text-zinc-700 dark:text-zinc-300 transition-colors"
              >
                {preset.type === 'deduct' ? '−' : '+'} {preset.label} (₹{preset.amount})
              </button>
            ))}
            {adjustmentAmount > 0 && (
              <button
                type="button"
                onClick={() => {
                  setAdjustmentAmount(0);
                  setAdjustmentReason('');
                }}
                className="text-[10px] px-2 py-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 ml-auto font-semibold"
              >
                Clear +/-
              </button>
            )}
          </div>
        </div>

        {/* Grand Total & Payment Reconcile Banner */}
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-amber-500/15 via-amber-400/5 to-transparent dark:from-[#211E18] dark:to-[#171613] border-2 border-amber-500/40">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4 border-b border-amber-500/20">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                Grand Total Payable
              </span>
              <p className="text-2xl sm:text-3xl font-black font-cinzel text-amber-950 dark:text-amber-100 mt-1">
                {formatINR(grandTotal)}
              </p>
              <span className="text-[11px] text-zinc-500">
                (Rent + Power + Addl {adjustmentAmount > 0 ? (adjustmentType === 'deduct' ? `− ₹${adjustmentAmount}` : `+ ₹${adjustmentAmount}`) : '± Adjustments'})
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Amount Paid
                </span>
                <button
                  type="button"
                  onClick={handlePayInFull}
                  className="text-[10px] text-amber-600 font-bold underline hover:text-amber-700"
                >
                  Pay in full
                </button>
              </div>
              <input
                type="number"
                min="0"
                value={amountPaid}
                onChange={(e) => setAmountPaid(Number(e.target.value))}
                className="w-full mt-1 px-3 py-1.5 rounded-xl border border-emerald-500/40 bg-white dark:bg-zinc-900 font-black text-xl text-emerald-600 dark:text-emerald-400"
              />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Remaining Balance
              </span>
              <p
                className={`text-2xl sm:text-3xl font-black font-cinzel mt-1 ${
                  remainingBalance > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {formatINR(remainingBalance)}
              </p>
              <span className="text-[11px] font-semibold text-zinc-500">
                {remainingBalance > 0 ? 'Pending payout to landlord' : 'Fully Cleared ✅'}
              </span>
            </div>
          </div>

          {/* Payment Details Form */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 text-xs">
            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 rounded-xl border border-amber-500/30 bg-white dark:bg-zinc-900 font-bold"
              >
                <option value="UPI">UPI (Google Pay / PhonePe)</option>
                <option value="Bank Transfer">Bank Transfer (IMPS / NEFT)</option>
                <option value="Cash">Cash</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Payment Date
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-amber-500/30 bg-white dark:bg-zinc-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Transaction / UTR Reference
              </label>
              <input
                type="text"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                placeholder="e.g. UPI/39102847192"
                className="w-full px-3 py-2 rounded-xl border border-amber-500/30 bg-white dark:bg-zinc-900"
              />
            </div>
          </div>
        </div>

        {/* Action Button: Review & Finalize Settlement */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <button
            onClick={() => {
              // Reset to auto-retrieved defaults
              setPreviousDue(0);
              setAdvanceAdjustment(0);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Adjustments</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('receipt')}
              className="px-4 py-2.5 rounded-xl border border-amber-500/40 text-xs font-bold text-amber-700 dark:text-amber-300 hover:bg-amber-500/10 transition-all flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4" />
              <span>Go to Receipts</span>
            </button>

            <button
              onClick={() => setShowConfirmModal(true)}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-xs shadow-lg shadow-amber-500/25 hover:brightness-110 active:scale-95 transition-all"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Review & Finalize Settlement</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation & Review Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-[#FAF8F5] dark:bg-[#181714] rounded-3xl border border-amber-500/40 shadow-2xl p-6 my-8 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-2 pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="p-2.5 rounded-xl bg-amber-500 text-black">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-cinzel text-zinc-900 dark:text-amber-100">
                  Review Monthly Settlement
                </h3>
                <span className="text-xs text-amber-600 font-semibold">
                  {formatMonthYear(currentMonthKey, language)}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="divide-y divide-zinc-200 dark:divide-zinc-800 rounded-2xl bg-white dark:bg-zinc-900/80 p-4 border border-zinc-200 dark:border-zinc-800">
                <div className="py-2 flex justify-between">
                  <span className="text-zinc-500">Monthly Room Rent:</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">{formatINR(rentAmount)}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-zinc-500">Electricity Units ({electricityUnits} @ ₹{electricityRate}):</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">{formatINR(electricityBill)}</span>
                </div>
                {additionalCharges > 0 && (
                  <div className="py-2 flex justify-between">
                    <span className="text-zinc-500">Additional Charges:</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">{formatINR(additionalCharges)}</span>
                  </div>
                )}
                {previousDue > 0 && (
                  <div className="py-2 flex justify-between">
                    <span className="text-rose-500">Previous Dues:</span>
                    <span className="font-bold text-rose-500">+{formatINR(previousDue)}</span>
                  </div>
                )}
                {advanceAdjustment > 0 && (
                  <div className="py-2 flex justify-between">
                    <span className="text-emerald-500">Advance Adjustment:</span>
                    <span className="font-bold text-emerald-500">-{formatINR(advanceAdjustment)}</span>
                  </div>
                )}
                <div className="py-2.5 flex justify-between font-cinzel font-black text-sm text-amber-900 dark:text-amber-300">
                  <span>Grand Total Payable:</span>
                  <span>{formatINR(grandTotal)}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-emerald-600 font-semibold">Amount Paid:</span>
                  <span className="font-extrabold text-emerald-600">{formatINR(amountPaid)}</span>
                </div>
                <div className="py-2.5 flex justify-between font-bold text-sm">
                  <span>Remaining Balance:</span>
                  <span className={remainingBalance > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                    {formatINR(remainingBalance)}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20 text-[11px] leading-relaxed">
                ℹ️ Finalizing this settlement will store the official reconciled figures. You can immediately generate and share the Landlord Payment Receipt or Statement.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 font-bold text-zinc-700 dark:text-zinc-300 text-xs"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={handleFinalizeSettlement}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-xs shadow-md hover:brightness-110 transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Save Settlement</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
