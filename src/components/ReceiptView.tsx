import React, { useState, useRef } from 'react';
import {
  Receipt,
  Download,
  Share2,
  Printer,
  MessageSquare,
  Eye,
  CheckCircle2,
  Clock,
  Building,
  Zap,
  MapPin,
  Calendar,
  CreditCard,
  Save,
  ArrowRight,
  Shield,
  FileCheck,
  Plus,
  Minus,
  Tag,
} from 'lucide-react';
import {
  ActiveTab,
  AppProfile,
  ElectricityRecord,
  FinalSettlement,
  ReceiptRecord,
  RentRecord,
} from '../types';
import {
  formatINR,
  formatMonthYear,
  formatDate,
  getTodayDate,
  generateWhatsAppMessage,
  numberToWordsINR,
} from '../utils/formatters';
import { generateReceiptPDF, downloadBlob } from '../utils/pdfGenerator';
import { CatMascot } from './CatMascot';

interface ReceiptViewProps {
  currentMonthKey: string;
  rents: RentRecord[];
  electricity: ElectricityRecord[];
  settlements: FinalSettlement[];
  receipts: ReceiptRecord[];
  onSaveReceipt: (receipt: ReceiptRecord) => void;
  onNavigate?: (tab: ActiveTab) => void;
  profile: AppProfile;
  language: 'en' | 'hi';
}

