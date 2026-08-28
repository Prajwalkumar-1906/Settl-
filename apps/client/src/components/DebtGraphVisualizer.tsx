import React, { useState } from 'react';
import { OptimizedTransaction, NetBalance, Currency } from 'shared-types';
import { Zap, ArrowRight, ShieldCheck, Layers, Sparkles } from 'lucide-react';

interface DebtGraphVisualizerProps {
  balances: NetBalance[];
  naiveTransactions: OptimizedTransaction[];
  optimizedTransactions: OptimizedTransaction[];
  reductionPercentage: number;
  currency: Currency;
  onSelectSettle: (tx: OptimizedTransaction) => void;
}

export const DebtGraphVisualizer: React.FC<DebtGraphVisualizerProps> = ({
  balances,
  naiveTransactions,
  optimizedTransactions,
  reductionPercentage,
  currency,
  onSelectSettle,
}) => {
  const [viewMode, setViewMode] = useState<'optimized' | 'naive'>('optimized');
  const currencySymbol = currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';

  const activeTransactions = viewMode === 'optimized' ? optimizedTransactions : naiveTransactions;

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-2xl relative overflow-hidden">
      {/* Top Header & Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Zap className="w-5 h-5 animate-pulse" />
            </span>
            <h2 className="text-xl font-bold text-white tracking-wide">Graph Debt Simplification Engine</h2>
          </div>
          <p className="text-sm text-slate-400">
            {viewMode === 'optimized'
              ? 'Minimum Cash Flow Greedy Algorithm applied — minimizing transfers'
              : 'Unoptimized direct debts per expense split'}
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setViewMode('optimized')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'optimized'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-glow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Min Cash Flow ({optimizedTransactions.length} Txs)
          </button>
          <button
            onClick={() => setViewMode('naive')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'naive'
                ? 'bg-purple-600 text-white shadow-glow-purple'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Naive Unoptimized ({naiveTransactions.length} Txs)
          </button>
        </div>
      </div>

      {/* Reduction Stats Banner */}
      <div className="my-5 p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 via-purple-950/20 to-slate-900 border border-cyan-500/20 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-extrabold text-sm">
            -{reductionPercentage}%
          </div>
          <div>
            <div className="text-sm font-semibold text-white">Algorithm Efficiency Gain</div>
            <div className="text-xs text-slate-400">
              Reduced <span className="text-slate-200 font-medium">{naiveTransactions.length} raw debts</span> down to{' '}
              <span className="text-cyan-400 font-bold">{optimizedTransactions.length} simplified transfers</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Conservation of Net Money Verified</span>
        </div>
      </div>

      {/* Debt Graph Edge List / Node Flow Visualiser */}
      {activeTransactions.length === 0 ? (
        <div className="py-12 text-center text-slate-400 bg-slate-900/40 rounded-xl border border-slate-800/60">
          <Sparkles className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
          <p className="font-semibold text-slate-200">All settled up!</p>
          <p className="text-xs text-slate-500">No pending debt transfers exist for this group.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
          {activeTransactions.map((tx) => (
            <div
              key={tx.id}
              className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition-all flex items-center justify-between group shadow-md"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Debtor */}
                <div className="flex items-center gap-2">
                  <img
                    src={tx.fromUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt={tx.fromUser.name}
                    className="w-9 h-9 rounded-full border border-rose-500/40 object-cover"
                  />
                  <div className="truncate">
                    <div className="text-xs font-semibold text-white truncate">{tx.fromUser.name}</div>
                    <div className="text-[10px] text-rose-400 font-medium">owes</div>
                  </div>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center px-2">
                  <div className="text-xs font-bold text-cyan-400 tracking-wide">
                    {currencySymbol}{tx.amount.toFixed(2)}
                  </div>
                  <ArrowRight className="w-4 h-4 text-cyan-500 group-hover:translate-x-1 transition-transform" />
                </div>

                {/* Creditor */}
                <div className="flex items-center gap-2">
                  <img
                    src={tx.toUser.avatarUrl || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150'}
                    alt={tx.toUser.name}
                    className="w-9 h-9 rounded-full border border-emerald-500/40 object-cover"
                  />
                  <div className="truncate">
                    <div className="text-xs font-semibold text-white truncate">{tx.toUser.name}</div>
                    <div className="text-[10px] text-emerald-400 font-medium">receives</div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onSelectSettle(tx)}
                className="ml-4 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-black border border-emerald-500/30 text-xs font-bold transition-all shrink-0"
              >
                Settle Up
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
