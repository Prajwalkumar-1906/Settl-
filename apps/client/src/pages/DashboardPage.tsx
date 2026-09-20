import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Group } from 'shared-types';
import {
  Zap,
  Plus,
  Users,
  LogOut,
  User,
  Heart,
  ChevronRight,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  Copy,
  Check,
  Globe,
  Radio,
} from 'lucide-react';

export function DashboardPage() {
  const { user, logout, authFetch } = useAuth();
  const navigate = useNavigate();

  const [groups, setGroups] = useState<Group[]>([]);
  const [groupSummaries, setGroupSummaries] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);

  // New Group Form State
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newGroupType, setNewGroupType] = useState('trip');
  const [newGroupCurrency, setNewGroupCurrency] = useState('USD');

  // Join Group State
  const [inviteCode, setInviteCode] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const res = await authFetch('/api/groups');
      if (res.ok) {
        const data: Group[] = await res.json();
        setGroups(data);

        // Fetch summaries for each group to compute personal net balance
        const summaries: Record<string, any> = {};
        for (const grp of data) {
          try {
            const sumRes = await authFetch(`/api/groups/${grp.id}/summary`);
            if (sumRes.ok) {
              summaries[grp.id] = await sumRes.json();
            }
          } catch (e) {
            console.error(e);
          }
        }
        setGroupSummaries(summaries);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await authFetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newGroupName,
          description: newGroupDesc,
          type: newGroupType,
          currency: newGroupCurrency,
        }),
      });

      if (res.ok) {
        const createdGroup = await res.json();
        setIsCreateOpen(false);
        setNewGroupName('');
        setNewGroupDesc('');
        navigate(`/groups/${createdGroup.id}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      const res = await authFetch(`/api/groups/join/code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode }),
      });

      if (res.ok) {
        const joinedGroup = await res.json();
        setIsJoinOpen(false);
        setInviteCode('');
        navigate(`/groups/${joinedGroup.id}`);
      } else {
        const errData = await res.json();
        setErrorMsg(errData.error?.message || 'Invalid invite code');
      }
    } catch (err) {
      setErrorMsg('Failed to join group');
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-['Outfit',sans-serif] pb-16">
      {/* Navbar */}
      <header className="sticky top-0 z-40 glass-panel border-b border-slate-800 px-4 lg:px-8 py-3.5 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-glow">
            <Zap className="w-6 h-6 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-white tracking-wide">Settl</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                PRO ENGINE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Dashboard • Active Workspace</p>
          </div>
        </Link>

        {/* User profile & navigation */}
        <div className="flex items-center gap-3">
          <Link
            to="/impact"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold transition-all hidden sm:flex"
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Public Impact</span>
          </Link>

          <Link
            to="/profile"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all"
          >
            <img
              src={user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
              alt={user?.name}
              className="w-5 h-5 rounded-full object-cover"
            />
            <span className="hidden sm:inline">{user?.name}</span>
          </Link>

          <button
            onClick={logout}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 transition-all"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Welcome Banner & Actions */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-1 relative z-10">
            <h2 className="text-2xl sm:text-3xl font-black text-white">Welcome back, {user?.name}!</h2>
            <p className="text-slate-400 text-xs sm:text-sm">
              Manage your active group expense pools, track minimal debt transfers, and view balances.
            </p>
          </div>

          <div className="flex items-center gap-3 relative z-10 shrink-0">
            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-extrabold transition-all shadow-glow"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Create New Group</span>
            </button>

            <button
              onClick={() => setIsJoinOpen(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-extrabold transition-all"
            >
              <Users className="w-4 h-4" />
              <span>Join with Code</span>
            </button>
          </div>
        </div>

        {/* Groups Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" />
              <span>Your Active Groups</span>
            </h3>
            <span className="text-xs text-slate-400 font-semibold">{groups.length} Groups Joined</span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-panel p-6 rounded-3xl border border-slate-800/60 animate-pulse h-48" />
              ))}
            </div>
          ) : groups.length === 0 ? (
            <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-4 max-w-md mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <Users className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="text-base font-bold text-white">No Groups Yet</div>
                <p className="text-slate-400 text-xs">Create your first expense group or enter an invite code to get started.</p>
              </div>
              <button
                onClick={() => setIsCreateOpen(true)}
                className="px-6 py-2.5 rounded-xl bg-cyan-500 text-black text-xs font-extrabold shadow-glow inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Create Group</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map((group) => {
                const summary = groupSummaries[group.id];
                const userBalanceObj = summary?.balances?.find((b: any) => b.userId === user?.id);
                const netAmount = userBalanceObj ? userBalanceObj.netAmount : 0;
                const currencySymbol = group.currency === 'EUR' ? '€' : group.currency === 'GBP' ? '£' : '$';

                return (
                  <div
                    key={group.id}
                    onClick={() => navigate(`/groups/${group.id}`)}
                    className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer group flex flex-col justify-between space-y-6 hover:shadow-cyan-500/10 hover:shadow-xl"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-400 uppercase tracking-wider">
                            {group.type}
                          </span>
                          <h4 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors mt-1">
                            {group.name}
                          </h4>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                      </div>

                      <p className="text-slate-400 text-xs line-clamp-2">{group.description || 'Shared expense group'}</p>
                    </div>

                    <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Users className="w-3.5 h-3.5" />
                        <span>{group.members.length} Members</span>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] uppercase font-bold text-slate-500">Your Net Balance</div>
                        <div
                          className={`text-sm font-extrabold flex items-center justify-end gap-1 ${
                            netAmount > 0 ? 'text-emerald-400' : netAmount < 0 ? 'text-rose-400' : 'text-slate-300'
                          }`}
                        >
                          {netAmount > 0 ? (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          ) : netAmount < 0 ? (
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                          ) : null}
                          <span>
                            {netAmount > 0 ? '+' : ''}
                            {currencySymbol}
                            {Math.abs(netAmount).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Create Group Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white">Create New Expense Group</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-white text-xs">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Group Name</label>
                <input
                  type="text"
                  required
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g., Summer Trip 2026 🇫🇷"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description (Optional)</label>
                <input
                  type="text"
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  placeholder="e.g., Trip expenses across Paris & Interlaken"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Group Type</label>
                  <select
                    value={newGroupType}
                    onChange={(e) => setNewGroupType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                  >
                    <option value="trip">Trip</option>
                    <option value="flat">Flat / House</option>
                    <option value="event">Event</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Currency</label>
                  <select
                    value={newGroupCurrency}
                    onChange={(e) => setNewGroupCurrency(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 text-black text-xs font-extrabold shadow-glow"
                >
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Group Modal */}
      {isJoinOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white">Join Group via Invite Code</h3>
              <button onClick={() => setIsJoinOpen(false)} className="text-slate-400 hover:text-white text-xs">
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleJoinGroup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Invite Code</label>
                <input
                  type="text"
                  required
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="PARIS2026"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white uppercase tracking-wider"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsJoinOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 text-black text-xs font-extrabold shadow-glow"
                >
                  Join Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
