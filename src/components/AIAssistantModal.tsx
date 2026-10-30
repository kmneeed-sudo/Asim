import React, { useState } from 'react';
import { Sparkles, Send, Bot, User, Loader2 } from 'lucide-react';
import { InventoryItem, Customer, Bill } from '../types';

interface AIAssistantModalProps {
  inventory: InventoryItem[];
  customers: Customer[];
  bills: Bill[];
  onClose: () => void;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  inventory,
  customers,
  bills,
  onClose,
}) => {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: 'السلام علیکم! میں آپ کا ہارڈویئر شاپ کا AI بزنس مشیر ہوں۔ بتائیں میں انوینٹری، گاہکوں کے ادھار، یا قیمتوں کے بارے میں کیا مدد کر سکتا ہوں؟',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const lowStockItems = inventory.filter((i) => i.stock <= i.minStock).map((i) => i.name);
      const totalUdhaar = customers.reduce((acc, c) => acc + c.balance, 0);

      const context = {
        totalInventoryItems: inventory.length,
        lowStockItems,
        totalCustomersUdhaar: totalUdhaar,
        recentSalesCount: bills.length,
      };

      const res = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMsg, context }),
      });

      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setMessages((prev) => [...prev, { role: 'assistant', text: data.text }]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: `معذرت، اے آئی سروس فی الحال دستیاب نہیں ہے: ${err.message || 'Error'}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-amber-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            <h3 className="font-bold text-base">ہارڈویئر شاپ AI بزنس مشیر</h3>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white text-xl font-bold">&times;</button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50 dark:bg-slate-950/50">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  m.role === 'user' ? 'bg-amber-600 text-white' : 'bg-slate-900 text-amber-400'
                }`}
              >
                {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div
                className={`max-w-[80%] p-3.5 rounded-2xl text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-amber-600 text-white rounded-tr-none'
                    : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-tl-none shadow-xs'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-slate-400 text-xs italic">
              <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
              <span>AI سوچ رہا ہے...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="سوال پوچھیں (مثال: کون سا سامان ختم ہونے والا ہے؟)..."
            className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center transition-colors shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
