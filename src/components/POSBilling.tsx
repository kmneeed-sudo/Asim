import React, { useState, useEffect, useRef } from 'react';
import { InventoryItem, Bill, BillItem, Customer, ShopSettings } from '../types';
import { Search, Barcode, Plus, Minus, Trash2, Printer, CheckCircle, User, CreditCard, DollarSign, QrCode, AlertTriangle } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { ThermalReceipt } from './ThermalReceipt';

interface POSBillingProps {
  inventory: InventoryItem[];
  customers: Customer[];
  settings: ShopSettings;
  onCompleteSale: (bill: Bill, updatedInventory: InventoryItem[], updatedCustomer?: Customer) => void;
  lang: 'en' | 'ur';
}

export const POSBilling: React.FC<POSBillingProps> = ({
  inventory,
  customers,
  settings,
  onCompleteSale,
  lang,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [cart, setCart] = useState<BillItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('walk-in');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI/Bank' | 'Udhaar'>('Cash');
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [billDiscount, setBillDiscount] = useState<number>(0);
  const [showScanner, setShowScanner] = useState<boolean>(false);
  const [completedBill, setCompletedBill] = useState<Bill | null>(null);

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  // First Word Indexing & Fast Search Algorithm
  const filteredInventory = inventory.filter((item) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return selectedCategory === 'All' || item.category === selectedCategory;

    const nameWords = item.name.toLowerCase().split(/\s+/);
    const matchesFirstWord = nameWords.some((word) => word.startsWith(q));
    const matchesName = item.name.toLowerCase().includes(q);
    const matchesBarcode = item.barcode.toLowerCase().includes(q);

    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    return (matchesFirstWord || matchesName || matchesBarcode) && matchesCat;
  });

  const categories = ['All', 'Plumbing', 'Electrical', 'Fasteners', 'Tools', 'Paints', 'General'];

  // Add to cart
  const addToCart = (item: InventoryItem) => {
    if (item.stock <= 0) {
      alert(lang === 'ur' ? 'معذرت، یہ سامان ختم ہو چکا ہے (Out of Stock)' : 'Item is out of stock!');
      return;
    }

    setCart((prev) => {
      const existing = prev.find((ci) => ci.itemId === item.id);
      if (existing) {
        if (existing.qty >= item.stock) {
          alert(lang === 'ur' ? 'اس سے زیادہ سٹاک دستیاب نہیں ہے!' : 'Cannot add more than available stock!');
          return prev;
        }
        return prev.map((ci) =>
          ci.itemId === item.id
            ? { ...ci, qty: ci.qty + 1, total: (ci.qty + 1) * ci.rate }
            : ci
        );
      } else {
        return [
          ...prev,
          {
            itemId: item.id,
            name: item.name,
            qty: 1,
            rate: item.sellingPrice,
            discount: 0,
            total: item.sellingPrice,
          },
        ];
      }
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    const item = inventory.find(i => i.id === itemId);
    setCart((prev) =>
      prev
        .map((ci) => {
          if (ci.itemId === itemId) {
            const newQty = ci.qty + delta;
            if (newQty <= 0) return null;
            if (item && newQty > item.stock) {
              alert('Stock limit reached!');
              return ci;
            }
            return { ...ci, qty: newQty, total: newQty * ci.rate };
          }
          return ci;
        })
        .filter(Boolean) as BillItem[]
    );
  };

  const updateRate = (itemId: string, rate: number) => {
    setCart((prev) =>
      prev.map((ci) => (ci.itemId === itemId ? { ...ci, rate, total: ci.qty * rate } : ci))
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((ci) => ci.itemId !== itemId));
  };

  const subtotal = cart.reduce((acc, item) => acc + item.total, 0);
  const finalTotal = Math.max(0, subtotal - billDiscount);

  // Auto set paid amount when total changes
  useEffect(() => {
    if (paymentMethod === 'Cash' || paymentMethod === 'UPI/Bank') {
      setPaidAmount(finalTotal);
    } else {
      setPaidAmount(0); // Udhaar
    }
  }, [finalTotal, paymentMethod]);

  // Barcode scanner effect
  useEffect(() => {
    if (showScanner) {
      const scanner = new Html5QrcodeScanner(
        'reader',
        { fps: 10, qrbox: { width: 250, height: 150 } },
        false
      );
      scanner.render(
        (decodedText) => {
          const found = inventory.find((i) => i.barcode === decodedText || i.id === decodedText);
          if (found) {
            addToCart(found);
            scanner.clear();
            setShowScanner(false);
          } else {
            alert(`Item with barcode ${decodedText} not found in inventory.`);
          }
        },
        (error) => {
          // scanning error ignore
        }
      );
      scannerRef.current = scanner;
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, [showScanner, inventory]);

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert(lang === 'ur' ? 'بل میں کوئی سامان شامل نہیں ہے!' : 'Cart is empty!');
      return;
    }

    const billId = `BILL-${Date.now().toString().slice(-6)}`;
    const now = new Date().toISOString();

    let customerName = 'Walk-in Customer';
    let customerPhone = '';
    let selectedCustomer: Customer | undefined = undefined;

    if (selectedCustomerId !== 'walk-in') {
      selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
      if (selectedCustomer) {
        customerName = selectedCustomer.name;
        customerPhone = selectedCustomer.phone;
      }
    }

    const balanceAmount = Math.max(0, finalTotal - paidAmount);

    const newBill: Bill = {
      id: billId,
      billNumber: billId,
      timestamp: now,
      customerName,
      customerPhone,
      items: cart,
      subtotal,
      discount: billDiscount,
      total: finalTotal,
      paymentMethod,
      paidAmount: paymentMethod === 'Udhaar' ? 0 : paidAmount,
      balanceAmount: paymentMethod === 'Udhaar' ? finalTotal : balanceAmount,
      cashierName: 'Admin / Cashier',
    };

    // Calculate updated inventory
    const updatedInventory = inventory.map((invItem) => {
      const cartItem = cart.find((ci) => ci.itemId === invItem.id);
      if (cartItem) {
        return { ...invItem, stock: Math.max(0, invItem.stock - cartItem.qty) };
      }
      return invItem;
    });

    let updatedCustomer: Customer | undefined = undefined;
    if (selectedCustomer && (paymentMethod === 'Udhaar' || balanceAmount > 0)) {
      const addedUdhaar = paymentMethod === 'Udhaar' ? finalTotal : balanceAmount;
      updatedCustomer = {
        ...selectedCustomer,
        balance: selectedCustomer.balance + addedUdhaar,
      };
    }

    onCompleteSale(newBill, updatedInventory, updatedCustomer);
    setCompletedBill(newBill);
    setCart([]);
    setBillDiscount(0);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-80px)] p-4 md:p-6 overflow-hidden">
      {/* Left Column: Inventory Search & Product Catalog */}
      <div className="lg:col-span-7 flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Search & Barcode Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={lang === 'ur' ? 'سامان تلاش کریں (مثال: Pipe, Nail)...' : 'Fast search (e.g., Pipe, Bolt, Wire)...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white"
              />
            </div>
            <button
              onClick={() => setShowScanner(!showScanner)}
              className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 shadow-sm transition-colors shrink-0"
            >
              <Barcode className="w-4 h-4" />
              <span className="hidden sm:inline">سکن بارکوڈ</span>
            </button>
          </div>

          {/* Barcode Scanner Modal View */}
          {showScanner && (
            <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold">کیمرہ بارکوڈ سکینر (Scan Barcode)</span>
                <button onClick={() => setShowScanner(false)} className="text-slate-400 hover:text-white">&times;</button>
              </div>
              <div id="reader" className="w-full bg-black rounded-lg overflow-hidden"></div>
            </div>
          )}

          {/* Categories Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 p-4 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filteredInventory.map((item) => {
            const isLowStock = item.stock <= item.minStock;
            return (
              <div
                key={item.id}
                onClick={() => addToCart(item)}
                className={`p-3.5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all hover:shadow-md ${
                  item.stock <= 0
                    ? 'bg-slate-100 dark:bg-slate-800/40 opacity-60 border-slate-200 dark:border-slate-800'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-amber-500 dark:hover:border-amber-500'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                      {item.category}
                    </span>
                    {isLowStock && (
                      <span className="flex items-center text-[10px] text-amber-700 bg-amber-50 dark:bg-amber-950 px-1.5 py-0.5 rounded font-bold">
                        <AlertTriangle className="w-3 h-3 mr-0.5" /> Low
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight">
                    {item.name}
                  </h4>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block">Rate</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">Rs. {item.sellingPrice}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 dark:text-slate-400 block">Stock</span>
                    <span className={`text-xs font-bold ${item.stock <= 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                      {item.stock} {item.unit}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: POS Cart & Checkout */}
      <div className="lg:col-span-5 flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Cart Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">🛒 کرنٹ بل (Current Cart)</h3>
          <span className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs px-2.5 py-1 rounded-full font-bold">
            {cart.length} Items
          </span>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center p-6">
              <QrCode className="w-12 h-12 mb-2 stroke-1 text-slate-300" />
              <p className="text-sm font-medium">کوئی سامان سلیکٹ نہیں کیا گیا</p>
              <p className="text-xs text-slate-400">بائیں طرف سے سامان پر کلک کریں یا بارکوڈ سکین کریں</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.itemId} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">{item.name}</h5>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-slate-500">Rate: Rs.</span>
                    <input
                      type="number"
                      value={item.rate}
                      onChange={(e) => updateRate(item.itemId, Number(e.target.value))}
                      className="w-16 px-1.5 py-0.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.itemId, -1)}
                      className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-2.5 text-xs font-bold font-mono text-slate-900 dark:text-white">{item.qty}</span>
                    <button
                      onClick={() => updateQuantity(item.itemId, 1)}
                      className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white font-mono min-w-[55px] text-right">
                    Rs. {item.total}
                  </span>
                  <button
                    onClick={() => removeFromCart(item.itemId)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Checkout Summary & Controls */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 space-y-3">
          {/* Customer Selection */}
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
            >
              <option value="walk-in">Walk-in Customer (نقد گاہک)</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.phone}) - Udhaar: Rs. {c.balance}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method */}
          <div className="grid grid-cols-3 gap-2">
            {(['Cash', 'UPI/Bank', 'Udhaar'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setPaymentMethod(mode)}
                className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                  paymentMethod === mode
                    ? 'bg-amber-600 border-amber-600 text-white'
                    : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {mode === 'Cash' ? 'نقد (Cash)' : mode === 'UPI/Bank' ? 'آن لائن (Bank)' : 'ادھار (Credit)'}
              </button>
            ))}
          </div>

          {/* Discount & Totals */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Subtotal:</span>
              <span className="font-mono">Rs. {subtotal}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
              <span>Discount (ریاض):</span>
              <input
                type="number"
                value={billDiscount || ''}
                onChange={(e) => setBillDiscount(Number(e.target.value))}
                placeholder="0"
                className="w-24 px-2 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-right font-mono text-xs"
              />
            </div>
            <div className="flex justify-between text-base font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
              <span>Grand Total:</span>
              <span className="text-amber-600 font-mono">Rs. {finalTotal}</span>
            </div>
          </div>

          {/* Complete Sale Button */}
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-colors"
          >
            <CheckCircle className="w-5 h-5" />
            <span>بل مکمل کریں اور پرنٹ کریں (Complete Sale)</span>
          </button>
        </div>
      </div>

      {/* Completed Bill Thermal Receipt Modal */}
      {completedBill && (
        <ThermalReceipt
          bill={completedBill}
          settings={settings}
          onClose={() => setCompletedBill(null)}
        />
      )}
    </div>
  );
};
