import React from 'react';
import { ActivityLog, Currency } from 'shared-types';
import { Activity, Heart, Leaf, ShieldAlert, Clock, PlusCircle } from 'lucide-react';

interface ActivityFeedProps {
  activities: ActivityLog[];
  totalDonations: number;
  totalCarbonKg: number;
  currency: Currency;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  totalDonations,
  totalCarbonKg,
  currency,
}) => {
  const currencySymbol = currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';

  return (
    <div className="space-y-6">
      {/* Social Impact & Eco Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Round-up donation social impact */}
        <div className="glass-panel rounded-2xl p-4 border border-emerald-500/30 bg-gradient-to-br from-emerald-950/30 to-slate-900 shadow-glow-emerald">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-4 h-4 text-emerald-400 fill-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Social Impact Fund</span>
          </div>
          <div className="text-xl font-extrabold text-white">
            {currencySymbol}{totalDonations.toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-300 mt-1">
            Rounded up from debt settlements & pledged to Clean Ocean Reforestation.
          </p>
        </div>

        {/* Carbon Footprint Estimator */}
        <div className="glass-panel rounded-2xl p-4 border border-cyan-500/30 bg-gradient-to-br from-cyan-950/30 to-slate-900 shadow-glow">
          <div className="flex items-center gap-2 mb-2">
            <Leaf className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">Trip Carbon Footprint</span>
          </div>
          <div className="text-xl font-extrabold text-white">
            {totalCarbonKg.toFixed(1)} <span className="text-xs font-normal text-slate-400">kg CO₂e</span>
          </div>
          <p className="text-[11px] text-slate-300 mt-1">
            Estimated travel & food carbon footprint tracked for eco-offset awareness.
          </p>
        </div>
      </div>

      {/* Activity Ticker Feed */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
          <Activity className="w-5 h-5 text-purple-400 animate-pulse" />
          <h3 className="text-base font-bold text-white">Live Activity Feed</h3>
        </div>

        {activities.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">No activity logged yet</div>
        ) : (
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {activities.map((act) => (
              <div
                key={act.id}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3 text-xs"
              >
                <div className="p-1.5 rounded-lg bg-slate-800 text-cyan-400 mt-0.5 shrink-0">
                  {act.actionType === 'EXPENSE_ADDED' ? (
                    <PlusCircle className="w-3.5 h-3.5 text-cyan-400" />
                  ) : act.actionType === 'DONATION_MADE' ? (
                    <Heart className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-purple-400" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="text-slate-200">
                    <span className="font-bold text-white">{act.actorName}</span> {act.details}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
