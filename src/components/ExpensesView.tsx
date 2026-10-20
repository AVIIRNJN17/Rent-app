import React, { useState } from 'react';
import {
  DollarSign,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  Calendar,
  CreditCard,
  Camera,
  X,
  Save,
  ShoppingBag,
  Utensils,
  Car,
  Flame,
  Smartphone,
  HeartPulse,
  Wrench,
  Zap,
  Tag,
  Image as ImageIcon,
} from 'lucide-react';
import { ExpenseCategory, ExpenseRecord, PaymentMethod } from '../types';
import { formatINR, formatMonthYear, formatDate, getTodayDate } from '../utils/formatters';

interface ExpensesViewProps {
  currentMonthKey: string;
  expenses: ExpenseRecord[];
  onSaveExpense: (expense: ExpenseRecord) => void;
  onDeleteExpense: (id: string) => void;
  language: 'en' | 'hi';
}

const CATEGORIES: Array<{ name: ExpenseCategory; icon: React.ElementType; color: string }> = [
  { name: 'Food & Groceries', icon: Utensils, color: 'text-amber-600 bg-amber-500/10 border-amber-500/30' },
  { name: 'Vegetables', icon: ShoppingBag, color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/30' },
  { name: 'Gas / Cooking', icon: Flame, color: 'text-orange-600 bg-orange-500/10 border-orange-500/30' },
  { name: 'Transportation', icon: Car, color: 'text-blue-600 bg-blue-500/10 border-blue-500/30' },
  { name: 'Mobile Recharge', icon: Smartphone, color: 'text-purple-600 bg-purple-500/10 border-purple-500/30' },
  { name: 'Shopping', icon: Tag, color: 'text-pink-600 bg-pink-500/10 border-pink-500/30' },
  { name: 'Medical', icon: HeartPulse, color: 'text-red-600 bg-red-500/10 border-red-500/30' },
  { name: 'Room Maintenance', icon: Wrench, color: 'text-stone-600 bg-stone-500/10 border-stone-500/30' },
  { name: 'Electricity', icon: Zap, color: 'text-yellow-600 bg-yellow-500/10 border-yellow-500/30' },
  { name: 'Other Expenses', icon: DollarSign, color: 'text-zinc-600 bg-zinc-500/10 border-zinc-500/30' },
];

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  currentMonthKey,
  expenses,
  onSaveExpense,
  onDeleteExpense,
  language,
}) => {
  const [filterPeriod, setFilterPeriod] = useState<'month' | 'week' | 'year' | 'all'>('month');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [viewingPhoto, setViewingPhoto] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<ExpenseRecord>({
    id: `exp-${Date.now()}`,
    title: '',
    amount: 0,
    date: getTodayDate(),
    monthKey: currentMonthKey,
    category: 'Food & Groceries',
    paymentMethod: 'UPI',
    notes: '',
    billPhoto: '',
    createdAt: new Date().toISOString(),
  });

  const handleOpenAdd = (existing?: ExpenseRecord) => {
    if (existing) {
      setFormData(existing);
    } else {
      setFormData({
        id: `exp-${Date.now()}`,
        title: '',
        amount: 0,
        date: getTodayDate(),
        monthKey: currentMonthKey,
        category: 'Food & Groceries',
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
    if (!formData.title || formData.amount <= 0) {
      alert('Please enter a valid expense title and amount.');
      return;
    }

    const monthKey = formData.date.slice(0, 7);
    onSaveExpense({
      ...formData,
      amount: Number(formData.amount),
      monthKey,
    });
    setIsEditing(false);
  };

  // Filter calculations
  const now = new Date();
  const currentYear = now.getFullYear().toString();

  const filteredExpenses = expenses.filter((item) => {
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchCat = item.category.toLowerCase().includes(q);
      const matchNotes = item.notes?.toLowerCase().includes(q);
      if (!matchTitle && !matchCat && !matchNotes) return false;
    }

    // Category filter
    if (selectedCategory !== 'all' && item.category !== selectedCategory) {
      return false;
    }

    // Period filter
    if (filterPeriod === 'month') {
      return item.monthKey === currentMonthKey;
    } else if (filterPeriod === 'year') {
      return item.date.startsWith(currentYear);
    } else if (filterPeriod === 'week') {
      const expDate = new Date(item.date);
      const diffDays = (now.getTime() - expDate.getTime()) / (1000 * 3600 * 24);
      return diffDays >= 0 && diffDays <= 7;
    }
    return true;
  });

  // Sort descending by date
  filteredExpenses.sort((a, b) => (b.date > a.date ? 1 : -1));

  // Category breakdown for chart
  const categoryTotals: Record<string, number> = {};
  filteredExpenses.forEach((exp) => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
  });

  const totalFilteredAmount = filteredExpenses.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-6 pb-24 max-w-5xl mx-auto px-4 pt-4">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-cinzel text-zinc-900 dark:text-amber-100">
              Personal Expense Tracker
            </h2>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Track daily groceries, cooking gas, transport, bills, and attach receipts
          </p>
        </div>

        <button
          onClick={() => handleOpenAdd()}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-xs shadow-md shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Expense</span>
        </button>
      </div>

      {/* Summary Stat & Period Selector */}
      <div className="rounded-3xl p-6 bg-white dark:bg-[#1A1916] border border-amber-500/30 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#D4AF37]">
              {filterPeriod === 'month'
                ? `Total for ${formatMonthYear(currentMonthKey, language)}`
                : filterPeriod === 'week'
                ? 'Last 7 Days Outflow'
                : filterPeriod === 'year'
                ? `Year ${currentYear} Outflow`
                : 'All-Time Outflow'}
            </span>
            <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-1">
              {formatINR(totalFilteredAmount)}
            </div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {filteredExpenses.length} transactions in view
            </span>
          </div>

          {/* Period Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/50 dark:border-zinc-700">
            {(
              [
                { id: 'month', label: 'This Month' },
                { id: 'week', label: '7 Days' },
                { id: 'year', label: 'This Year' },
                { id: 'all', label: 'All Records' },
              ] as const
            ).map((p) => (
              <button
                key={p.id}
                onClick={() => setFilterPeriod(p.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filterPeriod === p.id
                    ? 'bg-amber-500 text-black shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category Breakdown Chips */}
        <div className="mt-4">
          <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide block mb-2">
            Filter by Category
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
              All Categories
            </button>
            {CATEGORIES.map((cat) => {
              const amount = categoryTotals[cat.name] || 0;
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
          placeholder="Search by title, category, or note..."
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

      {/* Expenses List */}
      <div className="rounded-3xl p-5 sm:p-6 bg-white dark:bg-[#1A1916] border border-amber-500/20 shadow-sm">
        <h3 className="text-sm font-bold tracking-wider font-cinzel text-zinc-900 dark:text-amber-200 uppercase mb-4 flex items-center justify-between">
          <span>Expense Records ({filteredExpenses.length})</span>
          <span className="text-xs text-amber-600 font-bold font-mono">
            Sum: {formatINR(totalFilteredAmount)}
          </span>
        </h3>

        {filteredExpenses.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign className="w-10 h-10 mx-auto text-zinc-300 dark:text-zinc-700 mb-2" />
            <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
              No expenses found matching the current filters.
            </p>
            <button
              onClick={() => handleOpenAdd()}
              className="mt-3 px-4 py-2 rounded-xl bg-amber-500 text-black font-bold text-xs hover:bg-amber-600 transition-all"
            >
              + Add New Expense
            </button>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {filteredExpenses.map((item) => {
              const catObj = CATEGORIES.find((c) => c.name === item.category);
              const Icon = catObj?.icon || DollarSign;

              return (
                <div
                  key={item.id}
                  className="py-3.5 flex items-center justify-between gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 px-2 rounded-2xl transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2.5 rounded-2xl border shrink-0 ${
                        catObj?.color || 'text-zinc-600 bg-zinc-100 border-zinc-200'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          {item.title}
                        </span>
                        {item.billPhoto && (
                          <button
                            onClick={() => setViewingPhoto(item.billPhoto || null)}
                            title="View Attached Receipt"
                            className="p-1 rounded-md bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 transition-all"
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300">{item.category}</span>
                        <span>•</span>
                        <span>{item.paymentMethod}</span>
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
                        {formatINR(item.amount)}
                      </span>
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
                        onClick={() => onDeleteExpense(item.id)}
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

      {/* Add / Edit Expense Modal Form */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-[#FAF8F5] dark:bg-[#181714] rounded-3xl border border-amber-500/40 shadow-2xl p-6 my-8 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500 text-black">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-cinzel text-zinc-900 dark:text-amber-100">
                    {expenses.some((e) => e.id === formData.id) ? 'Edit Expense' : 'Add New Expense'}
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
              {/* Title & Amount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Expense Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. D-Mart Grocery Shopping"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-amber-500/30 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-amber-500/30 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Date & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-amber-500/30 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ExpenseCategory })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-amber-500/30 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.name} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Payment Method & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-amber-500/30 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="UPI">UPI (Google Pay / PhonePe)</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer / Card</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Notes
                  </label>
                  <input
                    type="text"
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="e.g. Shared with flatmate"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-amber-500/30 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Bill / Photo Attachment */}
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-amber-500" />
                  <span>Attach Bill or Receipt Photo (Optional)</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    id="bill-photo-input"
                    className="hidden"
                  />
                  <label
                    htmlFor="bill-photo-input"
                    className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold border border-zinc-300 dark:border-zinc-700 hover:border-amber-500 cursor-pointer flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Upload Bill Image</span>
                  </label>

                  {formData.billPhoto && (
                    <div className="relative">
                      <img
                        src={formData.billPhoto}
                        alt="Preview"
                        className="w-12 h-12 object-cover rounded-xl border border-amber-500"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, billPhoto: '' })}
                        className="absolute -top-1.5 -right-1.5 p-0.5 bg-rose-500 text-white rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
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
                  <span>Save Expense</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bill Photo Preview Lightbox */}
      {viewingPhoto && (
        <div
          onClick={() => setViewingPhoto(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs cursor-pointer"
        >
          <div className="relative max-w-xl max-h-[90vh]">
            <img
              src={viewingPhoto}
              alt="Bill Receipt Preview"
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
