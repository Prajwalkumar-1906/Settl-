import React, { useState } from 'react';
import { GroupMember, Currency } from 'shared-types';
import { X, Camera, DollarSign, Tag, FileText, CheckCircle2 } from 'lucide-react';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: GroupMember[];
  currency: Currency;
  onAddExpense: (expenseData: any) => void;
  onOpenOcr: () => void;
  ocrPresetData?: any;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  members,
  currency,
  onAddExpense,
  onOpenOcr,
  ocrPresetData,
}) => {
  if (!isOpen) return null;

  const currencySymbol = currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';

  const [description, setDescription] = useState(ocrPresetData?.vendor || '');
  const [amount, setAmount] = useState(ocrPresetData?.totalAmount ? String(ocrPresetData.totalAmount) : '');
  const [category, setCategory] = useState(ocrPresetData?.category || 'Food');
  const [paidBy, setPaidBy] = useState(members[0]?.userId || '');
  const [splitType, setSplitType] = useState<'equal' | 'exact'>('equal');
  const [exactSplits, setExactSplits] = useState<{ [userId: string]: string }>({});

  React.useEffect(() => {
    if (ocrPresetData) {
      setDescription(ocrPresetData.vendor || '');
      setAmount(String(ocrPresetData.totalAmount || ''));
      setCategory(ocrPresetData.category || 'Food');
    }
  }, [ocrPresetData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || Number(amount) <= 0) return;

    let customSplits: any = null;
    if (splitType === 'exact') {
      customSplits = members.map((m) => ({
        userId: m.userId,
        amount: Number(exactSplits[m.userId] || 0),
      }));
    }

    onAddExpense({
      description,
      amount: Number(amount),
      category,
      paidBy: paidBy || members[0]?.userId,
      splitType,
      customSplits,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="glass-modal w-full max-w-lg rounded-2xl p-6 border border-slate-700 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-between mb-6 pr-8">
          <div>
            <h3 className="text-xl font-bold text-white">Add New Expense</h3>
            <p className="text-xs text-slate-400">Record a shared bill across group members</p>
          </div>

          <button
            type="button"
            onClick={onOpenOcr}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/40 hover:bg-purple-600 hover:text-white text-xs font-semibold transition-all shadow-glow-purple"
          >
            <Camera className="w-4 h-4" />
            Scan Receipt (OCR)
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Description / Merchant</label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Michelin Star Dinner, Airbnb Villa"
                className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Amount ({currencySymbol})</label>
              <div className="relative">
                <span className="text-slate-400 text-sm font-bold absolute left-3.5 top-2.5">{currencySymbol}</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-8 pr-3 py-2.5 text-sm text-white font-semibold focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
              >
                <option value="Food">🍔 Food & Dining</option>
                <option value="Travel">✈️ Travel & Transit</option>
                <option value="Housing">🏠 Housing & Stay</option>
                <option value="Entertainment">🎟️ Entertainment</option>
                <option value="Shopping">🛍️ Shopping</option>
                <option value="Utilities">⚡ Utilities</option>
                <option value="Other">📦 Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Who Paid?</label>
            <select
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
            >
              {members.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.user.name} ({m.user.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Split Method</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSplitType('equal')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${
                  splitType === 'equal'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500'
                    : 'bg-slate-900/50 text-slate-400 border-slate-800'
                }`}
              >
                Equal Split
              </button>
              <button
                type="button"
                onClick={() => setSplitType('exact')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${
                  splitType === 'exact'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500'
                    : 'bg-slate-900/50 text-slate-400 border-slate-800'
                }`}
              >
                Exact Amounts
              </button>
            </div>
          </div>

          {splitType === 'exact' && (
            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              <span className="text-[10px] text-slate-400">Specify amount for each person:</span>
              {members.map((m) => (
                <div key={m.userId} className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">{m.user.name}</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={exactSplits[m.userId] || ''}
                    onChange={(e) =>
                      setExactSplits({ ...exactSplits, [m.userId]: e.target.value })
                    }
                    className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white text-right text-xs"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold transition-all shadow-glow flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirm Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
