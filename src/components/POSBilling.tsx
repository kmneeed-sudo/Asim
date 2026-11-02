import React, { useState, useEffect, useRef } from 'react';
import { InventoryItem, Bill, BillItem, Customer, ShopSettings } from '../types';
import {
  Search,
  Barcode,
  Plus,
  Minus,
  Trash2,
  Printer,
  CheckCircle,
  User,
  CreditCard,
  DollarSign,
  QrCode,
  AlertTriangle,
  History,
  PauseCircle,
  PlayCircle,
  UserPlus,
  ArrowRight,
  RotateCcw,
  Percent,
  Check,
  X,
  Share2,
  Calendar,
  FileText,
  ShoppingCart,
  LayoutGrid,
  List,
  Tag,
  Store
} from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { ThermalReceipt } from './ThermalReceipt';

interface POSBillingProps {
  inventory: InventoryItem[];
  customers: Customer[];
  setCustomers?: React.Dispatch<React.SetStateAction<Customer[]>>;
  bills?: Bill[];
  setBills?: React.Dispatch<React.SetStateAction<Bill[]>>;
  settings: ShopSettings;
  onCompleteSale: (bill: Bill, updatedInventory: InventoryItem[], updatedCustomer?: Customer) => void;
  lang: 'en' | 'ur';
  currentTab?: string;
  setCurrentTab?: (tab: string) => void;
  cart?: BillItem[];
  setCart?: React.Dispatch<React.SetStateAction<BillItem[]>>;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
  selectedCustomerId?: string;
  setSelectedCustomerId?: (id: string) => void;
  paymentMethod?: 'Cash' | 'UPI/Bank' | 'Udhaar' | 'Partial';
  setPaymentMethod?: (m: 'Cash' | 'UPI/Bank' | 'Udhaar' | 'Partial') => void;
  paidAmount?: number;
  setPaidAmount?: (n: number) => void;
  cashReceived?: number;
  setCashReceived?: (n: number) => void;
  billDiscount?: number;
  setBillDiscount?: (n: number) => void;
  billNotes?: string;
  setBillNotes?: (s: string) => void;
  parkedBills?: ParkedBill[];
  setParkedBills?: React.Dispatch<React.SetStateAction<ParkedBill[]>>;
}

interface ParkedBill {
  id: string;
  name: string;
  timestamp: string;
  cart: BillItem[];
  selectedCustomerId: string;
  billDiscount: number;
}

