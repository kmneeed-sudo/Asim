import React from 'react';
import { Bill, ShopSettings } from '../types';

interface ThermalReceiptProps {
  bill: Bill;
  settings: ShopSettings;
  onClose?: () => void;
}

export const ThermalReceipt: React.FC<ThermalReceiptProps> = ({ bill, settings, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const itemsText = bill.items.map(i => `• ${i.name} x ${i.qty} ${i.rate} = Rs. ${i.total}`).join('\n');
    const text = `🧾 *${settings.shopNameUr}* (${settings.shopNameEn})
Bill #: ${bill.billNumber}
Date: ${new Date(bill.timestamp).toLocaleString()}
Customer: ${bill.customerName}

-----------------------------------
${itemsText}
-----------------------------------
*Subtotal:* Rs. ${bill.subtotal}
${bill.discount > 0 ? `*Discount:* Rs. ${bill.discount}\n` : ''}*Total Amount:* Rs. ${bill.total}
*Paid:* Rs. ${bill.paidAmount}
*Balance / Udhaar:* Rs. ${bill.balanceAmount}
*Payment:* ${bill.paymentMethod}

${settings.footerNote}
Contact: ${settings.phone}`;

    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <h3 className="font-semibold text-lg">بل / رسید کا پیش منظر (Receipt Preview)</h3>
          {onClose && (
            <button onClick={onClose} className="text-slate-400 hover:text-white text-xl font-bold">&times;</button>
          )}
        </div>

        {/* Thermal Receipt Paper Style */}
        <div className="p-6 bg-slate-50 overflow-y-auto max-h-[60vh]">
          <div id="thermal-print-area" className="bg-white p-6 rounded-lg shadow-sm font-mono text-xs border border-dashed border-slate-300 text-slate-800">
            <div className="text-center pb-3 border-b border-slate-200">
              <h2 className="font-bold text-base">{settings.shopNameUr}</h2>
              <p className="text-[11px] text-slate-600 font-sans">{settings.shopNameEn}</p>
              <p className="text-[10px] text-slate-500">{settings.address}</p>
              <p className="text-[10px] text-slate-500">Ph: {settings.phone}</p>
            </div>

            <div className="py-2 text-[11px] border-b border-slate-200 space-y-0.5">
              <div className="flex justify-between">
                <span>Bill #: {bill.billNumber}</span>
                <span>{new Date(bill.timestamp).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Customer: {bill.customerName}</span>
                <span>{bill.customerPhone || 'Walk-in'}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[10px]">
                <span>Cashier: {bill.cashierName || 'Admin'}</span>
                <span>{new Date(bill.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
            </div>

            {/* Items Table */}
            <div className="py-2 border-b border-slate-200">
              <div className="grid grid-cols-12 font-bold text-[11px] pb-1 border-b border-slate-300">
                <span className="col-span-6">Item</span>
                <span className="col-span-2 text-center">Qty</span>
                <span className="col-span-2 text-right">Rate</span>
                <span className="col-span-2 text-right">Total</span>
              </div>
              {bill.items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 py-1 text-[11px] border-b border-slate-100 last:border-0">
                  <span className="col-span-6 truncate">{item.name}</span>
                  <span className="col-span-2 text-center">{item.qty} {item.unit || ''}</span>
                  <span className="col-span-2 text-right">{item.rate}</span>
                  <span className="col-span-2 text-right font-semibold">{item.total}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="py-2 space-y-1 text-right text-[11px] border-b border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-600">Subtotal:</span>
                <span>Rs. {bill.subtotal}</span>
              </div>
              {bill.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount:</span>
                  <span>- Rs. {bill.discount}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm pt-1 border-t border-slate-200">
                <span>Total Amount:</span>
                <span>Rs. {bill.total}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Payment Mode:</span>
                <span className="uppercase font-medium">{bill.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Paid Amount:</span>
                <span>Rs. {bill.paidAmount}</span>
              </div>
              {bill.cashReceived !== undefined && bill.cashReceived > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Cash Received:</span>
                  <span>Rs. {bill.cashReceived}</span>
                </div>
              )}
              {bill.changeReturn !== undefined && bill.changeReturn > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Change Return (بقایا واپس):</span>
                  <span>Rs. {bill.changeReturn}</span>
                </div>
              )}
              {bill.balanceAmount > 0 && (
                <div className="flex justify-between text-amber-700 font-bold">
                  <span>Bill Udhaar:</span>
                  <span>Rs. {bill.balanceAmount}</span>
                </div>
              )}
              {bill.previousBalance !== undefined && bill.previousBalance > 0 && (
                <div className="flex justify-between text-slate-500 pt-1 border-t border-dashed border-slate-200">
                  <span>Purana Udhaar:</span>
                  <span>Rs. {bill.previousBalance}</span>
                </div>
              )}
              {bill.previousBalance !== undefined && (bill.previousBalance > 0 || bill.balanceAmount > 0) && (
                <div className="flex justify-between text-red-700 font-bold">
                  <span>Kul Khata Balance:</span>
                  <span>Rs. {(bill.previousBalance || 0) + (bill.balanceAmount || 0)}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="text-center pt-3 text-[10px] text-slate-600 space-y-1">
              <p>{settings.footerNote}</p>
              <p className="font-semibold">*** Software by HardwarePro POS ***</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={handleWhatsAppShare}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <span>واتساب پر بھیجیں (WhatsApp)</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-2.5 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <span>پرنٹ کریں (Print)</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl font-medium text-sm transition-colors"
            >
              بند کریں
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
