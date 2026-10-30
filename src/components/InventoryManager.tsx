import React, { useState } from 'react';
import { InventoryItem, UserRole, ShopSettings } from '../types';
import { Plus, Search, AlertTriangle, Edit, Trash2, Check, Info } from 'lucide-react';

interface InventoryManagerProps {
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  role: UserRole;
  settings: ShopSettings;
  lang: 'en' | 'ur';
  autoOpenAdd?: boolean;
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({
  inventory,
  setInventory,
  role,
  settings,
  lang,
  autoOpenAdd = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAddModal, setShowAddModal] = useState(autoOpenAdd);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [selectedRowItem, setSelectedRowItem] = useState<InventoryItem | null>(null);
  const [pressTimer, setPressTimer] = useState<any>(null);

  // Form state for add/edit item
  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    name: '',
    category: 'Plumbing',
    barcode: '',
    purchasePrice: 0,
    sellingPrice: 0,
    stock: 0,
    minStock: 10,
    unit: 'pcs',
  });

  const categories = ['All', 'Plumbing', 'Electrical', 'Fasteners', 'Tools', 'Paints', 'General'];

  const filteredItems = inventory.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesQ = item.name.toLowerCase().includes(q) || item.barcode.includes(q);
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesQ && matchesCat;
  });

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || formData.sellingPrice === undefined) {
      alert('Please fill required fields.');
      return;
    }

    if (editingItem) {
      setInventory((prev) =>
        prev.map((i) => (i.id === editingItem.id ? ({ ...i, ...formData } as InventoryItem) : i))
      );
      setEditingItem(null);
    } else {
      const newItem: InventoryItem = {
        id: `item-${Date.now()}`,
        name: formData.name || '',
        category: (formData.category as any) || 'General',
        barcode: formData.barcode || `890${Math.floor(100000 + Math.random() * 900000)}`,
        purchasePrice: Number(formData.purchasePrice) || 0,
        sellingPrice: Number(formData.sellingPrice) || 0,
        stock: Number(formData.stock) || 0,
        minStock: Number(formData.minStock) || 10,
        unit: (formData.unit as any) || 'pcs',
      };
      setInventory((prev) => [newItem, ...prev]);
    }

    setFormData({
      name: '',
      category: 'Plumbing',
      barcode: '',
      purchasePrice: 0,
      sellingPrice: 0,
      stock: 0,
      minStock: 10,
      unit: 'pcs',
    });
    setShowAddModal(false);
  };

  const handleAction = (type: 'edit' | 'delete', item: InventoryItem) => {
    if (type === 'edit') {
      setEditingItem(item);
      setFormData(item);
      setSelectedRowItem(null);
      setShowAddModal(true);
    } else {
      if (confirm('کیا آپ واقعی اس سامان کو ڈیلیٹ کرنا چاہتے ہیں؟')) {
        setInventory((prev) => prev.filter((i) => i.id !== item.id));
        setSelectedRowItem(null);
      }
    }
  };

  const handleTouchStart = (item: InventoryItem) => {
    const timer = setTimeout(() => {
      setSelectedRowItem(item);
    }, 500); // 500ms long press
    setPressTimer(timer);
  };

  const handleTouchEnd = () => {
    if (pressTimer) clearTimeout(pressTimer);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto pb-24 xl:pb-6">
      {/* Tip Banner */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 p-3 rounded-xl flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300">
        <Info className="w-4 h-4 shrink-0 text-amber-600" />
        <span>ٹپ: کسی بھی سامان پر کلک کر کے رکھیں (Long Press) یا رائٹ کلک کریں تاکہ بارکوڈ، خرید قیمت، ایڈٹ اور ڈیلیٹ کا مینو ظاہر ہو۔</span>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={lang === 'ur' ? 'سامان کا نام تلاش کریں...' : 'Search item name...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
          />
        </div>
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="p-4">Item Name</th>
                <th className="p-4">Selling Rate</th>
                <th className="p-4">Stock Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-8 text-slate-400">
                    کوئی سامان نہیں ملا
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isLow = item.stock <= item.minStock;
                  return (
                    <tr
                      key={item.id}
                      onMouseDown={() => handleTouchStart(item)}
                      onMouseUp={handleTouchEnd}
                      onTouchStart={() => handleTouchStart(item)}
                      onTouchEnd={handleTouchEnd}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setSelectedRowItem(item);
                      }}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer select-none"
                    >
                      <td className="p-4 font-bold text-slate-900 dark:text-white">
                        {item.name}
                      </td>
                      <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">
                        Rs. {item.sellingPrice}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold font-mono ${item.stock <= 0 ? 'text-red-500' : isLow ? 'text-amber-600' : 'text-emerald-600'}`}>
                            {item.stock} {item.unit}
                          </span>
                          {isLow && (
                            <span className="flex items-center text-[10px] text-amber-700 bg-amber-50 dark:bg-amber-950 px-1.5 py-0.5 rounded font-bold">
                              <AlertTriangle className="w-3 h-3 mr-0.5" /> Low Stock
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Long Press Action Modal (Showing Category, Barcode, Purchase Price, Edit, Delete) */}
      {selectedRowItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-semibold text-base truncate">{selectedRowItem.name}</h3>
              <button onClick={() => setSelectedRowItem(null)} className="text-slate-400 hover:text-white text-xl font-bold">&times;</button>
            </div>
            <div className="p-6 space-y-3 text-sm">
              <div className="flex justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Category:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{selectedRowItem.category}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Barcode:</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">{selectedRowItem.barcode}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Purchase Rate:</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">Rs. {selectedRowItem.purchasePrice}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Selling Rate:</span>
                <span className="font-mono font-semibold text-amber-600">Rs. {selectedRowItem.sellingPrice}</span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="text-slate-500">Stock Available:</span>
                <span className="font-mono font-semibold text-emerald-600">{selectedRowItem.stock} {selectedRowItem.unit}</span>
              </div>

              <div className="pt-4 flex items-center gap-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => handleAction('edit', selectedRowItem)}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <Edit className="w-4 h-4" />
                  <span>ایڈٹ کریں (Edit)</span>
                </button>
                <button
                  onClick={() => handleAction('delete', selectedRowItem)}
                  className="flex-1 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-600 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>ڈلیٹ کریں (Delete)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-semibold text-lg">
                {editingItem ? 'سامان کی تفصیل تبدیل کریں' : 'نیا سامان شامل کریں'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white text-xl font-bold">&times;</button>
            </div>

            <form onSubmit={handleSaveItem} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Item Name (سامان کا نام)</label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. PVC Pipe 2 inch"
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Category (کیٹگری)</label>
                  <select
                    value={formData.category || 'Plumbing'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm"
                  >
                    {categories.filter(c => c !== 'All').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Barcode (بارکوڈ)</label>
                  <input
                    type="text"
                    value={formData.barcode || ''}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    placeholder="Leave blank to auto-generate"
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Purchase Price (خرید قیمت)</label>
                  <input
                    type="number"
                    required
                    value={formData.purchasePrice ?? ''}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Selling Price (فروخت قیمت)</label>
                  <input
                    type="number"
                    required
                    value={formData.sellingPrice ?? ''}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Stock Qty</label>
                  <input
                    type="number"
                    required
                    value={formData.stock ?? ''}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Min Stock Alert</label>
                  <input
                    type="number"
                    required
                    value={formData.minStock ?? ''}
                    onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Unit (اکائی)</label>
                  <select
                    value={formData.unit || 'pcs'}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value as any })}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm"
                  >
                    <option value="pcs">Pcs</option>
                    <option value="kg">Kg</option>
                    <option value="mtr">Mtr</option>
                    <option value="box">Box</option>
                    <option value="packet">Packet</option>
                    <option value="litr">Litr</option>
                  </select>
                </div>
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
                  محفوظ کریں (Save)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
