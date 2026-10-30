import React, { useState } from 'react';
import { UserRole, Language, ShopSettings } from '../types';
import { Wrench, Shield, Globe, Sparkles, Settings as SettingsIcon, Menu } from 'lucide-react';
import { ThreeLineMenuDrawer } from './ThreeLineMenuDrawer';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  role: UserRole;
  setRole: (role: UserRole) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  settings: ShopSettings;
  onOpenSettings: () => void;
  onOpenAI: () => void;
  onOpenAddModal: (type: 'item' | 'customer' | 'supplier' | 'expense') => void;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  role,
  setRole,
  lang,
  setLang,
  settings,
  onOpenSettings,
  onOpenAI,
  onOpenAddModal,
  onResetData,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 py-3.5 flex items-center justify-between gap-4 shadow-xs">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0 cursor-pointer" onClick={() => setCurrentTab('pos')}>
          <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-md font-bold text-lg">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
              {lang === 'ur' ? settings.shopNameUr : settings.shopNameEn}
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {lang === 'ur' ? 'ہارڈویئر POS اور انوینٹری منیجر' : 'Hardware POS & Inventory'}
            </p>
          </div>
        </div>

        {/* Zone 2: Navigation Links (Single-line, whitespace-nowrap) */}
        <nav className="hidden xl:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          <button
            onClick={() => setCurrentTab('pos')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
              currentTab === 'pos' ? 'border-amber-600 text-amber-600 font-semibold' : 'border-transparent hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {lang === 'ur' ? '🛒 بلنگ (POS)' : '🛒 Billing (POS)'}
          </button>
          <button
            onClick={() => setCurrentTab('inventory')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
              currentTab === 'inventory' ? 'border-amber-600 text-amber-600 font-semibold' : 'border-transparent hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {lang === 'ur' ? '📦 انوینٹری اور سامان' : '📦 Inventory'}
          </button>
          <button
            onClick={() => setCurrentTab('khata')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
              currentTab === 'khata' ? 'border-amber-600 text-amber-600 font-semibold' : 'border-transparent hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {lang === 'ur' ? '📒 گاہک ادھار کھاتا' : '📒 Customer Khata'}
          </button>
          <button
            onClick={() => setCurrentTab('suppliers')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
              currentTab === 'suppliers' ? 'border-amber-600 text-amber-600 font-semibold' : 'border-transparent hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {lang === 'ur' ? '🚚 سپلائر کھاتا' : '🚚 Suppliers'}
          </button>
          <button
            onClick={() => setCurrentTab('hisab')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
              currentTab === 'hisab' ? 'border-amber-600 text-amber-600 font-semibold' : 'border-transparent hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {lang === 'ur' ? '📊 ڈیلی حساب اور پرافٹ' : '📊 Hisab & Reports'}
          </button>
        </nav>

        {/* Zone 3: Primary Action & Tools & 3-Line Menu */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* AI Assistant Button */}
          <button
            onClick={onOpenAI}
            className="hidden sm:flex bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 px-3 py-1.5 rounded-lg text-xs font-semibold items-center gap-1.5 hover:bg-amber-100 transition-colors whitespace-nowrap"
            title="AI Business Consultant"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>AI مشیر</span>
          </button>

          {/* Role Switcher */}
          <button
            onClick={() => setRole(role === 'admin' ? 'salesman' : 'admin')}
            className={`hidden md:flex px-3 py-1.5 rounded-lg text-xs font-semibold items-center gap-1.5 transition-colors whitespace-nowrap ${
              role === 'admin'
                ? 'bg-slate-900 text-white dark:bg-slate-800'
                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
            }`}
            title="Switch Role"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{role === 'admin' ? '👑 Admin' : '👷 Salesman'}</span>
          </button>

          {/* Language Switcher */}
          <button
            onClick={() => setLang(lang === 'ur' ? 'en' : 'ur')}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold hidden sm:flex items-center gap-1"
            title="Change Language"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{lang === 'ur' ? 'EN' : 'اردو'}</span>
          </button>

          {/* 3-Line Menu Trigger Button */}
          <button
            onClick={() => setMenuOpen(true)}
            className="p-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white transition-colors shadow-sm flex items-center justify-center"
            title="Open 3-Line Menu & Settings"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* 3-Line Menu Drawer */}
      <ThreeLineMenuDrawer
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        role={role}
        setRole={setRole}
        lang={lang}
        setLang={setLang}
        settings={settings}
        onOpenSettings={onOpenSettings}
        onOpenAI={onOpenAI}
        onOpenAddModal={onOpenAddModal}
        onResetData={onResetData}
      />
    </>
  );
};
