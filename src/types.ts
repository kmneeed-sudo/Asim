export type UserRole = 'admin' | 'salesman';
export type Language = 'en' | 'ur';

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Plumbing' | 'Electrical' | 'Fasteners' | 'Tools' | 'Paints' | 'General';
  barcode: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  minStock: number;
  unit: 'pcs' | 'kg' | 'box' | 'mtr' | 'packet' | 'litr';
  lastUpdated?: string;
}

export interface BillItem {
  itemId: string;
  name: string;
  qty: number;
  rate: number;
  discount: number; // percentage or flat
  total: number;
}

export interface Bill {
  id: string;
  billNumber: string;
  timestamp: string;
  customerName: string;
  customerPhone: string;
  items: BillItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: 'Cash' | 'UPI/Bank' | 'Udhaar';
  paidAmount: number;
  balanceAmount: number;
  cashierName: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  balance: number; // Udhaar balance (+ means they owe us)
  creditLimit: number;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  category: string;
  balance: number; // (+ means we owe them)
  lastOrderDate: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: 'Rent' | 'Electricity' | 'Transport' | 'Salary' | 'Tea/Food' | 'Other';
  date: string;
  notes?: string;
}

export interface DailyHisab {
  date: string;
  openingCash: number;
  totalSales: number;
  cashSales: number;
  onlineSales: number;
  udhaarSales: number;
  cashExpenses: number;
  cashReceivedFromCredit: number;
  cashInHand: number;
}

export interface ShopSettings {
  shopNameUr: string;
  shopNameEn: string;
  ownerName: string;
  phone: string;
  address: string;
  printerSize: '58mm' | '80mm';
  taxPercent: number;
  footerNote: string;
  editDeletePassword: string;
}
