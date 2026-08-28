import React from 'react';
import { NetBalance, Currency } from 'shared-types';
import { Users, TrendingUp, TrendingDown, CheckCircle2 } from 'lucide-react';

interface GroupSummaryCardProps {
  balances: NetBalance[];
  currency: Currency;
  totalGroupSpend: number;
}

export const GroupSummaryCard: React.FC<GroupSummaryCardProps> = ({
  balances,
  currency,
  totalGroupSpend,
}) => {
  const currencySymbol = currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-bold text-white">Member Balances</h3>
        </div>

        <div className="text-right">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Total Group Spend</div>
          <div className="text-sm font-extrabold text-white">{currencySymbol}{totalGroupSpend.toFixed(2)}</div>
        </div>
      </div>

      <div className="space-y-3">
        {balances.map((item) => {
          const isCreditor = item.netAmount > 0.01;
          const isDebtor = item.netAmount < -0.01;
          const isSettled = !isCreditor && !isDebtor;

          return (
            <div
              key={item.userId}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <img
                  src={item.user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={item.user.name}
                  className="w-9 h-9 rounded-full object-cover border border-slate-700"
                />
                <div>
                  <div className="text-xs font-semibold text-white">{item.user.name}</div>
                  <div className="text-[10px] text-slate-400">
                    Paid {currencySymbol}{item.totalPaid.toFixed(2)} • Share {currencySymbol}{item.totalOwed.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="text-right">
                {isCreditor && (
                  <div className="flex items-center justify-end gap-1 text-emerald-400 font-extrabold text-xs">
                    <TrendingUp className="w-3.5 h-3.5" />
                    +{currencySymbol}{item.netAmount.toFixed(2)}
                  </div>
                )}
                {isDebtor && (
                  <div className="flex items-center justify-end gap-1 text-rose-400 font-extrabold text-xs">
                    <TrendingDown className="w-3.5 h-3.5" />
                    -{currencySymbol}{Math.abs(item.netAmount).toFixed(2)}
                  </div>
                )}
                {isSettled && (
                  <div className="flex items-center justify-end gap-1 text-slate-400 font-bold text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
                    Settled
                  </div>
                )}
                <div className="text-[10px] text-slate-500">
                  {isCreditor ? 'gets back' : isDebtor ? 'owes group' : 'balanced'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
