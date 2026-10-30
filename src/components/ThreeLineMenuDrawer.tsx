import React from 'react';
import { UserRole, Language, ShopSettings } from '../types';
import { Menu, X, Plus, Package, Users, Truck, DollarSign, Settings, Sparkles, Shield, Globe, RefreshCw, Download } from 'lucide-react';

interface ThreeLineMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
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

export const ThreeLineMenuDrawer: React.FC<ThreeLineMenuDrawerProps> = ({
  isOpen,
  onClose,
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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex z-50 justify-end">
      <div className="bg-white dark:bg-slate-900 w-80 max-w-full h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base">{settings.shopNameUr}</h3>
            <p className="text-[11px] text-slate-400">مین مینو اور تمام ترتیبات (Menu & Settings)</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl font-bold">&times;</button>
        </div>

        {/* Drawer Links & Add Options */}
        <div className="flex-1 p-4 overflow-y-auto space-y-6 text-slate-800 dark:text-slate-200 text-sm">
          {/* Section 1: Quick Add Shortcuts */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              ➕ نیا سامان یا کھاتہ شامل کریں (Quick Add)
            </h4>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => {
                  onClose();
                  setCurrentTab('inventory');
                  onOpenAddModal('item');
                }}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-600 transition-colors text-left"
              >
                <Package className="w-4 h-4 text-amber-600" />
                <span className="font-semibold text-xs">نیا سامان (New Inventory Item)</span>
              </button>
              <button
                onClick={() => {
                  onClose();
                  setCurrentTab('khata');
                  onOpenAddModal('customer');
                }}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-600 transition-colors text-left"
              >
                <Users className="w-4 h-4 text-amber-600" />
                <span className="font-semibold text-xs">نیا گاہک (New Customer Khata)</span>
              </button>
              <button
                onClick={() => {
                  onClose();
                  setCurrentTab('suppliers');
                  onOpenAddModal('supplier');
                }}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-600 transition-colors text-left"
              >
                <Truck className="w-4 h-4 text-amber-600" />
                <span className="font-semibold text-xs">نیا سپلائر (New Supplier)</span>
              </button>
              <button
                onClick={() => {
                  onClose();
                  setCurrentTab('hisab');
                  onOpenAddModal('expense');
                }}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-600 transition-colors text-left"
              >
                <DollarSign className="w-4 h-4 text-amber-600" />
                <span className="font-semibold text-xs">نیا خرچہ (New Expense)</span>
              </button>
            </div>
          </div>

          {/* Section 2: App & Shop Settings */}
          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              ⚙️ دکان کی ترتیبات (Shop Settings)
            </h4>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => {
                  onClose();
                  onOpenSettings();
                }}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
              >
                <Settings className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <span className="font-semibold text-xs">شاپ پروفائل اور پرنٹر سائز</span>
              </button>
              <button
                onClick={() => {
                  onClose();
                  onOpenAI();
                }}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-700 dark:text-amber-300 transition-colors text-left"
              >
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span className="font-semibold text-xs">AI بزنس مشیر (Gemini AI)</span>
              </button>
              <button
                onClick={() => {
                  onClose();
                  setRole(role === 'admin' ? 'salesman' : 'admin');
                }}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
              >
                <Shield className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <span className="font-semibold text-xs">موجودہ رول: {role === 'admin' ? '👑 Admin' : '👷 Salesman'}</span>
              </button>
              <button
                onClick={() => {
                  onClose();
                  setLang(lang === 'ur' ? 'en' : 'ur');
                }}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
              >
                <Globe className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <span className="font-semibold text-xs">زبان تبدیل کریں: {lang === 'ur' ? 'English' : 'اردو'}</span>
              </button>
            </div>
          </div>

          {/* Section 3: Reset / Backup */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={() => {
                if (confirm('Are you sure you want to reset all data to default demo state?')) {
                  onResetData();
                  onClose();
                }
              }}
              className="w-full py-2.5 px-3 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-600 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>فیکٹری ڈیٹا ری سیٹ کریں</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
