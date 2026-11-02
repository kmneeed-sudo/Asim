import React from 'react';
import { ShoppingCart, Package, BookOpen } from 'lucide-react';
import { Language } from '../types';

interface MobileBottomNavProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  lang: Language;
  cartItemsCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ currentTab, setCurrentTab, lang, cartItemsCount = 0 }) => {
  const tabs = [
    { id: 'pos', labelUr: 'بلنگ', labelEn: 'POS', icon: ShoppingCart },
    { id: 'cart', labelUr: 'کارٹ', labelEn: 'Cart', icon: ShoppingCart, badge: cartItemsCount },
    { id: 'inventory', labelUr: 'سامان', labelEn: 'Stock', icon: Package },
    { id: 'khata', labelUr: 'ادھار', labelEn: 'Khata', icon: BookOpen },
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
            className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-colors ${
              isActive
                ? 'text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/40'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <div className="relative">
              <Icon className="w-5 h-5 mb-1" />
              {tab.badge && tab.badge > 0 ? (
                <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">
                  {tab.badge}
                </span>
              ) : null}
            </div>
            <span className="text-[11px] leading-tight">{lang === 'ur' ? tab.labelUr : tab.labelEn}</span>
          </button>
        );
      })}
    </div>
  );
};
