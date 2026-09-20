import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, ArrowLeft, ShieldCheck, Heart, Leaf, Award, User, CheckCircle2 } from 'lucide-react';

export function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-['Outfit',sans-serif] pb-16">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-panel border-b border-slate-800 px-4 lg:px-8 py-3.5 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-cyan-400" />
          <span className="text-sm font-bold text-white">Member Profile</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* User Badge Card */}
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden">
          <img
            src={user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
            alt={user?.name}
            className="w-24 h-24 rounded-3xl object-cover border-2 border-cyan-500/40 shadow-glow"
          />

          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h2 className="text-2xl font-black text-white">{user?.name}</h2>
              {user?.isEmailVerified && (
                <span className="p-1 rounded-full bg-cyan-500/20 text-cyan-400" title="Verified Account">
                  <ShieldCheck className="w-4 h-4" />
                </span>
              )}
            </div>
            <p className="text-slate-400 text-xs font-medium">{user?.email}</p>
            <div className="pt-2 flex items-center justify-center sm:justify-start gap-2">
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 uppercase tracking-wider">
                Pro Settl Member
              </span>
            </div>
          </div>
        </div>

        {/* Impact & Activity Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Lifetime Settled</div>
            <div className="text-2xl font-black text-white">$1,450.00</div>
            <div className="text-[10px] text-cyan-400">Optimal cash flow transactions</div>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Heart className="w-5 h-5" />
            </div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Charity Pledged</div>
            <div className="text-2xl font-black text-emerald-400">$24.50</div>
            <div className="text-[10px] text-slate-400">Micro round-up ocean fund</div>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Leaf className="w-5 h-5" />
            </div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Eco CO₂ Tracked</div>
            <div className="text-2xl font-black text-purple-400">142.8 kg</div>
            <div className="text-[10px] text-slate-400">Travel & expense carbon estimate</div>
          </div>
        </div>
      </main>
    </div>
  );
}