export const POSBilling: React.FC<POSBillingProps> = ({
  inventory,
  customers,
  setCustomers,
  bills = [],
  setBills,
  settings,
  onCompleteSale,
  lang,
  currentTab = 'pos',
  setCurrentTab,
  cart: propCart,
  setCart: propSetCart,
  searchQuery: propSearchQuery,
  setSearchQuery: propSetSearchQuery,
  selectedCustomerId: propSelectedCustomerId,
  setSelectedCustomerId: propSetSelectedCustomerId,
  paymentMethod: propPaymentMethod,
  setPaymentMethod: propSetPaymentMethod,
  paidAmount: propPaidAmount,
  setPaidAmount: propSetPaidAmount,
  cashReceived: propCashReceived,
  setCashReceived: propSetCashReceived,
  billDiscount: propBillDiscount,
  setBillDiscount: propSetBillDiscount,
  billNotes: propBillNotes,
  setBillNotes: propSetBillNotes,
  parkedBills: propParkedBills,
  setParkedBills: propSetParkedBills,
}) => {
  // Main view modes
  const [activeView, setActiveView] = useState<'billing' | 'history' | 'parked'>('billing');
  const [showCartModal, setShowCartModal] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(settings.posViewMode || 'grid');

  useEffect(() => {
    if (settings.posViewMode) {
      setViewMode(settings.posViewMode);
    }
  }, [settings.posViewMode]);

  // Search & Filter
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const searchQuery = propSearchQuery !== undefined ? propSearchQuery : localSearchQuery;
  const setSearchQuery = propSetSearchQuery !== undefined ? propSetSearchQuery : setLocalSearchQuery;
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Cart & Bill states (with fallback to local state if not provided via props)
  const [localCart, setLocalCart] = useState<BillItem[]>([]);
  const cart = propCart !== undefined ? propCart : localCart;
  const setCart = propSetCart !== undefined ? propSetCart : setLocalCart;

  const [localCustId, setLocalCustId] = useState<string>('walk-in');
  const selectedCustomerId = propSelectedCustomerId !== undefined ? propSelectedCustomerId : localCustId;
  const setSelectedCustomerId = propSetSelectedCustomerId !== undefined ? propSetSelectedCustomerId : setLocalCustId;

  const [localPayMethod, setLocalPayMethod] = useState<'Cash' | 'UPI/Bank' | 'Udhaar' | 'Partial'>('Cash');
  const paymentMethod = propPaymentMethod !== undefined ? propPaymentMethod : localPayMethod;
  const setPaymentMethod = propSetPaymentMethod !== undefined ? propSetPaymentMethod : setLocalPayMethod;

  const [localPaid, setLocalPaid] = useState<number>(0);
  const paidAmount = propPaidAmount !== undefined ? propPaidAmount : localPaid;
  const setPaidAmount = propSetPaidAmount !== undefined ? propSetPaidAmount : setLocalPaid;

  const [localCashRec, setLocalCashRec] = useState<number>(0);
  const cashReceived = propCashReceived !== undefined ? propCashReceived : localCashRec;
  const setCashReceived = propSetCashReceived !== undefined ? propSetCashReceived : setLocalCashRec;

  const [localDisc, setLocalDisc] = useState<number>(0);
  const billDiscount = propBillDiscount !== undefined ? propBillDiscount : localDisc;
  const setBillDiscount = propSetBillDiscount !== undefined ? propSetBillDiscount : setLocalDisc;

  const [localNotes, setLocalNotes] = useState<string>('');
  const billNotes = propBillNotes !== undefined ? propBillNotes : localNotes;
  const setBillNotes = propSetBillNotes !== undefined ? propSetBillNotes : setLocalNotes;

  // Modals
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [selectedItemForQty, setSelectedItemForQty] = useState<InventoryItem | null>(null);
  const [modalQty, setModalQty] = useState<number>(1);
  const [modalRate, setModalRate] = useState<number>(0);
  const [modalDiscount, setModalDiscount] = useState<number>(0);

  // Quick Customer Add Modal
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');

  // Scanner & Receipt modals
  const [showScanner, setShowScanner] = useState<boolean>(false);
  const [completedBill, setCompletedBill] = useState<Bill | null>(null);
  const [selectedHistoryBill, setSelectedHistoryBill] = useState<Bill | null>(null);

  // Parked / Held Bills
  const [localParked, setLocalParked] = useState<ParkedBill[]>(() => {
    try {
      const saved = localStorage.getItem('hardware_parked_bills');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Error reading parked bills:', e);
    }
    return [];
  });
  const parkedBills = propParkedBills !== undefined ? propParkedBills : localParked;
  const setParkedBills = propSetParkedBills !== undefined ? propSetParkedBills : setLocalParked;

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  // Save parked bills to localStorage
  useEffect(() => {
    localStorage.setItem('hardware_parked_bills', JSON.stringify(parkedBills));
  }, [parkedBills]);

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

  // Open Quantity Selection Modal for an Item
  const handleItemCardClick = (item: InventoryItem) => {
    if (item.stock <= 0) {
      alert(lang === 'ur' ? 'معذرت، یہ سامان ختم ہو چکا ہے (Out of Stock)' : 'Item is out of stock!');
      return;
    }

    const existingCartItem = cart.find((ci) => ci.itemId === item.id);

    setSelectedItemForQty(item);
    setModalRate(existingCartItem ? existingCartItem.rate : item.sellingPrice);
    setModalQty(existingCartItem ? existingCartItem.qty : 1);
    setModalDiscount(existingCartItem ? existingCartItem.discount : 0);
    setItemModalOpen(true);
  };

  // Add/Update Item into Cart from Quantity Modal
  const handleConfirmAddToCart = () => {
    if (!selectedItemForQty) return;

    if (modalQty <= 0) {
      alert(lang === 'ur' ? 'براہ کرم صحیح مقدار (Quantity) درج کریں۔' : 'Please enter valid quantity.');
      return;
    }

    if (modalQty > selectedItemForQty.stock) {
      alert(
        lang === 'ur'
          ? `دستیاب سٹاک صرف ${selectedItemForQty.stock} ${selectedItemForQty.unit} ہے۔ اس سے زیادہ مقدار ممکن نہیں۔`
          : `Available stock is only ${selectedItemForQty.stock} ${selectedItemForQty.unit}.`
      );
      return;
    }

    const lineTotal = Math.max(0, modalQty * modalRate - modalDiscount);

    setCart((prev) => {
      const existingIndex = prev.findIndex((ci) => ci.itemId === selectedItemForQty.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          qty: modalQty,
          rate: modalRate,
          discount: modalDiscount,
          total: lineTotal,
          unit: selectedItemForQty.unit,
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            itemId: selectedItemForQty.id,
            name: selectedItemForQty.name,
            qty: modalQty,
            rate: modalRate,
            discount: modalDiscount,
            total: lineTotal,
            unit: selectedItemForQty.unit,
          },
        ];
      }
    });

    setItemModalOpen(false);
    setSelectedItemForQty(null);
  };

  // Quick adjust in cart
  const updateQuantity = (itemId: string, delta: number) => {
    const item = inventory.find((i) => i.id === itemId);
    setCart((prev) =>
      prev
        .map((ci) => {
          if (ci.itemId === itemId) {
            const newQty = ci.qty + delta;
            if (newQty <= 0) return null;
            if (item && newQty > item.stock) {
              alert(lang === 'ur' ? 'سٹاک کی حد ختم ہو چکی ہے!' : 'Stock limit reached!');
              return ci;
            }
            const lineTotal = Math.max(0, newQty * ci.rate - (ci.discount || 0));
            return { ...ci, qty: newQty, total: lineTotal };
          }
          return ci;
        })
        .filter(Boolean) as BillItem[]
    );
  };

  const updateRate = (itemId: string, rate: number) => {
    setCart((prev) =>
      prev.map((ci) =>
        ci.itemId === itemId
          ? { ...ci, rate, total: Math.max(0, ci.qty * rate - (ci.discount || 0)) }
          : ci
      )
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((ci) => ci.itemId !== itemId));
  };

  const clearCart = () => {
    if (cart.length === 0) return;
    if (confirm(lang === 'ur' ? 'کیا آپ تمام کارٹ خالی کرنا چاہتے ہیں؟' : 'Clear entire cart?')) {
      setCart([]);
      setBillDiscount(0);
      setPaidAmount(0);
      setCashReceived(0);
    }
  };

  // Park / Hold current bill
  const handleParkBill = () => {
    if (cart.length === 0) {
      alert(lang === 'ur' ? 'ہولڈ کرنے کے لیے کارٹ میں کوئی سامان نہیں ہے۔' : 'Cart is empty!');
      return;
    }

    const currentCustomer = customers.find((c) => c.id === selectedCustomerId);
    const parked: ParkedBill = {
      id: `PARK-${Date.now().toString().slice(-5)}`,
      name: currentCustomer ? currentCustomer.name : `نقد گاہک (${cart.length} سامان)`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      cart,
      selectedCustomerId,
      billDiscount,
    };

    setParkedBills((prev) => [parked, ...prev]);
    setCart([]);
    setBillDiscount(0);
    setPaidAmount(0);
    setCashReceived(0);
    setSelectedCustomerId('walk-in');
    setShowCartModal(false);
    alert(lang === 'ur' ? 'بل کامیابی سے ہولڈ (Park) کر دیا گیا ہے۔' : 'Bill parked successfully!');
  };

  // Restore parked bill
  const handleRestoreParkedBill = (parked: ParkedBill) => {
    if (cart.length > 0) {
      if (!confirm(lang === 'ur' ? 'موجودہ کارٹ تبدیل ہو جائے گا۔ کیا آپ جاری رکھنا چاہتے ہیں؟' : 'Replace current cart?')) {
        return;
      }
    }

    setCart(parked.cart);
    setSelectedCustomerId(parked.selectedCustomerId);
    setBillDiscount(parked.billDiscount);
    setParkedBills((prev) => prev.filter((p) => p.id !== parked.id));
    setActiveView('billing');
    setShowCartModal(true);
  };

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + item.total, 0);
  const finalTotal = Math.max(0, subtotal - billDiscount);

  // Selected customer details
  const currentSelectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  // Auto set paid amount when total changes
  useEffect(() => {
    if (paymentMethod === 'Cash' || paymentMethod === 'UPI/Bank') {
      setPaidAmount(finalTotal);
      setCashReceived(finalTotal);
    } else if (paymentMethod === 'Udhaar') {
      setPaidAmount(0);
      setCashReceived(0);
    }
  }, [finalTotal, paymentMethod]);

  // Cash change return
  const changeReturn = paymentMethod === 'Cash' && cashReceived > finalTotal ? cashReceived - finalTotal : 0;

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
            scanner.clear();
            setShowScanner(false);
            handleItemCardClick(found);
          } else {
            alert(`Item with barcode ${decodedText} not found in inventory.`);
          }
        },
        () => {}
      );
      scannerRef.current = scanner;
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, [showScanner, inventory]);

  // Add new customer right from POS
  const handleQuickAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) return;

    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      name: newCustName.trim(),
      phone: newCustPhone.trim(),
      address: newCustAddress.trim(),
      balance: 0,
      creditLimit: 50000,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    if (setCustomers) {
      setCustomers((prev) => [newCust, ...prev]);
    }
    setSelectedCustomerId(newCust.id);
    setNewCustName('');
    setNewCustPhone('');
    setNewCustAddress('');
    setShowAddCustomerModal(false);
  };

  // Complete & Generate Bill
  const handleCheckout = () => {
    if (cart.length === 0) {
      alert(lang === 'ur' ? 'بل میں کوئی سامان شامل نہیں ہے!' : 'Cart is empty!');
      return;
    }

    const billId = `BILL-${Date.now().toString().slice(-6)}`;
    const now = new Date().toISOString();

    let customerName = 'Walk-in Customer (نقد گاہک)';
    let customerPhone = '';
    let previousBalance = 0;

    if (currentSelectedCustomer) {
      customerName = currentSelectedCustomer.name;
      customerPhone = currentSelectedCustomer.phone;
      previousBalance = currentSelectedCustomer.balance;
    }

    const actualPaid = paymentMethod === 'Udhaar' ? 0 : Math.min(paidAmount, finalTotal);
    const balanceAmount = Math.max(0, finalTotal - actualPaid);

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
      paidAmount: actualPaid,
      balanceAmount,
      cashReceived: paymentMethod === 'Cash' ? cashReceived : undefined,
      changeReturn: paymentMethod === 'Cash' ? changeReturn : undefined,
      previousBalance: currentSelectedCustomer ? previousBalance : undefined,
      cashierName: 'Admin / Cashier',
      notes: billNotes,
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
    if (currentSelectedCustomer && balanceAmount > 0) {
      updatedCustomer = {
        ...currentSelectedCustomer,
        balance: currentSelectedCustomer.balance + balanceAmount,
      };
    }

    onCompleteSale(newBill, updatedInventory, updatedCustomer);
    setCompletedBill(newBill);
    setCart([]);
    setBillDiscount(0);
    setPaidAmount(0);
    setCashReceived(0);
    setBillNotes('');
    setSelectedCustomerId('walk-in');
    setShowCartModal(false);
  };

  const totalCartItemsCount = cart.reduce((acc, ci) => acc + ci.qty, 0);

  return (
    <div className="flex flex-col h-[calc(100vh-76px)] overflow-hidden bg-slate-100 dark:bg-slate-950 relative">


      {/* Main View Conditional Rendering */}
      {currentTab === 'cart' ? (
        /* Dedicated Cart & Checkout Tab View */
        <div className="flex-1 p-4 md:p-6 overflow-y-auto max-w-4xl mx-auto w-full">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShoppingCart className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-base">🛒 کارٹ اور بل کا خلاصہ (Cart & Bill Checkout)</h3>
              </div>
              {setCurrentTab && (
                <button
                  onClick={() => setCurrentTab('pos')}
                  className="text-amber-400 hover:text-white text-xs font-semibold flex items-center gap-1"
                >
                  <span>← کیٹلاگ پر واپس جائیں</span>
                </button>
              )}
            </div>

            {/* Cart Items List */}
            <div className="p-4 overflow-y-auto space-y-2.5 bg-slate-50 dark:bg-slate-950/50 max-h-[38vh]">
              {cart.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <ShoppingCart className="w-12 h-12 mx-auto stroke-1 text-slate-300" />
                  <p className="font-semibold text-sm">کارٹ خالی ہے (Cart is empty)</p>
                  <p className="text-xs">کیٹلاگ سے سامان سلیکٹ کر کے کارٹ میں شامل کریں۔</p>
                  {setCurrentTab && (
                    <button
                      onClick={() => setCurrentTab('pos')}
                      className="mt-2 px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-amber-700 transition-colors"
                    >
                      سامان کیٹلاگ پر جائیں
                    </button>
                  )}
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.itemId}
                    className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">{item.name}</h5>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 font-mono">
                        <span>
                          Rs. {item.rate} x {item.qty} {item.unit || ''}
                        </span>
                        {item.discount > 0 && <span className="text-emerald-600">(-{item.discount} چھوٹ)</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.itemId, -1)}
                          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 text-xs font-bold font-mono text-slate-900 dark:text-white">{item.qty}</span>
                        <button
                          onClick={() => updateQuantity(item.itemId, 1)}
                          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white font-mono min-w-[60px] text-right">
                        Rs. {item.total}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.itemId)}
                        className="text-red-400 hover:text-red-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Checkout Control Panel */}
            {cart.length > 0 && (
              <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                {/* Customer Selector & Quick Add */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      <User className="w-3.5 h-3.5" /> گاہک سلیکٹ کریں:
                    </span>
                    <button
                      onClick={() => setShowAddCustomerModal(true)}
                      className="text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1 text-[11px]"
                    >
                      <UserPlus className="w-3 h-3" />
                      <span>+ نیا گاہک رجسٹر</span>
                    </button>
                  </div>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
                  >
                    <option value="walk-in">نقد گاہک (Walk-in Customer)</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.phone || 'No phone'}) - سابقہ ادھار: Rs. {c.balance}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Payment Method Tabs */}
                <div className="grid grid-cols-3 gap-2">
                  {(['Cash', 'UPI/Bank', 'Udhaar'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setPaymentMethod(mode)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                        paymentMethod === mode
                          ? 'bg-amber-600 border-amber-600 text-white shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {mode === 'Cash' ? '💵 نقد (Cash)' : mode === 'UPI/Bank' ? '💳 آن لائن (Bank)' : '📒 ادھار (Khata)'}
                    </button>
                  ))}
                </div>

                {/* Cash Return Calculator */}
                {paymentMethod === 'Cash' && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-600 dark:text-slate-300 font-semibold">وصول شدہ رقم (Cash Received):</span>
                      <input
                        type="number"
                        value={cashReceived || ''}
                        onChange={(e) => setCashReceived(Number(e.target.value))}
                        placeholder="0"
                        className="w-32 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-right font-mono text-sm font-bold"
                      />
                    </div>
                    {changeReturn > 0 && (
                      <div className="flex justify-between items-center text-emerald-600 font-bold pt-1.5 border-t border-slate-200 dark:border-slate-700">
                        <span>بقایا واپس کریں (Change Return):</span>
                        <span className="font-mono text-base">Rs. {changeReturn}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Totals & Discount */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>سب ٹوٹل (Subtotal):</span>
                    <span className="font-mono">Rs. {subtotal}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                    <span>کل بل پر رعایت (Discount Rs):</span>
                    <input
                      type="number"
                      value={billDiscount || ''}
                      onChange={(e) => setBillDiscount(Number(e.target.value))}
                      placeholder="0"
                      className="w-24 px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-right font-mono text-xs"
                    />
                  </div>
                  <div className="flex justify-between text-lg font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span>قابل ادا کل رقم (Grand Total):</span>
                    <span className="text-amber-600 font-mono text-xl">Rs. {finalTotal}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handleParkBill}
                    className="px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <PauseCircle className="w-4 h-4 text-amber-600" />
                    <span>ہولڈ کریں</span>
                  </button>
                  <button
                    onClick={handleCheckout}
                    disabled={cart.length === 0}
                    className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-colors"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>رقم وصول کریں اور بل پرنٹ کریں</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (activeView === 'history' || currentTab === 'history') ? (
        /* Bill History View */
        <div className="flex-1 p-4 md:p-6 overflow-y-auto max-w-6xl mx-auto w-full space-y-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">📜 تمام گزشتہ بلز (All Previous Bills History)</h3>
              <p className="text-xs text-slate-500">یہاں سے کسی بھی وقت پرانی رسید دیکھیں، پرنٹ کریں یا ہسٹری چیک کریں</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 rounded-xl font-bold text-xs border border-amber-200 dark:border-amber-800">
                کل بلز: {bills.length}
              </span>
              <button
                onClick={() => {
                  setActiveView('billing');
                  if (setCurrentTab && currentTab === 'history') {
                    setCurrentTab('pos');
                  }
                }}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>سامان کیٹلاگ پر جائیں</span>
              </button>
            </div>
          </div>

          {bills.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center text-slate-400 border border-slate-200 dark:border-slate-800">
              <FileText className="w-12 h-12 mx-auto mb-3 stroke-1 text-slate-300" />
              <p className="font-semibold text-sm">ابھی تک کوئی بل جاری نہیں ہوا</p>
              <p className="text-xs mt-1">جب آپ نیا بل مکمل کریں گے تو یہاں اس کا مستقل ریکارڈ محفوظ رہے گا۔</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bills.map((b) => (
                <div
                  key={b.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">{b.billNumber}</span>
                      <span className="text-[11px] text-slate-500">{new Date(b.timestamp).toLocaleDateString()} {new Date(b.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">{b.customerName}</h4>
                      <p className="text-xs text-slate-500">{b.customerPhone || 'نقد گاہک (Walk-in)'}</p>
                    </div>
                    <div className="text-xs space-y-1 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl">
                      <div className="flex justify-between text-slate-600 dark:text-slate-300">
                        <span>آئٹمز:</span>
                        <span className="font-bold">{b.items.length} سامان</span>
                      </div>
                      <div className="flex justify-between text-slate-600 dark:text-slate-300">
                        <span>ادائیگی کا طریقہ:</span>
                        <span className="font-semibold uppercase">{b.paymentMethod}</span>
                      </div>
                      <div className="flex justify-between font-bold text-sm text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-700">
                        <span>کل بل:</span>
                        <span className="text-amber-600 font-mono">Rs. {b.total}</span>
                      </div>
                      {b.balanceAmount > 0 && (
                        <div className="flex justify-between text-red-600 font-bold">
                          <span>بقایا ادھار:</span>
                          <span className="font-mono">Rs. {b.balanceAmount}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                    <button
                      onClick={() => setSelectedHistoryBill(b)}
                      className="flex-1 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>رسید پرنٹ کریں</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Full Catalog View with Floating Cart Button */
        <div className="flex-1 flex flex-col p-3 md:p-5 overflow-hidden max-w-7xl mx-auto w-full">
          {/* Unified Search, Category & View Toggle Single Row */}
          <div className="p-3 mb-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap lg:flex-nowrap items-center gap-2 shrink-0">
            {/* Barcode Scan Button */}
            <button
              onClick={() => setShowScanner(!showScanner)}
              className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-2 rounded-xl font-medium text-xs flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
            >
              <Barcode className="w-4 h-4" />
              <span className="hidden sm:inline">بارکوڈ</span>
            </button>

            {/* Category Dropdown Select with Icon */}
            <div className="relative flex items-center shrink-0">
              <Tag className="absolute left-3 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'All' ? (lang === 'ur' ? 'تمام کیٹگریز (All Categories)' : 'All Categories') : cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Add Item Button */}
            {setCurrentTab && (
              <button
                onClick={() => setCurrentTab('inventory')}
                className="bg-slate-900 hover:bg-slate-800 text-amber-400 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition-colors shrink-0 ml-auto"
                title="سامان منیجر پر جائیں اور نیا آئٹم ایڈ کریں"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ نیا سامان ایڈ کریں</span>
              </button>
            )}
          </div>

          {/* Barcode Scanner Modal View */}
          {showScanner && (
            <div className="p-3 mb-3 bg-slate-900 text-white rounded-xl space-y-2 shrink-0">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold">کیمرہ بارکوڈ سکینر (Scan Barcode)</span>
                <button onClick={() => setShowScanner(false)} className="text-slate-400 hover:text-white text-lg font-bold">
                  &times;
                </button>
              </div>
              <div id="reader" className="w-full bg-black rounded-lg overflow-hidden"></div>
            </div>
          )}

          {/* Product Catalog Display (Grid View or List View) */}
          {viewMode === 'grid' ? (
            <div className="flex-1 overflow-y-auto grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 pb-20">
              {filteredInventory.map((item) => {
                const isLowStock = item.stock <= item.minStock;
                const inCart = cart.find((ci) => ci.itemId === item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => handleItemCardClick(item)}
                    className={`p-2.5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all hover:shadow-lg relative ${
                      item.stock <= 0
                        ? 'bg-slate-100 dark:bg-slate-800/40 opacity-60 border-slate-200 dark:border-slate-800'
                        : inCart
                        ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-500 shadow-sm ring-1 ring-amber-500'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-500'
                    }`}
                  >
                    {inCart && (
                      <span className="absolute -top-2 -right-2 bg-amber-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-md">
                        {inCart.qty} {item.unit}
                      </span>
                    )}

                    <div>
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <span className="text-[9px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 truncate">
                          {item.category}
                        </span>
                        {isLowStock && (
                          <span className="flex items-center text-[9px] text-amber-700 bg-amber-100 dark:bg-amber-950 px-1 py-0.2 rounded font-bold shrink-0">
                            <AlertTriangle className="w-2.5 h-2.5 mr-0.5" /> کم
                          </span>
                        )}
                      </div>
                      <h4 className="text-[11px] sm:text-xs font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight">
                        {item.name}
                      </h4>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] text-slate-500 dark:text-slate-400 block leading-none">ریٹ</span>
                        <span className="text-[11px] sm:text-xs font-bold text-slate-900 dark:text-white font-mono">
                          {item.sellingPrice}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-slate-500 dark:text-slate-400 block leading-none">سٹاک</span>
                        <span className={`text-[10px] sm:text-[11px] font-bold font-mono ${item.stock <= 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                          {item.stock}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs pb-20">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 sticky top-0">
                    <th className="p-3 font-bold">سامان کا نام (Item Name)</th>
                    <th className="p-3 font-bold">کیٹگری</th>
                    <th className="p-3 font-bold">بارکوڈ / SKU</th>
                    <th className="p-3 font-bold text-right">فروخت ریٹ</th>
                    <th className="p-3 font-bold text-right">دستیاب سٹاک</th>
                    <th className="p-3 font-bold text-center">کارٹ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredInventory.map((item) => {
                    const inCart = cart.find((ci) => ci.itemId === item.id);
                    return (
                      <tr
                        key={item.id}
                        onClick={() => handleItemCardClick(item)}
                        className={`cursor-pointer transition-colors hover:bg-amber-50/50 dark:hover:bg-amber-950/20 ${
                          inCart ? 'bg-amber-50/30 dark:bg-amber-950/20' : ''
                        }`}
                      >
                        <td className="p-3 font-bold text-slate-900 dark:text-white">
                          {item.name}
                          {inCart && (
                            <span className="ml-2 bg-amber-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                              {inCart.qty} {item.unit} in cart
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-400 font-medium">{item.category}</td>
                        <td className="p-3 font-mono text-slate-500">{item.barcode || '—'}</td>
                        <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                          Rs. {item.sellingPrice}
                        </td>
                        <td className="p-3 text-right font-mono font-bold">
                          <span className={item.stock <= 0 ? 'text-red-500' : 'text-emerald-600'}>
                            {item.stock} {item.unit}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleItemCardClick(item);
                            }}
                            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs inline-flex items-center gap-1 shadow-xs"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>ایڈ</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* CART & BILL CHECKOUT MODAL (Triggered by Cart Icon) */}
      {showCartModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 z-50 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <ShoppingCart className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-base">🛒 کارٹ اور بل کا خلاصہ (Cart & Bill Checkout)</h3>
              </div>
              <button
                onClick={() => setShowCartModal(false)}
                className="text-slate-400 hover:text-white text-2xl font-bold leading-none"
              >
                &times;
              </button>
            </div>

            {/* Cart Items Scrollable List */}
            <div className="p-4 overflow-y-auto flex-1 space-y-2.5 bg-slate-50 dark:bg-slate-950/50">
              {cart.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <p>کارٹ خالی ہے</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.itemId}
                    className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 shadow-xs"
                  >
                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => {
                        const original = inventory.find((i) => i.id === item.itemId);
                        if (original) {
                          setShowCartModal(false);
                          handleItemCardClick(original);
                        }
                      }}
                      title="Click to edit quantity"
                    >
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">{item.name}</h5>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 font-mono">
                        <span>
                          Rs. {item.rate} x {item.qty} {item.unit || ''}
                        </span>
                        {item.discount > 0 && <span className="text-emerald-600">(-{item.discount} چھوٹ)</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.itemId, -1)}
                          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 text-xs font-bold font-mono text-slate-900 dark:text-white">{item.qty}</span>
                        <button
                          onClick={() => updateQuantity(item.itemId, 1)}
                          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white font-mono min-w-[60px] text-right">
                        Rs. {item.total}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.itemId)}
                        className="text-red-400 hover:text-red-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Checkout Control Panel inside Modal */}
            <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shrink-0">
              {/* Customer Selector & Quick Add */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <User className="w-3.5 h-3.5" /> گاہک سلیکٹ کریں:
                  </span>
                  <button
                    onClick={() => setShowAddCustomerModal(true)}
                    className="text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1 text-[11px]"
                  >
                    <UserPlus className="w-3 h-3" />
                    <span>+ نیا گاہک رجسٹر</span>
                  </button>
                </div>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white"
                >
                  <option value="walk-in">نقد گاہک (Walk-in Customer)</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone || 'No phone'}) - سابقہ ادھار: Rs. {c.balance}
                    </option>
                  ))}
                </select>

                {currentSelectedCustomer && (
                  <div className="px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex justify-between items-center">
                    <span>
                      گاہک: <strong>{currentSelectedCustomer.name}</strong> ({currentSelectedCustomer.phone})
                    </span>
                    <span className="font-bold font-mono">سابقہ ادھار: Rs. {currentSelectedCustomer.balance}</span>
                  </div>
                )}
              </div>

              {/* Payment Method Tabs */}
              <div className="grid grid-cols-3 gap-2">
                {(['Cash', 'UPI/Bank', 'Udhaar'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setPaymentMethod(mode)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                      paymentMethod === mode
                        ? 'bg-amber-600 border-amber-600 text-white shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {mode === 'Cash' ? '💵 نقد (Cash)' : mode === 'UPI/Bank' ? '💳 آن لائن (Bank)' : '📒 ادھار (Khata)'}
                  </button>
                ))}
              </div>

              {/* Cash Return Calculator */}
              {paymentMethod === 'Cash' && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-600 dark:text-slate-300 font-semibold">وصول شدہ رقم (Cash Received):</span>
                    <input
                      type="number"
                      value={cashReceived || ''}
                      onChange={(e) => setCashReceived(Number(e.target.value))}
                      placeholder="0"
                      className="w-32 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-right font-mono text-sm font-bold"
                    />
                  </div>
                  <div className="flex items-center gap-1 justify-end">
                    {[500, 1000, 2000, 5000].map((note) => (
                      <button
                        key={note}
                        onClick={() => setCashReceived(note)}
                        className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 rounded text-[11px] font-mono font-bold"
                      >
                        {note}
                      </button>
                    ))}
                    <button
                      onClick={() => setCashReceived(finalTotal)}
                      className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 rounded text-[11px] font-semibold"
                    >
                      پورا کیش
                    </button>
                  </div>
                  {changeReturn > 0 && (
                    <div className="flex justify-between items-center text-emerald-600 font-bold pt-1.5 border-t border-slate-200 dark:border-slate-700">
                      <span>بقایا واپس کریں (Change Return):</span>
                      <span className="font-mono text-base">Rs. {changeReturn}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Totals & Discount */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>سب ٹوٹل (Subtotal):</span>
                  <span className="font-mono">Rs. {subtotal}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                  <span>کل بل پر رعایت (Discount Rs):</span>
                  <input
                    type="number"
                    value={billDiscount || ''}
                    onChange={(e) => setBillDiscount(Number(e.target.value))}
                    placeholder="0"
                    className="w-24 px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-right font-mono text-xs"
                  />
                </div>
                <div className="flex justify-between text-lg font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span>قابل ادا کل رقم (Grand Total):</span>
                  <span className="text-amber-600 font-mono text-xl">Rs. {finalTotal}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleParkBill}
                  className="px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <PauseCircle className="w-4 h-4 text-amber-600" />
                  <span>ہولڈ کریں</span>
                </button>
                <button
                  onClick={handleCheckout}
                  disabled={cart.length === 0}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-colors"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>رقم وصول کریں اور بل پرنٹ کریں</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NEW WINDOW / MODAL: Item Quantity, Rate & Add to Cart */}
      {itemModalOpen && selectedItemForQty && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base truncate">{selectedItemForQty.name}</h3>
                <p className="text-xs text-slate-400">
                  کیٹگری: {selectedItemForQty.category} · دستیاب سٹاک: {selectedItemForQty.stock} {selectedItemForQty.unit}
                </p>
              </div>
              <button
                onClick={() => setItemModalOpen(false)}
                className="text-slate-400 hover:text-white text-2xl font-bold leading-none"
              >
                &times;
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    فروخت ریٹ (Selling Rate Rs.)
                  </label>
                  <input
                    type="number"
                    value={modalRate}
                    onChange={(e) => setModalRate(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-sm font-bold text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    رعایت فی آئٹم (Discount Rs.)
                  </label>
                  <input
                    type="number"
                    value={modalDiscount || ''}
                    onChange={(e) => setModalDiscount(Number(e.target.value))}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                  سامان کی مقدار (Quantity in {selectedItemForQty.unit}):
                </label>
                <div className="flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800 p-2 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setModalQty((q) => Math.max(1, q - 1))}
                    className="w-12 h-12 bg-white dark:bg-slate-700 hover:bg-slate-100 rounded-xl flex items-center justify-center font-bold text-lg text-slate-700 dark:text-slate-200 shadow-xs active:scale-95 transition-all"
                  >
                    <Minus className="w-5 h-5" />
                  </button>

                  <div className="flex-1 text-center">
                    <input
                      type="number"
                      min={1}
                      max={selectedItemForQty.stock}
                      value={modalQty || ''}
                      onChange={(e) => setModalQty(Number(e.target.value))}
                      className="w-full text-center text-3xl font-extrabold font-mono bg-transparent text-slate-900 dark:text-white focus:outline-none"
                    />
                    <span className="text-[11px] font-semibold text-slate-400">{selectedItemForQty.unit}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setModalQty((q) => Math.min(selectedItemForQty.stock, q + 1))}
                    className="w-12 h-12 bg-white dark:bg-slate-700 hover:bg-slate-100 rounded-xl flex items-center justify-center font-bold text-lg text-slate-700 dark:text-slate-200 shadow-xs active:scale-95 transition-all"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-500">فوری مقدار سلیکٹ کریں (Quick Select):</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[1, 2, 5, 10, 20, 50, 100].map((num) => (
                    <button
                      key={num}
                      type="button"
                      disabled={num > selectedItemForQty.stock}
                      onClick={() => setModalQty(num)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        modalQty === num
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 disabled:opacity-30'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setModalQty(selectedItemForQty.stock)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                  >
                    پورا سٹاک ({selectedItemForQty.stock})
                  </button>
                </div>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-amber-900 dark:text-amber-200 font-semibold block">
                    اس سامان کا کل بل:
                  </span>
                  <span className="text-[11px] text-amber-700 dark:text-amber-300 font-mono">
                    Rs. {modalRate} × {modalQty} {modalDiscount > 0 ? `- Rs. ${modalDiscount}` : ''}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black font-mono text-amber-700 dark:text-amber-300">
                    Rs. {Math.max(0, modalQty * modalRate - modalDiscount)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setItemModalOpen(false)}
                  className="flex-1 py-3 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  منسوخ کریں (Cancel)
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAddToCart}
                  className="flex-2 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>کارٹ میں شامل کریں (Add to Cart)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUICK ADD CUSTOMER MODAL */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <h3 className="font-semibold text-base">نیا گاہک رجسٹر کریں</h3>
              <button
                onClick={() => setShowAddCustomerModal(false)}
                className="text-slate-400 hover:text-white text-xl font-bold"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleQuickAddCustomer} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  گاہک کا نام (Customer Name) *
                </label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="مثال: رانا فیاض"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  فون نمبر (Phone Number)
                </label>
                <input
                  type="text"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  placeholder="+92 300 1234567"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  پتہ (Address / Area)
                </label>
                <input
                  type="text"
                  value={newCustAddress}
                  onChange={(e) => setNewCustAddress(e.target.value)}
                  placeholder="مثال: گلی نمبر 4، مین روڈ"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm"
                />
              </div>
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-100"
                >
                  منسوخ کریں
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                >
                  محفوظ کریں اور سلیکٹ کریں
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Completed Bill Thermal Receipt Modal */}
      {completedBill && (
        <ThermalReceipt
          bill={completedBill}
          settings={settings}
          onClose={() => setCompletedBill(null)}
        />
      )}

      {/* History Bill Print Modal */}
      {selectedHistoryBill && (
        <ThermalReceipt
          bill={selectedHistoryBill}
          settings={settings}
          onClose={() => setSelectedHistoryBill(null)}
        />
      )}
    </div>
  );
};
