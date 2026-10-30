import React, { useState } from 'react';
import { Bill, Expense, UserRole, ShopSettings } from '../types';
import { DollarSign, TrendingUp, TrendingDown, Calendar, Plus, Trash2, ShieldAlert } from 'lucide-react';

interface HisabReportsProps {
  bills: Bill[];
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  role: UserRole;
  settings: ShopSettings;
  lang: 'en' | 'ur';
  autoOpenAdd?: boolean;
}

export const HisabReports: React.FC<HisabReportsProps> = ({
  bills,
  expenses,
  setExpenses,
  role,
  settings,
  lang,
  autoOpenAdd = false,
}) => {
  const [showAddExpense, setShowAddExpense] = useState(autoOpenAdd);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [category, setCategory] = useState<Expense['category']>('Other');
  const [notes, setNotes] = useState('');

  // Calculate totals
  const totalSales = bills.reduce((acc, b) => acc + b.total, 0);
  const cashSales = bills.filter((b) => b.paymentMethod === 'Cash').reduce((acc, b) => acc + b.total, 0);
  const onlineSales = bills.filter((b) => b.paymentMethod === 'UPI/Bank').reduce((acc, b) => acc + b.total, 0);
  const udhaarSales = bills.filter((b) => b.paymentMethod === 'Udhaar').reduce((acc, b) => acc + b.total, 0);

  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const netCashInHand = cashSales - totalExpenses;

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || amount <= 0) return;

    const newExp: Expense = {
      id: `exp-${Date.now()}`,
      title,
      amount: Number(amount) || 0,
      category,
      date: new Date().toISOString().slice(0, 10),
      notes,
    };

    setExpenses((prev) => [newExp, ...prev]);
    setTitle('');
    setAmount(0);
    setNotes('');
    setShowAddExpense(false);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto pb-24 xl:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">📊 ڈیلی حساب اور پرافٹ رپورٹ (Hisab & Reports)</h2>
          <p className="text-xs text-slate-500">کیش ان ہینڈ، روزانہ فروخت، اور دکان کے اخراجات کا حساب</p>
        </div>
        <button
          onClick={() => setShowAddExpense(true)}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>نیا خرچہ درج کریں (Add Expense)</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Total Sales (کل فروخت)</span>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-mono">Rs. {totalSales}</h3>
          <p className="text-[11px] text-emerald-600 mt-1">{bills.length} bills generated</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Cash in Hand (نقد کیش)</span>
          <h3 className="text-2xl font-bold text-emerald-600 font-mono">Rs. {netCashInHand}</h3>
          <p className="text-[11px] text-slate-500 mt-1">Cash sales minus expenses</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Online / UPI Sales (آن لائن)</span>
          <h3 className="text-2xl font-bold text-blue-600 font-mono">Rs. {onlineSales}</h3>
          <p className="text-[11px] text-slate-500 mt-1">Direct bank transfers</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 block mb-1">Total Expenses (کل اخراجات)</span>
          <h3 className="text-2xl font-bold text-red-600 font-mono">Rs. {totalExpenses}</h3>
          <p className="text-[11px] text-slate-500 mt-1">{expenses.length} expense entries</p>
        </div>
      </div>

      {/* Role Restriction Notice for Admin-Only Profit */}
      {role !== 'admin' && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
          <p className="text-xs text-amber-800 dark:text-amber-300">
            پرافٹ مارجن اور خرید قیمت (Purchase Cost) کی رپورٹ صرف ایڈمن (Admin) کو نظر آتی ہے۔
          </p>
        </div>
      )}

      {/* Expenses Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white text-base">دکان کے اخراجات (Shop Expenses)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="p-3">Title</th>
                <th className="p-3">Category</th>
                <th className="p-3">Date</th>
                <th className="p-3">Notes</th>
                <th className="p-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-slate-400">کوئی خرچہ درج نہیں کیا گیا</td>
                </tr>
              ) : (
                expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{exp.title}</td>
                    <td className="p-3">
                      <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-medium text-slate-700 dark:text-slate-300">
                        {exp.category}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-slate-500 font-mono">{exp.date}</td>
                    <td className="p-3 text-xs text-slate-500">{exp.notes || '-'}</td>
                    <td className="p-3 text-right font-mono font-bold text-red-600">Rs. {exp.amount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddExpense && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-semibold text-lg">نیا خرچہ درج کریں (Add Expense)</h3>
              <button onClick={() => setShowAddExpense(false)} className="text-slate-400 hover:text-white text-xl font-bold">&times;</button>
            </div>
            <form onSubmit={handleAddExpense} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Expense Title (عنوان)</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Electricity Bill"
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Category (کیٹگری)</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm"
                  >
                    <option value="Rent">Rent</option>
                    <option value="Electricity">Electricity</option>
                    <option value="Transport">Transport</option>
                    <option value="Salary">Salary</option>
                    <option value="Tea/Food">Tea/Food</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Amount (رقم)</label>
                  <input
                    type="number"
                    required
                    value={amount || ''}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Notes (تفصیل)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional notes"
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm"
                />
              </div>
              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddExpense(false)}
                  className="px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  منسوخ کریں
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-bold shadow-sm transition-colors"
                >
                  محفوظ کریں
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