export const ReceiptView: React.FC<ReceiptViewProps> = ({
  currentMonthKey,
  rents,
  electricity,
  settlements,
  receipts,
  onSaveReceipt,
  onNavigate,
  profile,
  language,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Month data
  const currentRent = rents.find((r) => r.monthKey === currentMonthKey);
  const currentElec = electricity.find((e) => e.monthKey === currentMonthKey);
  const currentSettle = settlements.find((s) => s.monthKey === currentMonthKey);

  // Determine financial data
  const tenantName = currentRent?.tenantName || profile.tenantName;
  const landlordName = currentRent?.landlordName || profile.landlordName;
  const landlordMobile = currentRent?.landlordMobile || profile.landlordMobile;
  const roomAddress = currentRent?.roomAddress || profile.roomAddress;

  const monthlyRent = currentSettle ? currentSettle.rentAmount : currentRent?.monthlyRent || profile.defaultRent || 9500;
  const previousReading = currentSettle ? currentSettle.previousReading : currentElec?.previousReading || 1250;
  const currentReading = currentSettle ? currentSettle.currentReading : currentElec?.currentReading || 1340;
  const unitsConsumed = currentSettle ? currentSettle.electricityUnits : currentElec?.unitsConsumed || (currentReading - previousReading);
  const ratePerUnit = currentSettle ? currentSettle.electricityRate : currentElec?.ratePerUnit || 7;
  const electricityBill = currentSettle ? currentSettle.electricityBill : currentElec?.totalAmount || (unitsConsumed * ratePerUnit);
  const additionalCharges = currentSettle ? currentSettle.additionalCharges : currentRent?.additionalCharges || 0;

  // Add / Deduct Adjustment State (+/- for dues or extra cash deposit)
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'deduct'>('add');
  const [adjustmentAmount, setAdjustmentAmount] = useState<number>(0);
  const [adjustmentReason, setAdjustmentReason] = useState<string>('');

  // Sync adjustment values from settlement or rent record when month changes
  React.useEffect(() => {
    if (currentSettle) {
      if (currentSettle.adjustmentAmount !== undefined && currentSettle.adjustmentAmount > 0) {
        setAdjustmentType(currentSettle.adjustmentType || 'add');
        setAdjustmentAmount(currentSettle.adjustmentAmount);
        setAdjustmentReason(currentSettle.adjustmentReason || '');
      } else if (currentSettle.advanceAdjustment > 0) {
        setAdjustmentType('deduct');
        setAdjustmentAmount(currentSettle.advanceAdjustment);
        setAdjustmentReason('Advance deposit adjustment');
      } else if (currentSettle.previousDue > 0) {
        setAdjustmentType('add');
        setAdjustmentAmount(currentSettle.previousDue);
        setAdjustmentReason('Previous unpaid dues');
      } else {
        setAdjustmentType('add');
        setAdjustmentAmount(0);
        setAdjustmentReason('');
      }
    } else {
      setAdjustmentType('add');
      setAdjustmentAmount(0);
      setAdjustmentReason('');
    }
  }, [currentMonthKey, currentSettle]);

  const effectiveAdjustment =
    adjustmentType === 'deduct' ? -Math.abs(adjustmentAmount) : Math.abs(adjustmentAmount);

  const grandTotal = Math.max(
    0,
    monthlyRent + electricityBill + additionalCharges + effectiveAdjustment
  );

  const amountPaid = currentSettle ? currentSettle.amountPaid : currentRent?.amountPaid || 0;
  const remainingBalance = Math.max(0, grandTotal - amountPaid);

  const paymentStatus = remainingBalance <= 0 && grandTotal > 0 ? 'Paid' : amountPaid > 0 ? 'Partial' : 'Pending';

  // Dynamic receipt document title
  const receiptTitle = paymentStatus === 'Paid' ? 'RENT PAYMENT RECEIPT' : 'MONTHLY RENT & ELECTRICITY STATEMENT';

  const receiptNumber = `ARA-${currentMonthKey.replace('-', '')}-001`;
  const generatedDate = getTodayDate();
  const paymentDate = currentSettle?.paymentDate || currentRent?.paymentDate || (paymentStatus === 'Paid' ? generatedDate : '');
  const paymentMethod = currentSettle?.paymentMethod || currentRent?.paymentMethod || 'UPI';
  const transactionRef = currentSettle?.transactionRef || currentRent?.transactionRef || '';

  const activeReceiptData: ReceiptRecord = {
    id: `receipt-${currentMonthKey}`,
    receiptNumber,
    monthKey: currentMonthKey,
    title: receiptTitle,
    generatedDate,
    tenantName,
    landlordName,
    landlordMobile,
    roomAddress,
    monthlyRent,
    previousReading,
    currentReading,
    unitsConsumed,
    ratePerUnit,
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
    paymentStatus,
    paymentDate,
    paymentMethod,
    transactionRef,
    remarks: currentRent?.remarks || 'Generated via AVHII RENT APP by Abhishek Ranjan',
  };

  // 1. Download PDF Action
  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      const res = await generateReceiptPDF('a4-receipt-document', activeReceiptData);
      if (res.success && res.blob) {
        downloadBlob(res.blob, res.filename);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // 2. Share via WhatsApp Action
  const handleShareWhatsApp = async () => {
    const text = generateWhatsAppMessage({
      tenantName,
      landlordName,
      monthName: formatMonthYear(currentMonthKey, language),
      roomAddress,
      monthlyRent,
      electricityUnits: unitsConsumed,
      electricityBill,
      additionalCharges,
      adjustmentType,
      adjustmentAmount,
      adjustmentReason,
      grandTotal,
      amountPaid,
      remainingBalance,
      status: paymentStatus,
    });

    const encoded = encodeURIComponent(text);
    const cleanPhone = landlordMobile.replace(/[^0-9]/g, '');
    const url = cleanPhone.length >= 10
      ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encoded}`
      : `https://api.whatsapp.com/send?text=${encoded}`;

    window.open(url, '_blank');
  };

  // 3. Share using Android Share Menu (Web Share API)
  const handleAndroidShare = async () => {
    const text = generateWhatsAppMessage({
      tenantName,
      landlordName,
      monthName: formatMonthYear(currentMonthKey, language),
      roomAddress,
      monthlyRent,
      electricityUnits: unitsConsumed,
      electricityBill,
      additionalCharges,
      adjustmentType,
      adjustmentAmount,
      adjustmentReason,
      grandTotal,
      amountPaid,
      remainingBalance,
      status: paymentStatus,
    });

    if (navigator.share) {
      try {
        // Try sharing PDF file if supported
        const pdfRes = await generateReceiptPDF('a4-receipt-document', activeReceiptData);
        if (pdfRes.success && pdfRes.blob && navigator.canShare && navigator.canShare({ files: [new File([pdfRes.blob], pdfRes.filename, { type: 'application/pdf' })] })) {
          const file = new File([pdfRes.blob], pdfRes.filename, { type: 'application/pdf' });
          await navigator.share({
            title: receiptTitle,
            text,
            files: [file],
          });
          return;
        }

        // Fallback to text share
        await navigator.share({
          title: receiptTitle,
          text,
        });
      } catch (e) {
        console.log('Share canceled or failed', e);
      }
    } else {
      // Fallback: Copy WhatsApp text to clipboard
      navigator.clipboard.writeText(text);
      alert('Statement details copied to clipboard! You can paste in any app.');
    }
  };

  // 4. Print Action
  const handlePrint = () => {
    window.print();
  };

  // 5. Save in Receipt History Action
  const handleSaveToHistory = () => {
    onSaveReceipt(activeReceiptData);
    setSaveSuccessMsg('Receipt successfully saved to history archives!');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto px-4 pt-4">
      {/* Statement Type Switcher */}
      <div className="flex items-center gap-2 p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 w-fit no-print">
        <button
          className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500 text-black shadow-xs flex items-center gap-1.5"
        >
          <Building className="w-3.5 h-3.5" />
          <span>Room Rent & Power Statement</span>
        </button>
        {onNavigate && (
          <button
            onClick={() => onNavigate('ration')}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1.5 transition-colors"
          >
            <span>🛒 House Ration Statement (Separate)</span>
          </button>
        )}
      </div>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Receipt className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-cinzel text-zinc-900 dark:text-amber-100">
              Landlord Statement & Receipt
            </h2>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Official A4 document for {formatMonthYear(currentMonthKey, language)}
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-xs shadow-md shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>{isGenerating ? 'Generating...' : 'Download PDF'}</span>
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 active:scale-95 transition-all shadow-sm"
          >
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp</span>
          </button>

          <button
            onClick={handleAndroidShare}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 text-zinc-100 font-bold text-xs hover:bg-zinc-700 active:scale-95 transition-all"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>

          <button
            onClick={handlePrint}
            className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-amber-500/20 hover:text-amber-600 transition-all"
            title="Print Document"
          >
            <Printer className="w-4 h-4" />
          </button>

          <button
            onClick={handleSaveToHistory}
            className="p-2 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 transition-all font-bold text-xs flex items-center gap-1"
            title="Save in History"
          >
            <Save className="w-4 h-4" />
            <span className="hidden sm:inline">Save</span>
          </button>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 no-print">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Interactive Adjustment Control (Add/Deduct +/- dues or extra cash deposit) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-amber-500/30 shadow-xs no-print space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-700/60">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 font-black text-sm">
              +/-
            </span>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-amber-100 flex items-center gap-1.5">
                <span>Add / Deduct (यदि कोई बकाया या एक्स्ट्रा कैश डिपॉजिट हो +/-)</span>
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Adjust dues (+) or extra cash deposit / advance discount (-) in this receipt statement
              </p>
            </div>
          </div>

          {/* Type Toggle: + Add or - Deduct */}
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
            <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
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
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-amber-500/30 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-bold text-xs outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Reason / Note Input */}
          <div className="sm:col-span-8">
            <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
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
              className="w-full px-3 py-2 rounded-xl border border-amber-500/30 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-xs outline-none focus:border-amber-500"
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

      {/* A4 Document Container */}
      <div className="overflow-x-auto pb-4">
        <div
          id="a4-receipt-document"
          className="print-page bg-white text-zinc-900 rounded-3xl p-6 sm:p-10 border-2 border-amber-500/40 shadow-2xl min-w-[340px] max-w-[800px] mx-auto space-y-6 relative overflow-hidden"
          style={{ minHeight: '900px' }}
        >
          {/* Subtle Greek Watermark Emblem in Background */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none -z-0">
            <CatMascot size={380} showGlow={false} withRing={true} />
          </div>

          {/* Greek Key Top Border Ribbon */}
          <div className="w-full h-2.5 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 rounded-full" />

          {/* Document Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b-2 border-amber-500/30">
            <div className="flex items-center gap-3">
              <CatMascot size={58} showGlow={false} />
              <div>
                <h1 className="text-xl sm:text-2xl font-black font-cinzel tracking-wider text-amber-950 flex items-center gap-1.5">
                  <span>AVHII</span>
                  <span className="text-amber-600">RENT APP</span>
                </h1>
                <p className="text-[11px] text-zinc-500 uppercase tracking-widest font-semibold mt-0.5">
                  Official Landlord Payment Statement
                </p>
                <p className="text-[10px] text-zinc-400">
                  Application Engineer: Abhishek Ranjan
                </p>
              </div>
            </div>

            <div className="text-right sm:border-l-2 sm:border-amber-500/20 sm:pl-4">
              <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">
                Document Number
              </span>
              <p className="font-mono text-sm sm:text-base font-extrabold text-amber-800">
                {receiptNumber}
              </p>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Date: <strong>{formatDate(generatedDate)}</strong>
              </p>
            </div>
          </div>

          {/* Statement / Receipt Title Banner */}
          <div className="py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-400/20 to-amber-500/15 border border-amber-500/40 text-center">
            <h2 className="text-base sm:text-lg font-black font-cinzel tracking-widest text-amber-950">
              {receiptTitle}
            </h2>
            <p className="text-xs font-bold text-amber-800 mt-0.5">
              Billing Period: {formatMonthYear(currentMonthKey, language)}
            </p>
          </div>

          {/* Parties Involved Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Tenant Box */}
            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200">
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                Tenant Information
              </span>
              <p className="text-sm font-extrabold text-zinc-900 mt-1">{tenantName}</p>
              <p className="text-zinc-600 mt-1 flex items-start gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span>{roomAddress}</span>
              </p>
            </div>

            {/* Landlord Box */}
            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200">
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                Landlord / Owner Information
              </span>
              <p className="text-sm font-extrabold text-zinc-900 mt-1">{landlordName}</p>
              <p className="text-zinc-600 mt-1 flex items-center gap-1">
                <span className="font-semibold">Phone:</span>
                <span>{landlordMobile || 'Not provided'}</span>
              </p>
              <p className="text-zinc-500 text-[11px] mt-0.5">
                Premises: {roomAddress}
              </p>
            </div>
          </div>

          {/* Financial Breakdown Table */}
          <div className="rounded-2xl border border-zinc-200 overflow-hidden text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-amber-500/15 text-amber-950 border-b border-amber-500/30">
                  <th className="py-2.5 px-4 font-bold uppercase tracking-wider text-[11px]">Particulars</th>
                  <th className="py-2.5 px-4 font-bold uppercase tracking-wider text-[11px]">Reading / Details</th>
                  <th className="py-2.5 px-4 font-bold uppercase tracking-wider text-[11px] text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                <tr>
                  <td className="py-2.5 px-4 font-semibold text-zinc-800">
                    Monthly Room Rent ({formatMonthYear(currentMonthKey, language)})
                  </td>
                  <td className="py-2.5 px-4 text-zinc-500">Fixed Monthly Lease</td>
                  <td className="py-2.5 px-4 font-bold text-zinc-900 text-right">{formatINR(monthlyRent)}</td>
                </tr>

                <tr>
                  <td className="py-2.5 px-4 font-semibold text-zinc-800">
                    Electricity Bill (₹{ratePerUnit}/unit)
                  </td>
                  <td className="py-2.5 px-4 text-zinc-500">
                    Previous: {previousReading} | Current: {currentReading} = <strong>{unitsConsumed} units</strong>
                  </td>
                  <td className="py-2.5 px-4 font-bold text-zinc-900 text-right">{formatINR(electricityBill)}</td>
                </tr>

                {additionalCharges > 0 && (
                  <tr>
                    <td className="py-2.5 px-4 font-semibold text-zinc-800">
                      Additional Charges / Maintenance
                    </td>
                    <td className="py-2.5 px-4 text-zinc-500">Society maintenance / water share</td>
                    <td className="py-2.5 px-4 font-bold text-zinc-900 text-right">+{formatINR(additionalCharges)}</td>
                  </tr>
                )}

                {/* Unified Add / Deduct Adjustment Row in Official Receipt */}
                {adjustmentAmount > 0 && (
                  <tr className={adjustmentType === 'deduct' ? 'bg-emerald-50/70' : 'bg-rose-50/70'}>
                    <td className="py-2.5 px-4 font-bold text-zinc-900">
                      {adjustmentType === 'deduct' ? (
                        <span className="text-emerald-700 flex items-center gap-1.5">
                          <span>➖ Extra Deposit / Cash Advance Deduct</span>
                        </span>
                      ) : (
                        <span className="text-rose-700 flex items-center gap-1.5">
                          <span>➕ Added Dues / Arrears / Extra</span>
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-zinc-700">
                      {adjustmentReason ||
                        (adjustmentType === 'deduct'
                          ? 'Extra cash deposit / advance discount'
                          : 'Carried forward unpaid dues')}
                    </td>
                    <td
                      className={`py-2.5 px-4 font-black text-right text-xs ${
                        adjustmentType === 'deduct' ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {adjustmentType === 'deduct'
                        ? `-${formatINR(adjustmentAmount)}`
                        : `+${formatINR(adjustmentAmount)}`}
                    </td>
                  </tr>
                )}

                <tr className="bg-zinc-50 font-bold border-t-2 border-zinc-300">
                  <td colSpan={2} className="py-3 px-4 text-amber-950 uppercase text-[11px]">
                    Grand Total Payable
                  </td>
                  <td className="py-3 px-4 text-right text-base font-black text-amber-950">
                    {formatINR(grandTotal)}
                  </td>
                </tr>

                <tr>
                  <td colSpan={2} className="py-2.5 px-4 font-bold text-emerald-700">
                    Amount Paid
                  </td>
                  <td className="py-2.5 px-4 text-right font-extrabold text-emerald-700">
                    {formatINR(amountPaid)}
                  </td>
                </tr>

                <tr className="bg-amber-500/10">
                  <td colSpan={2} className="py-2.5 px-4 font-black uppercase text-zinc-900">
                    Remaining Balance Due
                  </td>
                  <td
                    className={`py-2.5 px-4 text-right text-base font-black ${
                      remainingBalance > 0 ? 'text-rose-600' : 'text-emerald-700'
                    }`}
                  >
                    {formatINR(remainingBalance)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Amount in words */}
          <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs">
            <span className="text-zinc-400 font-semibold uppercase text-[10px] block">Amount In Words:</span>
            <p className="font-bold text-zinc-800 italic mt-0.5">
              {numberToWordsINR(amountPaid > 0 ? amountPaid : grandTotal)}
            </p>
          </div>

          {/* Payment Metadata & Remarks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase">Payment Details</span>
              <p className="text-zinc-700">
                Method: <strong>{paymentMethod}</strong>
              </p>
              {paymentDate && (
                <p className="text-zinc-700">
                  Date: <strong>{formatDate(paymentDate)}</strong>
                </p>
              )}
              {transactionRef && (
                <p className="text-zinc-700">
                  Ref / UTR: <strong className="font-mono">{transactionRef}</strong>
                </p>
              )}
            </div>

            <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase">Status & Remarks</span>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    paymentStatus === 'Paid'
                      ? 'bg-emerald-100 text-emerald-800'
                      : paymentStatus === 'Partial'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {paymentStatus}
                </span>
              </div>
              <p className="text-zinc-500 italic text-[11px] mt-1">
                {currentRent?.remarks || 'Valid electronic statement generated for records.'}
              </p>
            </div>
          </div>

          {/* Physical Signatures Section (No fake signatures, clean official line for signature/stamp) */}
          <div className="pt-10 grid grid-cols-2 gap-8 text-center text-xs">
            <div>
              <div className="border-b border-zinc-400 border-dashed w-44 mx-auto mb-1" />
              <p className="font-bold text-zinc-800">{tenantName}</p>
              <p className="text-[10px] text-zinc-400 uppercase">Tenant Signature</p>
            </div>

            <div>
              <div className="border-b border-zinc-400 border-dashed w-44 mx-auto mb-1" />
              <p className="font-bold text-zinc-800">{landlordName}</p>
              <p className="text-[10px] text-zinc-400 uppercase">Landlord / Authorized Signatory</p>
            </div>
          </div>

          {/* Footer Branding Note */}
          <div className="pt-4 text-center border-t border-zinc-200 text-[10px] text-zinc-400">
            This document is systematically generated by AVHII RENT APP • Abhishek Ranjan • Bengaluru
          </div>
        </div>
      </div>
    </div>
  );
};
