import React from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  ShieldCheck,
  TrendingUp,
  Heart,
  Leaf,
  ArrowRight,
  CheckCircle2,
  Users,
  Sparkles,
  Layers,
  Lock,
} from 'lucide-react';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-['Outfit',sans-serif] selection:bg-cyan-500 selection:text-black overflow-x-hidden">
      {/* Dynamic Background Ambient Lighting */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed top-1/3 right-10 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-10 left-1/3 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 px-6 lg:px-12 py-4 flex items-center justify-between backdrop-blur-xl">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-glow group-hover:scale-105 transition-transform">
            <Zap className="w-6 h-6 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-white tracking-wide">Settl</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 uppercase tracking-wider">
                Production Engine
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Split Fair, Settle Smart</p>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            to="/impact"
            className="text-xs font-semibold text-slate-300 hover:text-emerald-400 transition-colors flex items-center gap-1.5 hidden md:flex"
          >
            <Heart className="w-4 h-4 text-emerald-400" />
            Social Impact
          </Link>
          <Link
            to="/login"
            className="text-xs font-semibold text-slate-300 hover:text-white px-4 py-2.5 rounded-xl hover:bg-slate-800/60 transition-all"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="text-xs font-extrabold text-black bg-cyan-400 hover:bg-cyan-300 px-5 py-2.5 rounded-xl transition-all shadow-glow hover:shadow-cyan-500/50 flex items-center gap-1.5"
          >
            Get Started Free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-6 lg:px-12 max-w-7xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 border border-cyan-500/30 text-xs text-cyan-300 font-semibold shadow-inner">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Graph Debt Engine • Up to 70% fewer transfers</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1] max-w-4xl mx-auto">
          Split Fair. <br />
          <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-400 bg-clip-text text-transparent">
            Settle Smart.
          </span>
        </h1>

        <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
          The ultimate group expense calculator with algorithmic debt minimization, real-time sync, automated receipt OCR, and optional micro-charity round-ups.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            to="/register"
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-extrabold text-base shadow-glow hover:opacity-95 transition-all flex items-center gap-2 group"
          >
            <span>Start Splitting Expenses</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/login"
            className="px-8 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700 font-extrabold text-base transition-all flex items-center gap-2"
          >
            <span>Explore Demo Account</span>
          </Link>
        </div>

        {/* Feature Badges */}
        <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
          <div className="glass-panel p-4 rounded-2xl border border-slate-800/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Min Cash Flow</div>
              <div className="text-[11px] text-slate-400">Optimal N-way debts</div>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-slate-800/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Round-Up Charity</div>
              <div className="text-[11px] text-slate-400">Micro ocean donations</div>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-slate-800/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Eco Carbon Tracking</div>
              <div className="text-[11px] text-slate-400">Estimate CO₂ footprint</div>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-slate-800/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">JWT Protected</div>
              <div className="text-[11px] text-slate-400">Secure real persistence</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works (3 Steps) */}
      <section className="py-16 px-6 lg:px-12 max-w-7xl mx-auto w-full">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">How Settl Works</h2>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            Say goodbye to endless manual calculations and messy group chats.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 relative overflow-hidden group hover:border-cyan-500/40 transition-all">
            <div className="text-4xl font-black text-cyan-500/30 group-hover:text-cyan-400 transition-colors">01</div>
            <h3 className="text-xl font-bold text-white">Create or Join Group</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Start a trip, house flat, or event group in seconds. Share an instant 6-character invite code or QR link.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 relative overflow-hidden group hover:border-blue-500/40 transition-all">
            <div className="text-4xl font-black text-blue-500/30 group-hover:text-blue-400 transition-colors">02</div>
            <h3 className="text-xl font-bold text-white">Log Expenses & AI OCR</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Snap receipts to auto-extract items or add expenses manually with custom splits, categories, and eco carbon calculations.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 relative overflow-hidden group hover:border-purple-500/40 transition-all">
            <div className="text-4xl font-black text-purple-500/30 group-hover:text-purple-400 transition-colors">03</div>
            <h3 className="text-xl font-bold text-white">One-Click Smart Settlement</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Our graph algorithm simplifies complex multi-person debts into the absolute minimal number of direct transfers.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 px-6 lg:px-12 py-8 text-slate-500 text-xs text-center flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>© 2026 Settl Inc. All rights reserved. • Built with React, Vite & Prisma</div>
        <div className="flex items-center gap-6">
          <Link to="/impact" className="hover:text-emerald-400 transition-colors">
            Public Impact
          </Link>
          <Link to="/login" className="hover:text-white transition-colors">
            Sign In
          </Link>
          <Link to="/register" className="hover:text-cyan-400 transition-colors">
            Create Account
          </Link>
        </div>
      </footer>
    </div>
  );
}
