import React, { useState } from 'react';
import { Customer, ShopSettings } from '../types';
import { Plus, Search, Phone, MapPin, DollarSign, MessageCircle, FileText, CheckCircle } from 'lucide-react';

interface CustomerKhataProps {
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  settings: ShopSettings;
  lang: 'en' | 'ur';
  autoOpenAdd?: boolean;
}

export const CustomerKhata: React.FC<CustomerKhataProps> = ({
  customers,
  setCustomers,
  settings,
  lang,
  autoOpenAdd = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(autoOpenAdd);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);

  // New customer form state
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newLimit, setNewLimit] = useState(30000);

  const filteredCustomers = customers.filter(
    (c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.phone.includes(searchQuery)
  );

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      name: newName,
      phone: newPhone,
      address: newAddress,
      balance: 0,
      creditLimit: Number(newLimit) || 30000,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    setCustomers((prev) => [newCust, ...prev]);
    setNewName('');
    setNewPhone('');
    setNewAddress('');
    setShowAddModal(false);
  };

  const handleCollectPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || paymentAmount <= 0) return;

    setCustomers((prev) =>
      prev.map((c) =>
        c.id === selectedCustomer.id ? { ...c, balance: Math.max(0, c.balance - paymentAmount) } : c
      )
    );

    alert(`Successfully recorded payment of Rs. ${paymentAmount} from ${selectedCustomer.name}`);
    setShowPaymentModal(false);
    setSelectedCustomer(null);
    setPaymentAmount(0);
  };

  const sendWhatsAppReminder = (cust: Customer) => {
    const text = `محترم ${cust.name} صاحب، آپ کی طرف *${settings.shopNameUr}* کا بقایا ادھار بل کل *Rs. ${cust.balance}* واجب الادا ہے۔ مہربانی فرما کر جلد ادئیگی کریں۔ شکریہ! — ${settings.phone}`;
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/${cust.phone.replace(/[^0-9]/g, '')}?text=${encoded}`, '_blank');
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto pb-24 xl:pb-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">📒 گاہک ادھار کھاتا (Customer Credit Khata)</h2>
          <p className="text-xs text-slate-500">کس گاہک کے پاس کتنے پیسے باقی ہیں، اس کا ریکارڈ</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>نیا گاہک رجسٹر کریں</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder={lang === 'ur' ? 'گاہک کا نام یا فون نمبر تلاش کریں...' : 'Search customer by name or phone...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
        />
      </div>

      {/* Customer List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((cust) => (
          <div key={cust.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">{cust.name}</h3>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono ${cust.balance > 0 ? 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300' : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700'}`}>
                  Rs. {cust.balance} Udhaar
                </span>
              </div>
              <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400 mb-4">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{cust.phone || 'No phone'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{cust.address || 'No address'}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <button
                onClick={() => {
                  setSelectedCustomer(cust);
                  setShowPaymentModal(true);
                }}
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors"
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>رقم وصول (Jama)</span>
              </button>
              <button
                onClick={() => sendWhatsAppReminder(cust)}
                className="p-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 rounded-xl transition-colors"
                title="Send WhatsApp Reminder"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-semibold text-lg">نیا گاہک رجسٹر کریں</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white text-xl font-bold">&times;</button>
            </div>
            <form onSubmit={handleAddCustomer} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Customer Name (نام)</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Rana Aslam"
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Phone Number (فون نمبر)</label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="e.g. +92 300 1234567"
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Address (پتہ)</label>
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="e.g. Model Town City"
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm"
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

      {/* Collect Payment (Jama) Modal */}
      {showPaymentModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-semibold text-lg">رقم وصول کریں (Collect Payment)</h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-white text-xl font-bold">&times;</button>
            </div>
            <form onSubmit={handleCollectPayment} className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1">
                <p className="text-xs text-slate-500">Customer: <strong className="text-slate-900 dark:text-white">{selectedCustomer.name}</strong></p>
                <p className="text-xs text-slate-500">Current Balance: <strong className="text-red-600 font-mono">Rs. {selectedCustomer.balance}</strong></p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Payment Amount (وصول شدہ رقم)</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={selectedCustomer.balance}
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
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>وصول درج کریں (Jama)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
