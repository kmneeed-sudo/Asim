import React, { useState, useEffect } from 'react';
import { UserRole, Language, InventoryItem, Customer, Supplier, Expense, Bill, ShopSettings } from './types';
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

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('pos');
  const [role, setRole] = useState<UserRole>('admin');
  const [lang, setLang] = useState<Language>('ur');
  const [autoOpenType, setAutoOpenType] = useState<'item' | 'customer' | 'supplier' | 'expense' | null>(null);

  // Persistent state with localStorage
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('hardware_inventory');
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('hardware_customers');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem('hardware_suppliers');
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('hardware_expenses');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [bills, setBills] = useState<Bill[]>(() => {
    const saved = localStorage.getItem('hardware_bills');
    return saved ? JSON.parse(saved) : [];
  });

  const [settings, setSettings] = useState<ShopSettings>(() => {
    const saved = localStorage.getItem('hardware_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
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

  const handleCompleteSale = (newBill: Bill, updatedInventory: InventoryItem[], updatedCustomer?: Customer) => {
    setBills((prev) => [newBill, ...prev]);
    setInventory(updatedInventory);
    if (updatedCustomer) {
      setCustomers((prev) =>
        prev.map((c) => (c.id === updatedCustomer.id ? updatedCustomer : c))
      );
    }
  };

  const handleResetData = () => {
    setInventory(INITIAL_INVENTORY);
    setCustomers(INITIAL_CUSTOMERS);
    setSuppliers(INITIAL_SUPPLIERS);
    setExpenses(INITIAL_EXPENSES);
    setBills([]);
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
        onOpenSettings={() => setShowSettings(true)}
        onOpenAI={() => setShowAI(true)}
        onOpenAddModal={handleOpenAddModal}
        onResetData={handleResetData}
      />

      {/* Main Content Area */}
      <main className="pb-16 xl:pb-0">
        {currentTab === 'pos' && (
          <POSBilling
            inventory={inventory}
            customers={customers}
            settings={settings}
            onCompleteSale={handleCompleteSale}
            lang={lang}
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
