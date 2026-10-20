import React, { useState } from 'react';
import {
  History,
  Download,
  Search,
  Filter,
  Building,
  Zap,
  DollarSign,
  Receipt,
  Calendar,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import {
  ActiveTab,
  ElectricityRecord,
  ExpenseRecord,
  ReceiptRecord,
  RentRecord,
  RationItem,
  RationReceiptRecord,
} from '../types';
import { formatINR, formatMonthYear, formatDate } from '../utils/formatters';

interface HistoryViewProps {
  rents: RentRecord[];
  electricity: ElectricityRecord[];
  expenses: ExpenseRecord[];
  receipts: ReceiptRecord[];
  rationItems?: RationItem[];
  rationReceipts?: RationReceiptRecord[];
  onSelectMonth: (monthKey: string) => void;
  onNavigate: (tab: ActiveTab) => void;
  language: 'en' | 'hi';
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  rents,
  electricity,
  expenses,
  receipts,
  rationItems = [],
  rationReceipts = [],
  onSelectMonth,
  onNavigate,
  language,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'rent' | 'electricity' | 'expenses' | 'ration' | 'receipts'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('2026');

  // Extract all unique months
  const allMonthsSet = new Set<string>();
  rents.forEach((r) => allMonthsSet.add(r.monthKey));
  electricity.forEach((e) => allMonthsSet.add(e.monthKey));
  expenses.forEach((e) => allMonthsSet.add(e.monthKey));
  const sortedMonths = Array.from(allMonthsSet).sort().reverse();

  // Year filter options
  const years = ['2026', '2025', '2024'];

  // Year-wise summary computation
  const yearRents = rents.filter((r) => r.monthKey.startsWith(selectedYear));
  const yearElec = electricity.filter((e) => e.monthKey.startsWith(selectedYear));
  const yearExpenses = expenses.filter((e) => e.date.startsWith(selectedYear));

  const totalYearRent = yearRents.reduce((sum, r) => sum + r.amountPaid, 0);
  const totalYearElec = yearElec.reduce((sum, e) => sum + e.totalAmount, 0);
  const totalYearExpenses = yearExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalYearOutflow = totalYearRent + totalYearElec + totalYearExpenses;

  // Monthly Comparison Bars (Last 4 months)
  const recent4Months = sortedMonths.slice(0, 4).reverse();
  const maxMonthTotal = Math.max(
    1,
    ...recent4Months.map((m) => {
      const r = rents.find((x) => x.monthKey === m)?.amountPaid || 0;
      const el = electricity.find((x) => x.monthKey === m)?.totalAmount || 0;
      const ex = expenses.filter((x) => x.monthKey === m).reduce((s, c) => s + c.amount, 0);
      return r + el + ex;
    })
  );

  // CSV Exporter
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Type,Month / Date,Title / Particulars,Details,Amount (INR),Status\n';

    // Rents
    rents.forEach((r) => {
      csvContent += `Rent,${r.monthKey},"Room Rent - ${r.roomAddress}","Due: ${r.dueDate} | Paid: ${r.paymentDate || 'Pending'}",${r.monthlyRent + (r.additionalCharges || 0)},${r.paymentStatus}\n`;
    });

    // Electricity
    electricity.forEach((e) => {
      csvContent += `Electricity,${e.monthKey},"Power Consumption","Units: ${e.unitsConsumed} @ Rs.${e.ratePerUnit}",${e.totalAmount},Logged\n`;
    });

    // Expenses
    expenses.forEach((exp) => {
      csvContent += `Expense,${exp.date},"${exp.title.replace(/"/g, '""')}","Category: ${exp.category} | Method: ${exp.paymentMethod}",${exp.amount},Paid\n`;
    });

    // House Ration
    rationItems.forEach((rat) => {
      csvContent += `House Ration,${rat.date},"${rat.itemName.replace(/"/g, '""')} (${rat.quantity})","Category: ${rat.category} | Store: ${rat.storeName || 'Local'}",${rat.totalAmount},Purchased\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Avhii_Rent_Expenses_Report_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-24 max-w-5xl mx-auto px-4 pt-4">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <History className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-cinzel text-zinc-900 dark:text-amber-100">
              Financial History & Reports
            </h2>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Month-wise archives, expenditure trends, and CSV data export
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-xs shadow-md shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Export All Data (CSV)</span>
        </button>
      </div>

      {/* Year-Wise Summary Cards */}
      <div className="rounded-3xl p-6 bg-white dark:bg-[#1A1916] border border-amber-500/30 shadow-lg">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#D4AF37]">
              Annual Summary
            </span>
            <h3 className="text-xl sm:text-2xl font-black font-cinzel text-zinc-900 dark:text-amber-100 mt-0.5">
              Year {selectedYear} Outflow
            </h3>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
            {years.map((yr) => (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedYear === yr
                    ? 'bg-amber-500 text-black shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                }`}
              >
                {yr}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/50 dark:border-zinc-800">
            <span className="text-[10px] text-zinc-400 uppercase font-bold">Total Rent Paid</span>
            <p className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 mt-1">
              {formatINR(totalYearRent)}
            </p>
            <span className="text-[10px] text-zinc-500">{yearRents.length} months</span>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/50 dark:border-zinc-800">
            <span className="text-[10px] text-zinc-400 uppercase font-bold">Total Power Bills</span>
            <p className="text-lg font-extrabold text-yellow-600 dark:text-yellow-400 mt-1">
              {formatINR(totalYearElec)}
            </p>
            <span className="text-[10px] text-zinc-500">{yearElec.length} readings</span>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/50 dark:border-zinc-800">
            <span className="text-[10px] text-zinc-400 uppercase font-bold">Personal Expenses</span>
            <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
              {formatINR(totalYearExpenses)}
            </p>
            <span className="text-[10px] text-zinc-500">{yearExpenses.length} items</span>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
            <span className="text-[10px] text-amber-800 dark:text-amber-400 uppercase font-bold">Total Outflow</span>
            <p className="text-lg font-black text-amber-900 dark:text-amber-200 mt-1">
              {formatINR(totalYearOutflow)}
            </p>
            <span className="text-[10px] text-amber-700/80">Complete expenditure</span>
          </div>
        </div>
      </div>

      {/* Monthly Comparison Bar Chart */}
      {recent4Months.length > 0 && (
        <div className="rounded-3xl p-6 bg-white dark:bg-[#1A1916] border border-amber-500/20 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold tracking-wider font-cinzel text-zinc-900 dark:text-amber-200 uppercase flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-500" />
              <span>Month-over-Month Spending Comparison</span>
            </h3>
            <span className="text-xs text-zinc-500">Last {recent4Months.length} Months</span>
          </div>

          <div className="space-y-4 pt-2">
            {recent4Months.map((m) => {
              const r = rents.find((x) => x.monthKey === m)?.amountPaid || 0;
              const el = electricity.find((x) => x.monthKey === m)?.totalAmount || 0;
              const ex = expenses.filter((x) => x.monthKey === m).reduce((s, c) => s + c.amount, 0);
              const mTotal = r + el + ex;
              const widthPct = ((mTotal / maxMonthTotal) * 100).toFixed(0);

              return (
                <div key={m} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-zinc-800 dark:text-zinc-200">{formatMonthYear(m, language)}</span>
                    <span className="text-amber-600 dark:text-amber-400 font-extrabold">{formatINR(mTotal)}</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex">
                    <div
                      style={{ width: `${widthPct}%` }}
                      className="bg-gradient-to-r from-amber-500 to-amber-600 h-full rounded-full transition-all duration-500"
                    />
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-zinc-400">
                    <span>Rent: {formatINR(r)}</span>
                    <span>•</span>
                    <span>Power: {formatINR(el)}</span>
                    <span>•</span>
                    <span>Expenses: {formatINR(ex)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto">
          {(
            [
              { id: 'all', label: 'All Records' },
              { id: 'rent', label: 'Rent History' },
              { id: 'electricity', label: 'Power Bills' },
              { id: 'ration', label: 'House Ration' },
              { id: 'expenses', label: 'Expenses' },
              { id: 'receipts', label: 'Receipts' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveSubTab(t.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 border transition-all ${
                activeSubTab === t.id
                  ? 'bg-amber-500 text-black border-amber-500'
                  : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-amber-500/40'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search records..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white dark:bg-[#1A1916] border border-amber-500/20 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* History Records List */}
      <div className="rounded-3xl p-6 bg-white dark:bg-[#1A1916] border border-amber-500/20 shadow-sm space-y-3">
        {/* If All or Rent */}
        {(activeSubTab === 'all' || activeSubTab === 'rent') && rents.length > 0 && (
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase text-amber-700 dark:text-amber-400 tracking-wider">
              Rent Payments
            </span>
            {rents.map((r) => (
              <div
                key={r.id}
                onClick={() => {
                  onSelectMonth(r.monthKey);
                  onNavigate('rent');
                }}
                className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/50 dark:border-zinc-800 hover:border-amber-500/40 cursor-pointer flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {formatMonthYear(r.monthKey, language)} Rent
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      {r.paymentMethod} • Due {formatDate(r.dueDate)}
                    </p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-2">
                  <div>
                    <p className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100">
                      {formatINR(r.monthlyRent + (r.additionalCharges || 0))}
                    </p>
                    <span
                      className={`text-[10px] font-bold ${
                        r.paymentStatus === 'Paid' ? 'text-emerald-600' : 'text-rose-500'
                      }`}
                    >
                      {r.paymentStatus}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-400" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* If All or Electricity */}
        {(activeSubTab === 'all' || activeSubTab === 'electricity') && electricity.length > 0 && (
          <div className="space-y-2 pt-2">
            <span className="text-[11px] font-bold uppercase text-yellow-700 dark:text-yellow-400 tracking-wider">
              Electricity Bills
            </span>
            {electricity.map((e) => (
              <div
                key={e.id}
                onClick={() => {
                  onSelectMonth(e.monthKey);
                  onNavigate('electricity');
                }}
                className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/50 dark:border-zinc-800 hover:border-amber-500/40 cursor-pointer flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-yellow-500/10 text-yellow-600">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {formatMonthYear(e.monthKey, language)} Power Bill
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      {e.unitsConsumed} units consumed @ ₹{e.ratePerUnit}
                    </p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-2">
                  <div>
                    <p className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100">
                      {formatINR(e.totalAmount)}
                    </p>
                    <span className="text-[10px] text-zinc-400">{formatDate(e.readingDate)}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-400" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* If All or Ration */}
        {(activeSubTab === 'all' || activeSubTab === 'ration') && rationItems.length > 0 && (
          <div className="space-y-2 pt-2">
            <span className="text-[11px] font-bold uppercase text-amber-700 dark:text-amber-400 tracking-wider">
              Monthly House Ration & Kitchen Purchases ({rationItems.length})
            </span>
            {rationItems.map((rat) => (
              <div
                key={rat.id}
                onClick={() => {
                  onSelectMonth(rat.monthKey);
                  onNavigate('ration');
                }}
                className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/50 dark:border-zinc-800 hover:border-amber-500/40 cursor-pointer flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {rat.itemName} ({rat.quantity})
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      {rat.category} • {rat.storeName || 'Local Store'} • {formatDate(rat.date)}
                    </p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-2">
                  <div>
                    <p className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100">
                      {formatINR(rat.totalAmount)}
                    </p>
                    <span className="text-[10px] text-amber-700 dark:text-amber-300 font-bold">Ration</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-400" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* If All or Receipts */}
        {(activeSubTab === 'all' || activeSubTab === 'receipts') && receipts.length > 0 && (
          <div className="space-y-2 pt-2">
            <span className="text-[11px] font-bold uppercase text-indigo-700 dark:text-indigo-400 tracking-wider">
              Saved Receipt History ({receipts.length})
            </span>
            {receipts.map((rc) => (
              <div
                key={rc.id}
                onClick={() => {
                  onSelectMonth(rc.monthKey);
                  onNavigate('receipt');
                }}
                className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/50 dark:border-zinc-800 hover:border-amber-500/40 cursor-pointer flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{rc.receiptNumber}</p>
                    <p className="text-[11px] text-zinc-500">{rc.title}</p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-2">
                  <div>
                    <p className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100">
                      {formatINR(rc.grandTotal)}
                    </p>
                    <span className="text-[10px] font-bold text-emerald-600">{rc.paymentStatus}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
