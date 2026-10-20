import React, { useState } from 'react';
import {
  Zap,
  Camera,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  X,
  Save,
  Plus,
  Image as ImageIcon,
} from 'lucide-react';
import { ElectricityRecord } from '../types';
import { formatINR, formatMonthYear, formatDate, getTodayDate } from '../utils/formatters';

interface ElectricityViewProps {
  currentMonthKey: string;
  electricity: ElectricityRecord[];
  onSaveElectricity: (record: ElectricityRecord) => void;
  onDeleteElectricity: (id: string) => void;
  defaultRate: number;
  language: 'en' | 'hi';
}

export const ElectricityView: React.FC<ElectricityViewProps> = ({
  currentMonthKey,
  electricity,
  onSaveElectricity,
  onDeleteElectricity,
  defaultRate = 7,
  language,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // Current month's record
  const currentElec = electricity.find((e) => e.monthKey === currentMonthKey);

  // Find previous month's final reading to auto carry forward
  const sortedByDate = [...electricity].sort((a, b) => (b.monthKey > a.monthKey ? 1 : -1));
  const previousRecord = sortedByDate.find((e) => e.monthKey < currentMonthKey);
  const autoSuggestedPrevReading = previousRecord ? previousRecord.currentReading : 1250;

  // Form State
  const [formData, setFormData] = useState<ElectricityRecord>({
    id: currentElec?.id || `elec-${currentMonthKey}`,
    monthKey: currentElec?.monthKey || currentMonthKey,
    previousReading: currentElec?.previousReading ?? autoSuggestedPrevReading,
    currentReading: currentElec?.currentReading ?? (autoSuggestedPrevReading + 90),
    unitsConsumed: currentElec?.unitsConsumed ?? 90,
    ratePerUnit: currentElec?.ratePerUnit || defaultRate || 7,
    totalAmount: currentElec?.totalAmount ?? (90 * 7),
    readingDate: currentElec?.readingDate || getTodayDate(),
    meterPhoto: currentElec?.meterPhoto || '',
    notes: currentElec?.notes || '',
    updatedAt: new Date().toISOString(),
  });

  const handleOpenEdit = (existing?: ElectricityRecord) => {
    if (existing) {
      setFormData(existing);
    } else {
      const prev = autoSuggestedPrevReading;
      const curr = prev + 90;
      const rate = defaultRate || 7;
      setFormData({
        id: `elec-${currentMonthKey}`,
        monthKey: currentMonthKey,
        previousReading: prev,
        currentReading: curr,
        unitsConsumed: curr - prev,
        ratePerUnit: rate,
        totalAmount: (curr - prev) * rate,
        readingDate: getTodayDate(),
        meterPhoto: '',
        notes: '',
        updatedAt: new Date().toISOString(),
      });
    }
    setIsEditing(true);
  };

  const handleReadingChange = (prev: number, curr: number, rate: number) => {
    const units = Math.max(0, curr - prev);
    const amount = units * rate;
    setFormData((old) => ({
      ...old,
      previousReading: prev,
      currentReading: curr,
      unitsConsumed: units,
      ratePerUnit: rate,
      totalAmount: amount,
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, meterPhoto: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.currentReading < formData.previousReading) {
      const confirmNegative = window.confirm(
        'Warning: Current Reading is LESS than Previous Reading. If your meter was replaced or reset, click OK to proceed anyway.'
      );
      if (!confirmNegative) return;
    }

    onSaveElectricity({
      ...formData,
      previousReading: Number(formData.previousReading),
      currentReading: Number(formData.currentReading),
      unitsConsumed: Number(formData.unitsConsumed),
      ratePerUnit: Number(formData.ratePerUnit),
      totalAmount: Number(formData.totalAmount),
      updatedAt: new Date().toISOString(),
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 pb-24 max-w-5xl mx-auto px-4 pt-4">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
              <Zap className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-cinzel text-zinc-900 dark:text-amber-100">
              Electricity Bill Calculator
            </h2>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Calculate units consumed, apply fixed rate of ₹{defaultRate}/unit, attach meter photos
          </p>
        </div>

        <button
          onClick={() => handleOpenEdit(currentElec)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-xs shadow-md shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all"
        >
          {currentElec ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{currentElec ? 'Update This Month Reading' : 'Log This Month Reading'}</span>
        </button>
      </div>

      {/* Live Calculation Display Card */}
      <div className="rounded-3xl p-6 bg-white dark:bg-[#1A1916] border border-amber-500/30 shadow-lg relative overflow-hidden">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#D4AF37]">
              Electricity Statement For
            </span>
            <h3 className="text-2xl font-extrabold font-cinzel text-zinc-900 dark:text-amber-100 mt-0.5">
              {formatMonthYear(currentMonthKey, language)}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
              Rate: ₹{currentElec?.ratePerUnit || defaultRate} / Unit
            </span>
          </div>
        </div>

        {currentElec ? (
          <div className="mt-6 space-y-6">
            {/* Visual Formula Pipeline */}
            <div className="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/20">
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-700 dark:text-amber-400">
                Formula Breakdown: Units = Current − Previous | Total = Units × ₹{currentElec.ratePerUnit}
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800">
                  <span className="text-[10px] text-zinc-400 uppercase font-semibold">Previous Reading</span>
                  <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {currentElec.previousReading}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800">
                  <span className="text-[10px] text-zinc-400 uppercase font-semibold">Current Reading</span>
                  <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {currentElec.currentReading}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800">
                  <span className="text-[10px] text-zinc-400 uppercase font-semibold">Units Consumed</span>
                  <p className="text-lg font-extrabold text-amber-600 dark:text-amber-400">
                    {currentElec.unitsConsumed} <span className="text-xs font-normal">units</span>
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-amber-500 text-black border border-amber-400 shadow-sm">
                  <span className="text-[10px] text-zinc-900/80 uppercase font-bold">Total Electricity Bill</span>
                  <p className="text-xl font-black">
                    {formatINR(currentElec.totalAmount)}
                  </p>
                </div>
              </div>
            </div>

            {/* Reading Details & Photo Attachment Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-zinc-600 dark:text-zinc-400">Reading Date:</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">{formatDate(currentElec.readingDate)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-zinc-600 dark:text-zinc-400">Rate Charged:</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">₹{currentElec.ratePerUnit} per kWh unit</span>
                </div>
                {currentElec.notes && (
                  <div className="pt-1 text-zinc-600 dark:text-zinc-400 italic">
                    Notes: {currentElec.notes}
                  </div>
                )}
              </div>

              {/* Photo Preview if attached */}
              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800 flex items-center justify-between">
                {currentElec.meterPhoto ? (
                  <div className="flex items-center gap-3">
                    <img
                      src={currentElec.meterPhoto}
                      alt="Meter reading"
                      onClick={() => setSelectedPhoto(currentElec.meterPhoto || null)}
                      className="w-14 h-14 object-cover rounded-xl border border-amber-500/40 cursor-pointer hover:opacity-90"
                    />
                    <div>
                      <p className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        Meter Photo Attached
                      </p>
                      <button
                        onClick={() => setSelectedPhoto(currentElec.meterPhoto || null)}
                        className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold hover:underline mt-0.5"
                      >
                        Click to view full photo
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-zinc-400">
                    <ImageIcon className="w-6 h-6 opacity-40" />
                    <span>No meter photo attached for this month.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => handleOpenEdit(currentElec)}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold text-xs hover:bg-amber-500/25 transition-all flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Reading</span>
              </button>
              <button
                onClick={() => onDeleteElectricity(currentElec.id)}
                className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-xs hover:bg-rose-500/20 transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-6 text-center py-8 bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl border border-dashed border-amber-500/30">
            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              No meter reading logged for {formatMonthYear(currentMonthKey, language)}
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              Auto-carry forward will suggest Previous Reading: <strong>{autoSuggestedPrevReading}</strong>
            </p>
            <button
              onClick={() => handleOpenEdit()}
              className="mt-4 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-xs shadow-md hover:brightness-110 active:scale-95 transition-all"
            >
              + Log Reading for {formatMonthYear(currentMonthKey, language)}
            </button>
          </div>
        )}
      </div>

      {/* Historical Electricity Logs */}
      <div className="rounded-3xl p-6 bg-white dark:bg-[#1A1916] border border-amber-500/20 shadow-sm">
        <h3 className="text-sm font-bold tracking-wider font-cinzel text-zinc-900 dark:text-amber-200 uppercase mb-4 flex items-center gap-2">
          <span>Electricity Reading History</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 font-normal">
            {sortedByDate.length} records
          </span>
        </h3>

        <div className="space-y-3">
          {sortedByDate.map((item) => {
            const isSelected = item.monthKey === currentMonthKey;
            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isSelected
                    ? 'border-amber-500/60 bg-amber-500/5 dark:bg-amber-950/20 shadow-xs'
                    : 'border-zinc-200/70 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:border-amber-500/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 shrink-0">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 font-cinzel">
                        {formatMonthYear(item.monthKey, language)}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500 text-black">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Reading: {item.previousReading} → {item.currentReading} ({item.unitsConsumed} units @ ₹{item.ratePerUnit})
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800">
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
                      {formatINR(item.totalAmount)}
                    </span>
                    <p className="text-[10px] text-zinc-400">{formatDate(item.readingDate)}</p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.meterPhoto && (
                      <button
                        onClick={() => setSelectedPhoto(item.meterPhoto || null)}
                        title="View Photo"
                        className="p-2 rounded-xl bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 transition-all"
                      >
                        <ImageIcon className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleOpenEdit(item)}
                      title="Edit"
                      className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-amber-500/20 hover:text-amber-600 transition-all"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteElectricity(item.id)}
                      title="Delete"
                      className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-rose-500/20 hover:text-rose-600 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit / Log Electricity Modal Form */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-[#FAF8F5] dark:bg-[#181714] rounded-3xl border border-amber-500/40 shadow-2xl p-6 my-8 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-yellow-500 text-black">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-cinzel text-zinc-900 dark:text-amber-100">
                    Electricity Meter Reading
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
              {/* Billing Month & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Billing Month *
                  </label>
                  <input
                    type="month"
                    required
                    value={formData.monthKey}
                    onChange={(e) => setFormData({ ...formData, monthKey: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-amber-500/30 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Meter Reading Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.readingDate}
                    onChange={(e) => setFormData({ ...formData, readingDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-amber-500/30 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Meter Readings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-zinc-700 dark:text-zinc-300">
                      Previous Reading *
                    </label>
                    <span className="text-[10px] text-amber-600">Auto-carried</span>
                  </div>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.previousReading}
                    onChange={(e) =>
                      handleReadingChange(
                        Number(e.target.value),
                        formData.currentReading,
                        formData.ratePerUnit
                      )
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-amber-500/30 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Current Reading *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.currentReading}
                    onChange={(e) =>
                      handleReadingChange(
                        formData.previousReading,
                        Number(e.target.value),
                        formData.ratePerUnit
                      )
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-amber-500/30 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Rate & Auto-computed Units */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Rate (₹/Unit)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    value={formData.ratePerUnit}
                    onChange={(e) =>
                      handleReadingChange(
                        formData.previousReading,
                        formData.currentReading,
                        Number(e.target.value)
                      )
                    }
                    className="w-full px-3 py-2 rounded-xl border border-amber-500/30 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-bold"
                  />
                </div>

                <div>
                  <span className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Units Consumed
                  </span>
                  <div className="py-2 px-3 rounded-xl bg-white dark:bg-zinc-900 font-extrabold text-amber-700 dark:text-amber-300 border border-amber-500/30">
                    {formData.unitsConsumed} units
                  </div>
                </div>

                <div>
                  <span className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Total Amount
                  </span>
                  <div className="py-2 px-3 rounded-xl bg-amber-500 text-black font-extrabold">
                    {formatINR(formData.totalAmount)}
                  </div>
                </div>
              </div>

              {/* Photo Upload Attachment */}
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-amber-500" />
                  <span>Attach Meter Photo (Optional)</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoUpload}
                    id="meter-photo-input"
                    className="hidden"
                  />
                  <label
                    htmlFor="meter-photo-input"
                    className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold border border-zinc-300 dark:border-zinc-700 hover:border-amber-500 cursor-pointer flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Take Photo / Upload</span>
                  </label>

                  {formData.meterPhoto && (
                    <div className="relative">
                      <img
                        src={formData.meterPhoto}
                        alt="Preview"
                        className="w-12 h-12 object-cover rounded-xl border border-amber-500"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, meterPhoto: '' })}
                        className="absolute -top-1.5 -right-1.5 p-0.5 bg-rose-500 text-white rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Notes / Observations
                </label>
                <input
                  type="text"
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Higher consumption due to guest stay"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-amber-500/30 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold shadow-md shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Meter Reading</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full Photo Preview Lightbox */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs cursor-pointer"
        >
          <div className="relative max-w-xl max-h-[90vh]">
            <img
              src={selectedPhoto}
              alt="Meter full preview"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl border border-amber-500/50 shadow-2xl"
            />
            <button
              onClick={() => setSelectedPhoto(null)}
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
