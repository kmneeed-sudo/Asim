import React, { useState } from 'react';
import { ShopSettings, UserRole, Language } from '../types';
import { Settings, Download, RefreshCw, Check, LayoutGrid, List, Globe, Shield } from 'lucide-react';

interface SettingsModalProps {
  settings: ShopSettings;
  setSettings: React.Dispatch<React.SetStateAction<ShopSettings>>;
  role?: UserRole;
  setRole?: (role: UserRole) => void;
  lang?: Language;
  setLang?: (lang: Language) => void;
  onResetData: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  setSettings,
  role,
  setRole,
  lang = 'ur',
  setLang,
  onResetData,
  onClose,
}) => {
  const [formData, setFormData] = useState<ShopSettings>({
    ...settings,
    posViewMode: settings.posViewMode || 'grid',
  });
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSettings(formData);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  const exportBackup = () => {
    const data = {
      settings,
      localStorage: { ...localStorage },
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hardware_pro_backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold text-lg">
              {lang === 'ur' ? 'تمام ترتیبات (All Settings)' : 'All Settings'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl font-bold">&times;</button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-slate-800 dark:text-slate-200">
          
          {/* Section 1: Billing Screen View Mode (Grid / Card vs List) */}
          <div className="bg-amber-50 dark:bg-amber-950/30 p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/50 space-y-2">
            <label className="block text-xs font-bold text-amber-900 dark:text-amber-300">
              🖼️ بلنگ سکرین ویو (POS Item Display Layout)
            </label>
            <p className="text-[11px] text-amber-800 dark:text-amber-400">
              سامان دکھانے کا انداز منتخب کریں (اینٹیں / 3 کارڈ ویو یا لسٹ ویو)
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, posViewMode: 'grid' })}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                  formData.posViewMode === 'grid'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span>گرڈ / 3 کارڈ ویو (Grid View)</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, posViewMode: 'list' })}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                  formData.posViewMode === 'list'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                <List className="w-4 h-4" />
                <span>لسٹ ویو (List View)</span>
              </button>
            </div>
          </div>

          {/* Section 2: Quick Preferences (Language & Role) */}
          {(setLang || setRole) && (
            <div className="grid grid-cols-2 gap-3">
              {setLang && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-amber-600" />
                    <span>زبان (Language)</span>
                  </label>
                  <select
                    value={lang}
                    onChange={(e) => setLang(e.target.value as Language)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold"
                  >
                    <option value="ur">اردو (Urdu)</option>
                    <option value="en">English</option>
                  </select>
                </div>
              )}

              {setRole && role && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-amber-600" />
                    <span>صارف کا رول (User Role)</span>
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold"
                  >
                    <option value="admin">👑 Admin (تمام اختیارات)</option>
                    <option value="salesman">👷 Salesman (صرف بلنگ)</option>
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Section 3: Shop Details */}
          <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">🏪 دکان کی بنیادی تفصیلات (Shop Details)</h4>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">دکان کا نام (اردو)</label>
              <input
                type="text"
                required
                value={formData.shopNameUr}
                onChange={(e) => setFormData({ ...formData, shopNameUr: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Shop Name (English)</label>
              <input
                type="text"
                required
                value={formData.shopNameEn}
                onChange={(e) => setFormData({ ...formData, shopNameEn: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">مالک کا نام</label>
                <input
                  type="text"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">فون نمبر</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">پتہ (Address)</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Section 4: Hardware Printer & Password */}
          <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">🖨️ پرنٹر اور پاس ورڈ (Printer & Security)</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">پرنٹر سائز</label>
                <select
                  value={formData.printerSize}
                  onChange={(e) => setFormData({ ...formData, printerSize: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold"
                >
                  <option value="58mm">58mm Thermal Receipt</option>
                  <option value="80mm">80mm Thermal Receipt</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">ایڈٹ / ڈلیٹ پاس ورڈ</label>
                <input
                  type="text"
                  required
                  value={formData.editDeletePassword || '1122'}
                  onChange={(e) => setFormData({ ...formData, editDeletePassword: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">رسید کے نیچے کا پیغام (Footer Note)</label>
              <input
                type="text"
                value={formData.footerNote}
                onChange={(e) => setFormData({ ...formData, footerNote: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Backup & Reset */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={exportBackup}
              className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>بیک اپ ڈاؤن لوڈ</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (confirm('Are you sure you want to reset all data to default demo state?')) {
                  onResetData();
                  onClose();
                }
              }}
              className="px-3.5 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-600 rounded-xl text-xs font-semibold flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>ری سیٹ ڈیٹا</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              منسوخ کریں
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-2"
            >
              {saved ? <Check className="w-4 h-4" /> : null}
              <span>{saved ? 'محفوظ ہوگیا!' : 'تبدیلیاں محفوظ کریں'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

