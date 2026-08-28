import React, { useState } from 'react';
import { Shield, Users, Layers, AlertCircle, HeartHandshake, TrendingUp } from 'lucide-react';

export default function App() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [email, setEmail] = useState('admin@settl.app');
  const [password, setPassword] = useState('admin123');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      setIsAdminLoggedIn(true);
    }
  };

  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0f19] p-4">
        <div className="max-w-md w-full bg-slate-900/80 border border-slate-800 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white">Settl Admin</h1>
              <p className="text-xs text-slate-400">Internal Management Console</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Admin Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                placeholder="admin@settl.app"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition-all shadow-lg shadow-purple-600/30 mt-2"
            >
              Sign In to Console
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col">
      <header className="border-b border-slate-800 px-8 py-4 flex items-center justify-between bg-slate-900/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Settl Admin Console</h1>
            <span className="text-[10px] text-purple-400 font-semibold uppercase tracking-wider">SuperAdmin Scope</span>
          </div>
        </div>
        <button
          onClick={() => setIsAdminLoggedIn(false)}
          className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl transition-all"
        >
          Logout
        </button>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Total Active Users</span>
              <Users className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-extrabold text-white mt-2">1,482</div>
            <div className="text-[10px] text-emerald-400 mt-1">+12% this week</div>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Active Trip Groups</span>
              <Layers className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-3xl font-extrabold text-white mt-2">324</div>
            <div className="text-[10px] text-slate-400 mt-1">Across 18 countries</div>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Open Disputes</span>
              <AlertCircle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-extrabold text-amber-400 mt-2">2</div>
            <div className="text-[10px] text-slate-400 mt-1">Requires support review</div>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Donations Pool</span>
              <HeartHandshake className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold text-emerald-400 mt-2">₹42,850</div>
            <div className="text-[10px] text-slate-400 mt-1">Ready for transfer</div>
          </div>
        </div>
      </main>
    </div>
  );
}
