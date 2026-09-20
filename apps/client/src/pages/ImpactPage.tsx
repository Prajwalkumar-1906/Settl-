import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Heart, Leaf, Globe, ShieldCheck, ArrowRight, Sparkles, Award } from 'lucide-react';

export function ImpactPage() {
  const [impactData, setImpactData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/impact/summary')
      .then((res) => res.json())
      .then((data) => {
        setImpactData(data);
        setIsLoading(false);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-['Outfit',sans-serif] pb-16">
      {/* Glow Effects */}
      <div className="fixed top-0 left-1/3 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed top-1/3 right-10 w-[450px] h-[450px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Navbar */}
      <header className="sticky top-0 z-40 glass-panel border-b border-slate-800 px-6 lg:px-12 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-glow">
            <Zap className="w-6 h-6 fill-white" />
          </div>
          <span className="text-2xl font-black text-white tracking-wide">Settl</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link to="/login" className="text-xs font-semibold text-slate-300 hover:text-white px-4 py-2">
            Sign In
          </Link>
          <Link
            to="/register"
            className="text-xs font-extrabold text-black bg-emerald-400 hover:bg-emerald-300 px-5 py-2.5 rounded-xl transition-all shadow-glow flex items-center gap-1.5"
          >
            Get Started
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Hero Header */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 lg:px-12 pt-12 space-y-12">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 font-semibold">
            <Heart className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
            <span>Settl Social Good Initiative</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
            Splitting Expenses. <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Healing the Planet.
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Every time members settle group balances on Settl, optional round-up micro-donations fund marine ocean cleanups, reforestation, and eco-carbon offsets.
          </p>
        </div>

        {/* Global Impact Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-2 relative overflow-hidden group hover:border-emerald-500/50 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Heart className="w-6 h-6 fill-emerald-400/20" />
            </div>
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Micro-Donations Pledged</div>
            <div className="text-4xl font-black text-emerald-400">
              ${isLoading ? '0.00' : (impactData?.totalDonationsAmount || 0).toFixed(2)}
            </div>
            <div className="text-xs text-slate-400 font-medium">
              From {impactData?.totalDonationsCount || 0} group settlement round-ups
            </div>
          </div>

          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-2 relative overflow-hidden group hover:border-cyan-500/50 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Leaf className="w-6 h-6" />
            </div>
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Group Carbon Offset Tracked</div>
            <div className="text-4xl font-black text-cyan-400">
              {isLoading ? '0.0' : (impactData?.totalCarbonKg || 0).toFixed(1)} <span className="text-sm font-normal text-slate-400">kg CO₂</span>
            </div>
            <div className="text-xs text-slate-400 font-medium">Across travel, lodging & dining expenses</div>
          </div>

          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-2 relative overflow-hidden group hover:border-purple-500/50 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Globe className="w-6 h-6" />
            </div>
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Verified Charity Partner</div>
            <div className="text-xl font-extrabold text-white mt-1">Clean Oceans & Reforestation Fund</div>
            <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1 mt-1">
              <ShieldCheck className="w-4 h-4" /> 100% Direct Impact Allocation
            </div>
          </div>
        </div>

        {/* Live Impact Activity Stream */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-bold text-white">Recent Community Micro-Donations</h3>
            </div>
            <span className="text-xs text-slate-400">Live Impact Stream</span>
          </div>

          {isLoading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-slate-900 rounded-xl" />
              ))}
            </div>
          ) : impactData?.recentDonations?.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">No micro-donations recorded yet.</div>
          ) : (
            <div className="space-y-3">
              {impactData?.recentDonations?.map((don: any) => (
                <div
                  key={don.id}
                  className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={don.user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${don.user?.name}`}
                      alt={don.user?.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <div className="text-xs font-bold text-white">{don.user?.name || 'Group Member'}</div>
                      <div className="text-[10px] text-slate-400">
                        Pledged from group <span className="text-slate-300 font-semibold">{don.group?.name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-extrabold text-emerald-400">+${don.amount.toFixed(2)}</div>
                    <div className="text-[9px] text-slate-500 uppercase font-semibold">{don.status}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
