import React, { useState, useEffect } from 'react';
import { UserRole, Language, InventoryItem, Customer, Supplier, Expense, Bill, ShopSettings, BillItem } from './types';
import { INITIAL_INVENTORY, INITIAL_CUSTOMERS, INITIAL_SUPPLIERS, INITIAL_EXPENSES, INITIAL_SETTINGS } from './mockData';
import { Navbar } from './components/Navbar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { POSBilling } from './components/POSBilling';
import { InventoryManager } from './components/InventoryManager';
import { CustomerKhata } from './components/CustomerKhata';
import { SupplierLedger } from './components/SupplierLedger';
import { HisabReports } from './components/HisabReports';
import { AIAssistantModal } from './components/AIAssistantModal';
import { SettingsModal } from './components/SettingsModal';

interface ParkedBill {
  id: string;
  name: string;
  timestamp: string;
  cart: BillItem[];
  selectedCustomerId: string;
  billDiscount: number;
}

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('pos');
  const [role, setRole] = useState<UserRole>('admin');
  const [lang, setLang] = useState<Language>('ur');
  const [autoOpenType, setAutoOpenType] = useState<'item' | 'customer' | 'supplier' | 'expense' | null>(null);

  // Persistent state with safe localStorage hydration
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('hardware_inventory');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error reading inventory from storage:', e);
    }
    return INITIAL_INVENTORY;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const saved = localStorage.getItem('hardware_customers');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error reading customers from storage:', e);
    }
    return INITIAL_CUSTOMERS;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    try {
      const saved = localStorage.getItem('hardware_suppliers');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error reading suppliers from storage:', e);
    }
    return INITIAL_SUPPLIERS;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const saved = localStorage.getItem('hardware_expenses');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error reading expenses from storage:', e);
    }
    return INITIAL_EXPENSES;
  });

  const [bills, setBills] = useState<Bill[]>(() => {
    try {
      const saved = localStorage.getItem('hardware_bills');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Error reading bills from storage:', e);
    }
    return [];
  });

  const [settings, setSettings] = useState<ShopSettings>(() => {
    try {
      const saved = localStorage.getItem('hardware_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          const loaded = { ...INITIAL_SETTINGS, ...parsed };
          if (!loaded.shopNameUr || loaded.shopNameUr.includes('المکہ')) {
            loaded.shopNameUr = 'عاصم ہارڈویئر سٹور';
            loaded.shopNameEn = 'Asim Hardware Store';
          }
          return loaded;
        }
      }
    } catch (e) {
      console.error('Error reading settings from storage:', e);
    }
    return INITIAL_SETTINGS;
  });

  // Cart & POS Shared State
  const [cart, setCart] = useState<BillItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('walk-in');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI/Bank' | 'Udhaar' | 'Partial'>('Cash');
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [cashReceived, setCashReceived] = useState<number>(0);
  const [billDiscount, setBillDiscount] = useState<number>(0);
  const [billNotes, setBillNotes] = useState<string>('');
  const [parkedBills, setParkedBills] = useState<ParkedBill[]>(() => {
    try {
      const saved = localStorage.getItem('hardware_parked_bills');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Error reading parked bills from storage:', e);
    }
    return [];
  });

  const [showSettings, setShowSettings] = useState(false);
  const [showAI, setShowAI] = useState(false);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('hardware_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('hardware_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('hardware_suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem('hardware_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('hardware_bills', JSON.stringify(bills));
  }, [bills]);

  useEffect(() => {
    localStorage.setItem('hardware_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('hardware_parked_bills', JSON.stringify(parkedBills));
  }, [parkedBills]);

  const handleCompleteSale = (newBill: Bill, updatedInventory: InventoryItem[], updatedCustomer?: Customer) => {
    setBills((prev) => [newBill, ...prev]);
    setInventory(updatedInventory);
    if (updatedCustomer) {
      setCustomers((prev) =>
        prev.map((c) => (c.id === updatedCustomer.id ? updatedCustomer : c))
      );
    }
    setCart([]);
    setBillDiscount(0);
    setPaidAmount(0);
    setCashReceived(0);
    setBillNotes('');
    setSelectedCustomerId('walk-in');
  };

  const handleResetData = () => {
    setInventory(INITIAL_INVENTORY);
    setCustomers(INITIAL_CUSTOMERS);
    setSuppliers(INITIAL_SUPPLIERS);
    setExpenses(INITIAL_EXPENSES);
    setBills([]);
    setCart([]);
    setParkedBills([]);
    setSettings(INITIAL_SETTINGS);
    localStorage.clear();
  };

  const handleOpenAddModal = (type: 'item' | 'customer' | 'supplier' | 'expense') => {
    setAutoOpenType(type);
    if (type === 'item') setCurrentTab('inventory');
    else if (type === 'customer') setCurrentTab('khata');
    else if (type === 'supplier') setCurrentTab('suppliers');
    else if (type === 'expense') setCurrentTab('hisab');
  };

  const cartItemsCount = cart.reduce((acc, ci) => acc + ci.qty, 0);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-amber-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          setAutoOpenType(null);
        }}
        role={role}
        setRole={setRole}
        lang={lang}
        setLang={setLang}
        settings={settings}
        cartItemsCount={cartItemsCount}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenSettings={() => setShowSettings(true)}
        onOpenAI={() => setShowAI(true)}
        onOpenAddModal={handleOpenAddModal}
        onResetData={handleResetData}
      />

      {/* Main Content Area */}
      <main className="pb-16 xl:pb-0">
        {(currentTab === 'pos' || currentTab === 'cart' || currentTab === 'history') && (
          <POSBilling
            inventory={inventory}
            customers={customers}
            setCustomers={setCustomers}
            bills={bills}
            setBills={setBills}
            settings={settings}
            onCompleteSale={handleCompleteSale}
            lang={lang}
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
            cart={cart}
            setCart={setCart}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCustomerId={selectedCustomerId}
            setSelectedCustomerId={setSelectedCustomerId}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            paidAmount={paidAmount}
            setPaidAmount={setPaidAmount}
            cashReceived={cashReceived}
            setCashReceived={setCashReceived}
            billDiscount={billDiscount}
            setBillDiscount={setBillDiscount}
            billNotes={billNotes}
            setBillNotes={setBillNotes}
            parkedBills={parkedBills}
            setParkedBills={setParkedBills}
          />
        )}
        {currentTab === 'inventory' && (
          <InventoryManager
            inventory={inventory}
            setInventory={setInventory}
            role={role}
            settings={settings}
            lang={lang}
            autoOpenAdd={autoOpenType === 'item'}
          />
        )}
        {currentTab === 'khata' && (
          <CustomerKhata
            customers={customers}
            setCustomers={setCustomers}
            settings={settings}
            lang={lang}
            autoOpenAdd={autoOpenType === 'customer'}
          />
        )}
        {currentTab === 'suppliers' && (
          <SupplierLedger
            suppliers={suppliers}
            setSuppliers={setSuppliers}
            settings={settings}
            lang={lang}
            autoOpenAdd={autoOpenType === 'supplier'}
          />
        )}
        {currentTab === 'hisab' && (
          <HisabReports
            bills={bills}
            expenses={expenses}
            setExpenses={setExpenses}
            role={role}
            settings={settings}
            lang={lang}
            autoOpenAdd={autoOpenType === 'expense'}
          />
        )}
      </main>

      {/* Mobile Bottom Thumb Navigation */}
      <MobileBottomNav
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          setAutoOpenType(null);
        }}
        lang={lang}
      />

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          settings={settings}
          setSettings={setSettings}
          role={role}
          setRole={setRole}
          lang={lang}
          setLang={setLang}
          onResetData={handleResetData}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* AI Assistant Modal */}
      {showAI && (
        <AIAssistantModal
          inventory={inventory}
          customers={customers}
          bills={bills}
          onClose={() => setShowAI(false)}
        />
      )}
    </div>
  );
}
