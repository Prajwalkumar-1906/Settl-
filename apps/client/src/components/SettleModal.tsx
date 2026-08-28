import React, { useState } from 'react';
import { OptimizedTransaction, Currency } from 'shared-types';
import { X, Heart, ShieldCheck, ArrowRight, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SettleModalProps {
  isOpen: boolean;
  transaction: OptimizedTransaction | null;
  onClose: () => void;
  onConfirmSettlement: (fromUserId: string, toUserId: string, amount: number, enableRoundUp: boolean) => void;
}

export const SettleModal: React.FC<SettleModalProps> = ({
  isOpen,
  transaction,
  onClose,
  onConfirmSettlement,
}) => {
  if (!isOpen || !transaction) return null;

  const currencySymbol = transaction.currency === 'EUR' ? '€' : transaction.currency === 'GBP' ? '£' : '$';
  const [enableRoundUp, setEnableRoundUp] = useState(true);

  // Compute round up donation amount
  const baseAmount = transaction.amount;
  const roundedTarget = Math.ceil(baseAmount / 10) * 10;
  const donationAmount = Math.max(2.0, Math.round((roundedTarget - baseAmount) * 100) / 100);
  const totalCharge = enableRoundUp ? Math.round((baseAmount + donationAmount) * 100) / 100 : baseAmount;

  const handleSettle = () => {
    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#10b981', '#a855f7'],
      });
    } catch (e) {
      // fallback if canvas-confetti non-browser
    }

    onConfirmSettlement(transaction.fromUser.id, transaction.toUser.id, transaction.amount, enableRoundUp);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="glass-modal w-full max-w-md rounded-2xl p-6 border border-emerald-500/30 shadow-glow-emerald relative text-left">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <ShieldCheck className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-xl font-bold text-white">Settle Debt Transaction</h3>
            <p className="text-xs text-slate-400">Algorithmic debt resolution</p>
          </div>
        </div>

        {/* Transfer Visual Card */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 my-4 flex items-center justify-between">
          <div className="text-center">
            <img
              src={transaction.fromUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={transaction.fromUser.name}
              className="w-12 h-12 rounded-full border-2 border-rose-500/60 mx-auto mb-1 object-cover"
            />
            <div className="text-xs font-bold text-white">{transaction.fromUser.name}</div>
            <div className="text-[10px] text-rose-400 font-semibold">Payer (Debtor)</div>
          </div>

          <div className="flex flex-col items-center">
            <div className="text-sm font-extrabold text-cyan-400">
              {currencySymbol}{transaction.amount.toFixed(2)}
            </div>
            <ArrowRight className="w-5 h-5 text-cyan-400 my-1 animate-pulse" />
            <div className="text-[10px] text-slate-400">Simplified Edge</div>
          </div>

          <div className="text-center">
            <img
              src={transaction.toUser.avatarUrl || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150'}
              alt={transaction.toUser.name}
              className="w-12 h-12 rounded-full border-2 border-emerald-500/60 mx-auto mb-1 object-cover"
            />
            <div className="text-xs font-bold text-white">{transaction.toUser.name}</div>
            <div className="text-[10px] text-emerald-400 font-semibold">Recipient (Creditor)</div>
          </div>
        </div>

        {/* Round-Up Donation Social Good Hook */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-teal-950/20 to-slate-900 border border-emerald-500/30 my-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={enableRoundUp}
              onChange={(e) => setEnableRoundUp(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-900"
            />
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                <Heart className="w-4 h-4 fill-emerald-400 text-emerald-400" />
                Round Up & Donate ({currencySymbol}{donationAmount.toFixed(2)})
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Round up transaction to pool into group charity for{' '}
                <span className="text-emerald-400 font-medium">Clean Oceans & Reforestation</span>.
              </p>
            </div>
          </label>
        </div>

        <div className="flex justify-between items-center px-1 text-xs text-slate-400 mb-6">
          <span>Base Settlement Debt:</span>
          <span className="font-bold text-white">{currencySymbol}{baseAmount.toFixed(2)}</span>
        </div>
        {enableRoundUp && (
          <div className="flex justify-between items-center px-1 text-xs text-slate-400 mb-6 -mt-4">
            <span>Round-Up Social Donation:</span>
            <span className="font-bold text-emerald-400">+{currencySymbol}{donationAmount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between items-center px-1 text-sm font-bold text-white mb-6 pt-2 border-t border-slate-800">
          <span>Total Payment Amount:</span>
          <span className="text-cyan-400 text-base">{currencySymbol}{totalCharge.toFixed(2)}</span>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSettle}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold transition-all shadow-glow-emerald flex items-center justify-center gap-1.5"
          >
            <CheckCircle className="w-4 h-4" />
            Complete Settlement
          </button>
        </div>
      </div>
    </div>
  );
};
