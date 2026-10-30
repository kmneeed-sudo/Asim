import React, { useState } from 'react';
import { Supplier, ShopSettings } from '../types';
import { Plus, Search, Phone, Truck, DollarSign, CheckCircle } from 'lucide-react';

interface SupplierLedgerProps {
  suppliers: Supplier[];
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
  settings: ShopSettings;
  lang: 'en' | 'ur';
  autoOpenAdd?: boolean;
}

export const SupplierLedger: React.FC<SupplierLedgerProps> = ({
  suppliers,
  setSuppliers,
  settings,
  lang,
  autoOpenAdd = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(autoOpenAdd);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);

  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCategory, setNewCategory] = useState('Plumbing');
  const [newBalance, setNewBalance] = useState(0);

  const filteredSuppliers = suppliers.filter(
    (s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    const newSup: Supplier = {
      id: `supp-${Date.now()}`,
      name: newName,
      phone: newPhone,
      category: newCategory,
      balance: Number(newBalance) || 0,
      lastOrderDate: new Date().toISOString().slice(0, 10),
    };

    setSuppliers((prev) => [newSup, ...prev]);
    setNewName('');
    setNewPhone('');
    setNewBalance(0);
    setShowAddModal(false);
  };

  const handlePaySupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier || paymentAmount <= 0) return;

    setSuppliers((prev) =>
      prev.map((s) =>
        s.id === selectedSupplier.id ? { ...s, balance: Math.max(0, s.balance - paymentAmount) } : s
      )
    );

    alert(`Successfully paid Rs. ${paymentAmount} to ${selectedSupplier.name}`);
    setShowPaymentModal(false);
    setSelectedSupplier(null);
    setPaymentAmount(0);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto pb-24 xl:pb-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">🚚 سپلائر کھاتا (Supplier Ledger)</h2>
          <p className="text-xs text-slate-500">کمپنیوں اور ڈسٹری بیوٹرز کا کھاتا جن کو پیسے دینے ہیں</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>نیا سپلائر شامل کریں</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder={lang === 'ur' ? 'سپلائر کا نام یا کیٹگری تلاش کریں...' : 'Search supplier by name or category...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
        />
      </div>

      {/* Supplier Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSuppliers.map((supp) => (
          <div key={supp.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">{supp.name}</h3>
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded font-semibold">
                    {supp.category}
                  </span>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono ${supp.balance > 0 ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300' : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700'}`}>
                  Rs. {supp.balance} Payable
                </span>
              </div>
              <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400 mb-4 mt-3">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{supp.phone || 'No phone'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5" />
                  <span>Last Order: {supp.lastOrderDate}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
              <button
                onClick={() => {
                  setSelectedSupplier(supp);
                  setShowPaymentModal(true);
                }}
                className="w-full bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors"
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>ادائیگی کریں (Pay Supplier)</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Supplier Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-semibold text-lg">نیا سپلائر شامل کریں</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white text-xl font-bold">&times;</button>
            </div>
            <form onSubmit={handleAddSupplier} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Supplier Name (کمپنی نام)</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Master Pipe Ltd"
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Category (کیٹگری)</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm"
                  >
                    <option value="Plumbing">Plumbing</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Fasteners">Fasteners</option>
                    <option value="Tools">Tools</option>
                    <option value="Paints">Paints</option>
                    <option value="General">General</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Opening Payable (بقایا)</label>
                  <input
                    type="number"
                    value={newBalance}
                    onChange={(e) => setNewBalance(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Phone (فون نمبر)</label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="e.g. +92 300 0000000"
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-mono"
                />
              </div>
              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
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

      {/* Pay Supplier Modal */}
      {showPaymentModal && selectedSupplier && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-semibold text-lg">سپلائر کو ادائیگی (Pay Supplier)</h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-white text-xl font-bold">&times;</button>
            </div>
            <form onSubmit={handlePaySupplier} className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1">
                <p className="text-xs text-slate-500">Supplier: <strong className="text-slate-900 dark:text-white">{selectedSupplier.name}</strong></p>
                <p className="text-xs text-slate-500">Total Payable: <strong className="text-amber-600 font-mono">Rs. {selectedSupplier.balance}</strong></p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Payment Amount (ادائیگی کی رقم)</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={paymentAmount || ''}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  placeholder="Enter amount"
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-base font-bold font-mono"
                />
              </div>
              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  منسوخ کریں
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>رقم ادا کریں (Pay)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
