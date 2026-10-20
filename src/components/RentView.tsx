import React, { useState } from 'react';
import {
  Building,
  CheckCircle2,
  Clock,
  Edit2,
  Plus,
  Trash2,
  AlertTriangle,
  Phone,
  MapPin,
  CreditCard,
  X,
  Save,
} from 'lucide-react';
import { AppProfile, PaymentMethod, PaymentStatus, RentRecord } from '../types';
import { formatINR, formatMonthYear, formatDate, getTodayDate } from '../utils/formatters';

interface RentViewProps {
  currentMonthKey: string;
  rents: RentRecord[];
  onSaveRent: (record: RentRecord) => void;
  onDeleteRent: (id: string) => void;
  profile: AppProfile;
  language: 'en' | 'hi';
}

export const RentView: React.FC<RentViewProps> = ({
  currentMonthKey,
  rents,
  onSaveRent,
  onDeleteRent,
  profile,
  language,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Current month's rent record
  const currentRent = rents.find((r) => r.monthKey === currentMonthKey);

  // Form State
  const [formData, setFormData] = useState<RentRecord>({
    id: currentRent?.id || `rent-${currentMonthKey}`,
    monthKey: currentRent?.monthKey || currentMonthKey,
    tenantName: currentRent?.tenantName || profile.tenantName,
    landlordName: currentRent?.landlordName || profile.landlordName,
    landlordMobile: currentRent?.landlordMobile || profile.landlordMobile,
    roomAddress: currentRent?.roomAddress || profile.roomAddress,
    monthlyRent: currentRent?.monthlyRent || profile.defaultRent || 9500,
    dueDate: currentRent?.dueDate || `${currentMonthKey}-05`,
    paymentDate: currentRent?.paymentDate || '',
    paymentMethod: currentRent?.paymentMethod || 'UPI',
    transactionRef: currentRent?.transactionRef || '',
    paymentStatus: currentRent?.paymentStatus || 'Pending',
    amountPaid: currentRent?.amountPaid || 0,
    additionalCharges: currentRent?.additionalCharges || 0,
    additionalChargesNote: currentRent?.additionalChargesNote || '',
    remarks: currentRent?.remarks || '',
    updatedAt: new Date().toISOString(),
  });

  const handleOpenEdit = (existing?: RentRecord) => {
    if (existing) {
      setFormData(existing);
    } else {
      setFormData({
        id: `rent-${currentMonthKey}`,
        monthKey: currentMonthKey,
        tenantName: profile.tenantName,
        landlordName: profile.landlordName,
        landlordMobile: profile.landlordMobile,
        roomAddress: profile.roomAddress,
        monthlyRent: profile.defaultRent || 9500,
        dueDate: `${currentMonthKey}-05`,
        paymentDate: '',
        paymentMethod: 'UPI',
        transactionRef: '',
        paymentStatus: 'Pending',
        amountPaid: 0,
        additionalCharges: 0,
        additionalChargesNote: '',
        remarks: '',
        updatedAt: new Date().toISOString(),
      });
    }
    setIsEditing(true);
  };

  const handleStatusChange = (status: PaymentStatus) => {
    let paid = formData.amountPaid;
    const totalDue = Number(formData.monthlyRent || 0) + Number(formData.additionalCharges || 0);

    if (status === 'Paid') {
      paid = totalDue;
      if (!formData.paymentDate) {
        setFormData((prev) => ({ ...prev, paymentDate: getTodayDate() }));
      }
    } else if (status === 'Pending') {
      paid = 0;
    }
    setFormData((prev) => ({ ...prev, paymentStatus: status, amountPaid: paid }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tenantName || !formData.landlordName || formData.monthlyRent <= 0) {
      alert('Please fill in mandatory fields: Tenant Name, Landlord Name, and Rent Amount.');
      return;
    }

    onSaveRent({
      ...formData,
      monthlyRent: Number(formData.monthlyRent),
      amountPaid: Number(formData.amountPaid),
      additionalCharges: Number(formData.additionalCharges || 0),
      updatedAt: new Date().toISOString(),
    });
    setIsEditing(false);
  };

  // Rent history sorted descending
  const sortedRents = [...rents].sort((a, b) => (b.monthKey > a.monthKey ? 1 : -1));

  return (
    <div className="space-y-6 pb-24 max-w-5xl mx-auto px-4 pt-4">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Building className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-cinzel text-zinc-900 dark:text-amber-100">
              Room Rent Management
            </h2>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Track monthly room rent, payment dates, landlord details, and receipts
          </p>
        </div>

        <button
          onClick={() => handleOpenEdit(currentRent)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-xs shadow-md shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all"
        >
          {currentRent ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{currentRent ? 'Edit This Month Rent' : 'Record This Month Rent'}</span>
        </button>
      </div>

      {/* Active Month Rent Card */}
      <div className="rounded-3xl p-6 bg-white dark:bg-[#1A1916] border border-amber-500/30 shadow-lg relative overflow-hidden">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#D4AF37]">
              Current Selected Billing Month
            </span>
            <h3 className="text-2xl font-extrabold font-cinzel text-zinc-900 dark:text-amber-100 mt-0.5">
              {formatMonthYear(currentMonthKey, language)}
            </h3>
          </div>

          {currentRent && (
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  currentRent.paymentStatus === 'Paid'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                    : currentRent.paymentStatus === 'Partial'
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                }`}
              >
                {currentRent.paymentStatus}
              </span>
            </div>
          )}
        </div>

        {currentRent ? (
          <div className="mt-6 space-y-4">
            {/* Financial Details Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/50 dark:border-zinc-800">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-semibold">Monthly Rent</span>
                <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {formatINR(currentRent.monthlyRent)}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-semibold">Additional Charges</span>
                <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {formatINR(currentRent.additionalCharges || 0)}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-semibold">Amount Paid</span>
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {formatINR(currentRent.amountPaid)}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-semibold">Balance Due</span>
                <p
                  className={`text-lg font-bold ${
                    currentRent.monthlyRent + (currentRent.additionalCharges || 0) - currentRent.amountPaid > 0
                      ? 'text-rose-500'
                      : 'text-emerald-500'
                  }`}
                >
                  {formatINR(
                    Math.max(
                      0,
                      currentRent.monthlyRent + (currentRent.additionalCharges || 0) - currentRent.amountPaid
                    )
                  )}
                </p>
              </div>
            </div>

            {/* Tenancy & Payment Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2 p-3.5 rounded-2xl bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/15">
                <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                  <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="font-semibold">Room Address:</span>
                  <span className="truncate">{currentRent.roomAddress}</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                  <Phone className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="font-semibold">Landlord:</span>
                  <span>{currentRent.landlordName} ({currentRent.landlordMobile || 'No mobile'})</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                  <span className="font-semibold">Tenant:</span>
                  <span>{currentRent.tenantName}</span>
                </div>
              </div>

              <div className="space-y-2 p-3.5 rounded-2xl bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/15">
                <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                  <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="font-semibold">Rent Due Date:</span>
                  <span>{formatDate(currentRent.dueDate)}</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                  <CreditCard className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="font-semibold">Payment Method:</span>
                  <span>{currentRent.paymentMethod} {currentRent.transactionRef ? `(${currentRent.transactionRef})` : ''}</span>
                </div>
                {currentRent.paymentDate && (
                  <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="font-semibold">Paid On:</span>
                    <span>{formatDate(currentRent.paymentDate)}</span>
                  </div>
                )}
              </div>
            </div>

            {currentRent.remarks && (
              <p className="text-xs italic text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/40 p-2.5 rounded-xl border border-zinc-200/50 dark:border-zinc-800">
                Remarks: {currentRent.remarks}
              </p>
            )}

            {/* Quick Actions for Current Rent */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => handleOpenEdit(currentRent)}
                className="px-3 py-1.5 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold text-xs hover:bg-amber-500/25 transition-all flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => setDeleteConfirmId(currentRent.id)}
                className="px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-xs hover:bg-rose-500/20 transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-6 text-center py-8 bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl border border-dashed border-amber-500/30">
            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              No rent record logged for {formatMonthYear(currentMonthKey, language)}
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              Add rent details to calculate settlement and generate landlord statements.
            </p>
            <button
              onClick={() => handleOpenEdit()}
              className="mt-4 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-xs shadow-md hover:brightness-110 active:scale-95 transition-all"
            >
              + Create Record for {formatMonthYear(currentMonthKey, language)}
            </button>
          </div>
        )}
      </div>

      {/* Monthly Rent History List */}
      <div className="rounded-3xl p-6 bg-white dark:bg-[#1A1916] border border-amber-500/20 shadow-sm">
        <h3 className="text-sm font-bold tracking-wider font-cinzel text-zinc-900 dark:text-amber-200 uppercase mb-4 flex items-center gap-2">
          <span>Rent Payment History</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 font-normal">
            {sortedRents.length} months
          </span>
        </h3>

        <div className="space-y-3">
          {sortedRents.map((item) => {
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
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                    <Building className="w-5 h-5" />
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
                      Due: {formatDate(item.dueDate)} • {item.paymentMethod}
                      {item.paymentDate ? ` (Paid on ${formatDate(item.paymentDate)})` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800">
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
                      {formatINR(item.monthlyRent + (item.additionalCharges || 0))}
                    </span>
                    <div className="flex items-center justify-end gap-1 mt-0.5">
                      <span
                        className={`text-[11px] font-bold ${
                          item.paymentStatus === 'Paid'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : item.paymentStatus === 'Partial'
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-rose-500'
                        }`}
                      >
                        {item.paymentStatus}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      title="Edit Record"
                      className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-amber-500/20 hover:text-amber-600 transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(item.id)}
                      title="Delete Record"
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

      {/* Add / Edit Rent Modal Form */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-[#FAF8F5] dark:bg-[#181714] rounded-3xl border border-amber-500/40 shadow-2xl p-6 my-8 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500 text-black">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-cinzel text-zinc-900 dark:text-amber-100">
                    {formData.id && rents.some((r) => r.id === formData.id) ? 'Edit Rent Record' : 'Record New Rent'}
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
              {/* Billing Month Selector */}
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  Billing Month & Year *
                </label>
                <input
                  type="month"
                  required
                  value={formData.monthKey}
                  onChange={(e) => setFormData({ ...formData, monthKey: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-amber-500/30 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Tenant & Landlord Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Tenant Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.tenantName}
                    onChange={(e) => setFormData({ ...formData, tenantName: e.target.value })}
                    placeholder="e.g. Abhishek Ranjan"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-amber-500/30 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Landlord Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.landlordName}
                    onChange={(e) => setFormData({ ...formData, landlordName: e.target.value })}
                    placeholder="e.g. Rajesh Sharma"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-amber-500/30 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Landlord Phone & Room Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Landlord Mobile
                  </label>
                  <input
                    type="tel"
                    value={formData.landlordMobile}
                    onChange={(e) => setFormData({ ...formData, landlordMobile: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-amber-500/30 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Room No / Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.roomAddress}
                    onChange={(e) => setFormData({ ...formData, roomAddress: e.target.value })}
                    placeholder="Flat 302, Royal Residency"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-amber-500/30 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Rent Amount & Additional Charges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Monthly Rent Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.monthlyRent}
                    onChange={(e) => setFormData({ ...formData, monthlyRent: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-amber-500/30 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Additional Charges (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.additionalCharges || 0}
                    onChange={(e) => setFormData({ ...formData, additionalCharges: Number(e.target.value) })}
                    placeholder="Maintenance / Water"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-amber-500/30 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Payment Status Pill Selector */}
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Payment Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Paid', 'Partial', 'Pending'] as PaymentStatus[]).map((st) => (
                    <button
                      type="button"
                      key={st}
                      onClick={() => handleStatusChange(st)}
                      className={`py-2 rounded-xl font-bold text-xs border transition-all ${
                        formData.paymentStatus === st
                          ? st === 'Paid'
                            ? 'bg-emerald-500 text-black border-emerald-500 shadow-sm'
                            : st === 'Partial'
                            ? 'bg-amber-500 text-black border-amber-500 shadow-sm'
                            : 'bg-rose-500 text-white border-rose-500 shadow-sm'
                          : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-amber-500'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount Paid & Payment Date (if paid / partial) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Amount Paid (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.amountPaid}
                    onChange={(e) => setFormData({ ...formData, amountPaid: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-amber-500/30 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Payment Date
                  </label>
                  <input
                    type="date"
                    value={formData.paymentDate}
                    onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-amber-500/30 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Due Date & Payment Method */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Rent Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
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
                    <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                    <option value="Bank Transfer">Bank Transfer (IMPS / NEFT)</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
              </div>

              {/* Transaction Ref & Remarks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Transaction Reference No.
                  </label>
                  <input
                    type="text"
                    value={formData.transactionRef || ''}
                    onChange={(e) => setFormData({ ...formData, transactionRef: e.target.value })}
                    placeholder="e.g. UPI/623819284719"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-amber-500/30 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Remarks / Notes
                  </label>
                  <input
                    type="text"
                    value={formData.remarks || ''}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    placeholder="e.g. Paid on 4th via GPay"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-amber-500/30 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
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
                  <span>Save Rent Record</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-[#181714] rounded-3xl p-6 border border-rose-500/40 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-500">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Delete Rent Record?
              </h3>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Are you sure you want to delete this rent entry? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteRent(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-all"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
