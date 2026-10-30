import React from 'react';
import { ShoppingCart, Package, BookOpen, Truck, BarChart2 } from 'lucide-react';
import { Language } from '../types';

interface MobileBottomNavProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  lang: Language;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ currentTab, setCurrentTab, lang }) => {
  const tabs = [
    { id: 'pos', labelUr: 'بلنگ', labelEn: 'POS', icon: ShoppingCart },
    { id: 'inventory', labelUr: 'سامان', labelEn: 'Stock', icon: Package },
    { id: 'khata', labelUr: 'ادھار', labelEn: 'Khata', icon: BookOpen },
    { id: 'suppliers', labelUr: 'سپلائر', labelEn: 'Suppliers', icon: Truck },
    { id: 'hisab', labelUr: 'رپورٹ', labelEn: 'Reports', icon: BarChart2 },
  ];

  return (
    <div className="xl:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-40 px-2 py-2 flex items-center justify-around shadow-lg">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setCurrentTab(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-colors ${
              isActive
                ? 'text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/40'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Icon className="w-5 h-5 mb-1" />
            <span className="text-[11px] leading-tight">{lang === 'ur' ? tab.labelUr : tab.labelEn}</span>
          </button>
        );
      })}
    </div>
  );
};
