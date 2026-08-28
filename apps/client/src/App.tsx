import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { Group, GroupBalancesSummary, Expense, OptimizedTransaction, GroupMember } from 'shared-types';
import { DebtGraphVisualizer } from './components/DebtGraphVisualizer';
import { GroupSummaryCard } from './components/GroupSummaryCard';
import { ActivityFeed } from './components/ActivityFeed';
import { AddExpenseModal } from './components/AddExpenseModal';
import { ReceiptOcrModal } from './components/ReceiptOcrModal';
import { SettleModal } from './components/SettleModal';
import {
  Zap,
  Plus,
  Camera,
  Share2,
  Sparkles,
  PieChart,
  Shield,
  Layers,
  CheckCircle,
  Receipt,
  Leaf,
  Globe,
  Radio,
  Copy,
  Check,
} from 'lucide-react';

const socket = io('/', { autoConnect: true });

export default function App() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string>('grp_paris');
  const [summary, setSummary] = useState<GroupBalancesSummary | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [activities, setActivities] = useState<any[]>([]);

  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isOcrOpen, setIsOcrOpen] = useState(false);
  const [selectedSettleTx, setSelectedSettleTx] = useState<OptimizedTransaction | null>(null);
  const [ocrPresetData, setOcrPresetData] = useState<any>(null);

  const [copiedInvite, setCopiedInvite] = useState(false);

  // Fetch groups on mount
  useEffect(() => {
    fetch('/api/groups')
      .then((res) => res.json())
      .then((data) => {
        setGroups(data);
        if (data.length > 0 && !activeGroupId) {
          setActiveGroupId(data[0].id);
        }
      })
      .catch(console.error);
  }, []);

  // Fetch Group Details & Balances whenever activeGroupId changes
  const refreshGroupData = (groupId: string) => {
    if (!groupId) return;

    fetch(`/api/groups/${groupId}/summary`)
      .then((res) => res.json())
      .then((data) => setSummary(data))
      .catch(console.error);

    fetch(`/api/groups/${groupId}/expenses`)
      .then((res) => res.json())
      .then((data) => setExpenses(data))
      .catch(console.error);

    fetch(`/api/groups/${groupId}/activity`)
      .then((res) => res.json())
      .then((data) => setActivities(data))
      .catch(console.error);
  };

  useEffect(() => {
    refreshGroupData(activeGroupId);

    // Join Socket room
    socket.emit('join_group', activeGroupId);

    const handleExpenseAdded = () => refreshGroupData(activeGroupId);
    const handleSettlementCompleted = () => refreshGroupData(activeGroupId);

    socket.on('expense:added', handleExpenseAdded);
    socket.on('settlement:completed', handleSettlementCompleted);

    return () => {
      socket.emit('leave_group', activeGroupId);
      socket.off('expense:added', handleExpenseAdded);
      socket.off('settlement:completed', handleSettlementCompleted);
    };
  }, [activeGroupId]);

  const activeGroup = groups.find((g) => g.id === activeGroupId) || groups[0];

  const handleAddExpenseSubmit = async (expenseData: any) => {
    try {
      await fetch(`/api/groups/${activeGroupId}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseData),
      });
      refreshGroupData(activeGroupId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmSettlement = async (
    fromUserId: string,
    toUserId: string,
    amount: number,
    enableRoundUp: boolean
  ) => {
    try {
      await fetch(`/api/groups/${activeGroupId}/settlements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromUserId, toUserId, amount, enableRoundUp }),
      });
      refreshGroupData(activeGroupId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReceiptScanned = (parsedData: any) => {
    setOcrPresetData(parsedData);
    setIsAddExpenseOpen(true);
  };

  const handleCopyInvite = () => {
    if (activeGroup?.inviteCode) {
      navigator.clipboard.writeText(activeGroup.inviteCode);
      setCopiedInvite(true);
      setTimeout(() => setCopiedInvite(false), 2000);
    }
  };

  const currencySymbol = activeGroup?.currency === 'EUR' ? '€' : activeGroup?.currency === 'GBP' ? '£' : '$';

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-['Outfit',sans-serif] pb-16">
      {/* Top Ambient Glow Effects */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed top-1/3 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Navbar */}
      <header className="sticky top-0 z-40 glass-panel border-b border-slate-800 px-4 lg:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
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
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Split fair, settle smart. • Real-Time Graph Debt Engine
            </p>
          </div>
        </div>

        {/* Status Indicators & Invite */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-slate-300">Live WebSocket Sync</span>
          </div>

          <button
            onClick={handleCopyInvite}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all"
          >
            {copiedInvite ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
            {copiedInvite ? 'Copied Code!' : `Code: ${activeGroup?.inviteCode || 'PARIS2026'}`}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Group Tabs Selector */}
        <div className="flex items-center justify-between flex-wrap gap-4 bg-slate-900/60 p-2 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2 overflow-x-auto">
            {groups.map((grp) => (
              <button
                key={grp.id}
                onClick={() => setActiveGroupId(grp.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeGroupId === grp.id
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-glow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <span>{grp.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/30 border border-white/10">
                  {grp.currency}
                </span>
              </button>
            ))}
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setOcrPresetData(null);
                setIsAddExpenseOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-extrabold transition-all shadow-glow"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              Add Expense
            </button>

            <button
              onClick={() => setIsOcrOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/40 hover:bg-purple-600 hover:text-white text-xs font-extrabold transition-all shadow-glow-purple"
            >
              <Camera className="w-4 h-4" />
              Scan Receipt (OCR)
            </button>
          </div>
        </div>

        {/* Top Summary Metrics Cards */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-panel p-4 rounded-2xl border border-slate-800">
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Total Group Spend</div>
              <div className="text-2xl font-extrabold text-white mt-1">
                {currencySymbol}{summary.totalGroupSpend.toFixed(2)}
              </div>
              <div className="text-[10px] text-cyan-400 mt-1 font-medium">Shared across {activeGroup?.members.length || 0} members</div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-slate-800">
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Optimized Debt Transfers</div>
              <div className="text-2xl font-extrabold text-cyan-400 mt-1 flex items-baseline gap-2">
                <span>{summary.optimizedTransactions.length}</span>
                <span className="text-xs text-slate-500 font-normal line-through">{summary.naiveTransactions.length} raw</span>
              </div>
              <div className="text-[10px] text-emerald-400 mt-1 font-medium">-{summary.reductionPercentage}% fewer transactions</div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-slate-800">
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Round-Up Charity Fund</div>
              <div className="text-2xl font-extrabold text-emerald-400 mt-1">
                {currencySymbol}{summary.totalRoundUpDonations.toFixed(2)}
              </div>
              <div className="text-[10px] text-slate-400 mt-1 font-medium">Pledged to Ocean Reforestation</div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-slate-800">
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Est. Trip Carbon Footprint</div>
              <div className="text-2xl font-extrabold text-purple-400 mt-1">
                {summary.totalCarbonFootprintKg.toFixed(1)} <span className="text-xs text-slate-400 font-normal">kg CO₂e</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1 font-medium">Eco footprint offset calculator</div>
            </div>
          </div>
        )}

        {/* Core Layout Grid */}
        {summary && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Debt Visualizer Graph & Expenses History */}
            <div className="lg:col-span-2 space-y-6">
              <DebtGraphVisualizer
                balances={summary.balances}
                naiveTransactions={summary.naiveTransactions}
                optimizedTransactions={summary.optimizedTransactions}
                reductionPercentage={summary.reductionPercentage}
                currency={summary.currency}
                onSelectSettle={(tx) => setSelectedSettleTx(tx)}
              />

              {/* Group Expense History Table */}
              <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-xl">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-base font-bold text-white">Expense Activity History</h3>
                  </div>
                  <span className="text-xs text-slate-400">{expenses.length} Expenses Recorded</span>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {expenses.map((exp) => {
                    const payer = activeGroup?.members.find((m: GroupMember) => m.userId === (exp.paidById || (exp as any).paidBy))?.user;
                    return (
                      <div
                        key={exp.id}
                        className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-lg border border-slate-700">
                            {exp.category === 'Food'
                              ? '🍔'
                              : exp.category === 'Travel'
                              ? '✈️'
                              : exp.category === 'Housing'
                              ? '🏠'
                              : exp.category === 'Entertainment'
                              ? '🎟️'
                              : '📦'}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white">{exp.description}</div>
                            <div className="text-[10px] text-slate-400">
                              Paid by <span className="text-slate-200 font-semibold">{payer?.name || 'Member'}</span> •{' '}
                              {exp.splits.length} people split
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-extrabold text-white">
                            {currencySymbol}{exp.amount.toFixed(2)}
                          </div>
                          <div className="text-[10px] text-purple-400 font-semibold flex items-center justify-end gap-1">
                            <Leaf className="w-3 h-3" />
                            {exp.carbonEstimateKg || 0} kg CO₂
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column: Member Balances & Live Activity */}
            <div className="space-y-6">
              <GroupSummaryCard
                balances={summary.balances}
                currency={summary.currency}
                totalGroupSpend={summary.totalGroupSpend}
              />

              <ActivityFeed
                activities={activities}
                totalDonations={summary.totalRoundUpDonations}
                totalCarbonKg={summary.totalCarbonFootprintKg}
                currency={summary.currency}
              />
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        members={activeGroup?.members || []}
        currency={activeGroup?.currency || 'USD'}
        onAddExpense={handleAddExpenseSubmit}
        onOpenOcr={() => {
          setIsAddExpenseOpen(false);
          setIsOcrOpen(true);
        }}
        ocrPresetData={ocrPresetData}
      />

      <ReceiptOcrModal
        isOpen={isOcrOpen}
        onClose={() => setIsOcrOpen(false)}
        onReceiptScanned={handleReceiptScanned}
      />

      <SettleModal
        isOpen={!!selectedSettleTx}
        transaction={selectedSettleTx}
        onClose={() => setSelectedSettleTx(null)}
        onConfirmSettlement={handleConfirmSettlement}
      />
    </div>
  );
}
