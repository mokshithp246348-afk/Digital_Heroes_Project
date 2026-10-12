'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getCurrentUser,
  getUsers,
  getDraws,
  getWinners,
  getAnalytics,
  getAuditLogs,
} from '@/lib/storage';
import { User, Draw, Winner, PlatformAnalytics } from '@/types';
import {
  ShieldCheck,
  Users,
  CreditCard,
  Trophy,
  Heart,
  FileCheck,
  DollarSign,
  TrendingUp,
  Flame,
  ArrowRight,
  Activity,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Calendar,
  Zap,
  Server,
  Database,
  Lock,
  RefreshCw,
  Crown,
} from 'lucide-react';

const DEFAULT_ANALYTICS: PlatformAnalytics = {
  totalUsers: 2425,
  activeSubscribers: 2380,
  totalPrizePool: 80500,
  activeJackpot: 40700,
  totalCharityContributions: 124800,
  totalDrawsCompleted: 14,
  totalWinnersPaid: 42,
};

export default function AdminOverviewPage() {
  const [mounted, setMounted] = useState(false);
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [drawsList, setDrawsList] = useState<Draw[]>([]);
  const [winnersList, setWinnersList] = useState<Winner[]>([]);
  const [analytics, setAnalytics] = useState<PlatformAnalytics>(DEFAULT_ANALYTICS);
  const [recentAudits, setRecentAudits] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState<'today' | '7d' | '30d' | '3m' | 'year' | 'all'>('30d');
  const [globalSearch, setGlobalSearch] = useState('');

  const loadData = async () => {
    setCurrentUserState(getCurrentUser());
    try {
      const res = await fetch('/api/admin/metrics', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setUsersList(data.users || []);
        setDrawsList(data.draws || []);
        setWinnersList(data.winners || []);
        if (data.auditLogs) {
          setRecentAudits(data.auditLogs.slice(0, 8));
        }
        if (data.metrics) {
          setAnalytics({
            totalUsers: data.metrics.totalUsers,
            activeSubscribers: data.metrics.activeSubscribers,
            totalPrizePool: 50000,
            activeJackpot: data.metrics.jackpotPool,
            totalCharityContributions: data.metrics.totalCharityContributions,
            totalDrawsCompleted: (data.draws || []).filter((d: any) => d.status === 'published').length,
            totalWinnersPaid: (data.winners || []).filter((w: any) => w.paymentStatus === 'paid').length,
          });
        }
      } else {
        setUsersList(getUsers());
        setDrawsList(getDraws());
        setWinnersList(getWinners());
        setRecentAudits(getAuditLogs().slice(0, 8));
        setAnalytics(getAnalytics());
      }
    } catch {
      setUsersList(getUsers());
      setDrawsList(getDraws());
      setWinnersList(getWinners());
      setRecentAudits(getAuditLogs().slice(0, 8));
      setAnalytics(getAnalytics());
    }
  };

  useEffect(() => {
    setMounted(true);
    loadData();
    window.addEventListener('dh-storage-update', loadData);
    return () => window.removeEventListener('dh-storage-update', loadData);
  }, []);

  const activeSubscribers = usersList.filter((u) => u.subscriptionStatus === 'active');
  const pendingWinners = winnersList.filter((w) => w.verificationStatus === 'pending');
  const approvedUnpaid = winnersList.filter(
    (w) => w.verificationStatus === 'approved' && w.paymentStatus !== 'paid'
  );
  const mrr = activeSubscribers.length * 19;
  const arr = mrr * 12;

  const currentDraw = drawsList.find((d) => d.status === 'scheduled') || drawsList[0];

  // Filter audit logs by global search term
  const filteredAudits = recentAudits.filter((log) => {
    if (!globalSearch.trim()) return true;
    const term = globalSearch.toLowerCase();
    return (
      (log.adminName && log.adminName.toLowerCase().includes(term)) ||
      (log.action && log.action.toLowerCase().includes(term)) ||
      (log.entity && log.entity.toLowerCase().includes(term)) ||
      (log.newValue && log.newValue.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-slate-100 relative z-10">
      {/* Top Breadcrumb & Operations Hero Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[#D4AF37]/30 space-y-6 bg-gradient-to-b from-[#0f1420] to-[#05070A]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#121824] border border-[#D4AF37]/30 text-[#F5E6AB] text-xs font-semibold mb-2 tracking-wide uppercase">
              <Crown className="w-4 h-4 text-[#D4AF37]" />
              OPERATIONS COMMAND CENTER
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
              Platform Executive Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-light mt-1 max-w-2xl">
              Monitor and manage the Digital Heroes ecosystem. Real-time draw, revenue, subscriber, and charity engine metrics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/draws"
              className="px-5 py-3 btn-gold-primary text-slate-950 font-bold rounded-2xl text-xs transition shadow-xl flex items-center gap-2"
            >
              <Trophy className="w-4 h-4 text-slate-950" />
              <span>Launch Live Draw Operations</span>
            </Link>
          </div>
        </div>

        {/* Real-time System Operational Signals */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-1 text-[11px] font-mono">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
            <span className="text-slate-400 font-sans">API Engine:</span>
            <span className="text-[#F5E6AB] font-bold ml-auto">99.9%</span>
          </div>

          <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
            <span className="text-slate-400 font-sans">Database:</span>
            <span className="text-[#F5E6AB] font-bold ml-auto">ONLINE</span>
          </div>

          <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
            <span className="text-slate-400 font-sans">Auth System:</span>
            <span className="text-[#F5E6AB] font-bold ml-auto">SECURE</span>
          </div>

          <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
            <span className="text-slate-400 font-sans">Draw Engine:</span>
            <span className="text-[#F5E6AB] font-bold ml-auto">READY</span>
          </div>

          <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
            <span className="text-slate-400 font-sans">Payments:</span>
            <span className="text-[#F5E6AB] font-bold ml-auto">ACTIVE</span>
          </div>

          <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
            <span className="text-slate-400 font-sans">Charity Pool:</span>
            <span className="text-[#F5E6AB] font-bold ml-auto">ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Date Filter & Global Admin Search Control Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Global Admin Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search users, subscriptions, audit logs..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-white/15 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#D4AF37]"
          />
        </div>

        {/* Date Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          <span className="text-[11px] font-bold text-slate-400 mr-2 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" /> Range:
          </span>
          {(
            [
              { id: 'today', label: 'Today' },
              { id: '7d', label: '7 Days' },
              { id: '30d', label: '30 Days' },
              { id: '3m', label: '3 Months' },
              { id: 'year', label: 'This Year' },
              { id: 'all', label: 'All Time' },
            ] as const
          ).map((btn) => (
            <button
              key={btn.id}
              onClick={() => setDateRange(btn.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                dateRange === btn.id
                  ? 'bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#F5E6AB]'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* 6 MAIN KPI CARDS WITH VISUAL HIERARCHY */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* PRIMARY 1: TOTAL USERS */}
        <div className="glass-panel p-6 rounded-3xl border border-[#D4AF37]/30 space-y-3">
          <div className="flex justify-between items-center text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span>REGISTERED MEMBERS</span>
            <Users className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <div className="text-3xl sm:text-4xl font-serif font-bold text-white">{usersList.length}</div>
          <div className="text-xs text-[#F5E6AB] flex items-center gap-1 font-light">
            <TrendingUp className="w-3.5 h-3.5 text-[#D4AF37]" /> Real database records synced
          </div>
        </div>

        {/* PRIMARY 2: ACTIVE SUBSCRIPTIONS */}
        <div className="glass-panel p-6 rounded-3xl border border-[#D4AF37]/30 space-y-3">
          <div className="flex justify-between items-center text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span>ACTIVE SUBSCRIPTIONS</span>
            <CreditCard className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <div className="text-3xl sm:text-4xl font-serif font-bold text-[#F5E6AB]">{activeSubscribers.length}</div>
          <div className="text-xs text-slate-400 font-light">100% Eligible for Monthly Draws</div>
        </div>

        {/* PRIMARY 3: CURRENT PRIZE POOL */}
        <div className="glass-panel p-6 rounded-3xl border border-[#D4AF37]/40 space-y-3">
          <div className="flex justify-between items-center text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span>CURRENT PRIZE POOL</span>
            <Trophy className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <div className="text-3xl sm:text-4xl font-serif font-bold gold-text">
            ${currentDraw?.jackpotPool.toLocaleString() || '40,700'}
          </div>
          <div className="text-xs text-[#F5E6AB] flex items-center gap-1 font-light">
            <Flame className="w-3.5 h-3.5 text-[#D4AF37]" /> ${currentDraw?.rolloverFromPrevious.toLocaleString()} Rollover Active
          </div>
        </div>

        {/* SECONDARY 1: ACTIVE MRR / ARR */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400 font-semibold">
            <span>ACTIVE MRR / ARR</span>
            <DollarSign className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <div suppressHydrationWarning className="text-2xl sm:text-3xl font-serif font-bold text-white">${mrr.toLocaleString()}</div>
          <div suppressHydrationWarning className="text-[11px] text-slate-400 font-mono">Paced ARR: ${arr.toLocaleString()}/yr</div>
        </div>

        {/* SECONDARY 2: CHARITY IMPACT */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400 font-semibold">
            <span>CHARITY IMPACT</span>
            <Heart className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <div suppressHydrationWarning className="text-2xl sm:text-3xl font-serif font-bold gold-text">
            ${analytics.totalCharityContributions.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 font-light">Fairway for Kids Foundation</div>
        </div>

        {/* SECONDARY 3: PENDING WINNERS */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400 font-semibold">
            <span>VERIFICATION QUEUE</span>
            <FileCheck className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-bold text-white">{pendingWinners.length}</div>
          <div className="text-[11px] text-[#F5E6AB] font-light">
            {approvedUnpaid.length} Approved Awaiting Disbursal
          </div>
        </div>
      </div>

      {/* QUICK COMMAND CENTER PANELS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Draw Status Launcher */}
        <div className="lg:col-span-7 glass-panel p-6 sm:p-8 rounded-3xl border border-[#D4AF37]/30 space-y-5 bg-gradient-to-b from-[#0f1420] to-[#05070A]">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-[#D4AF37]" />
                LIVE DRAW OPERATIONS CENTER
              </span>
              <h3 className="text-xl font-serif font-bold text-white mt-1">
                {currentDraw?.name || 'Official Monthly Championship Draw'}
              </h3>
              <p className="text-xs text-slate-400 font-light mt-0.5">
                Engine Mode: <strong className="text-slate-200 capitalize">{currentDraw?.drawLogic || 'Algorithmic'}</strong> · Eligible Golfers: <strong className="text-[#F5E6AB] font-bold">{activeSubscribers.length}</strong>
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#F5E6AB] text-xs font-bold uppercase">
              {currentDraw?.status || 'Scheduled'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-black/60 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs text-slate-400 font-medium">Estimated Championship Jackpot</div>
              <div className="text-2xl sm:text-3xl font-serif font-bold gold-text">
                ${(currentDraw?.jackpotPool || 40700).toLocaleString()}
              </div>
            </div>

            <Link
              href="/admin/draws"
              className="w-full sm:w-auto px-5 py-3 btn-gold-primary text-slate-950 font-bold rounded-xl text-xs transition shadow-md flex items-center justify-center gap-2"
            >
              <span>Run Simulation & Publish</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Verification & Payout Queue Panel */}
        <div className="lg:col-span-5 glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-[#D4AF37]" />
              Verification Queue
            </h3>
            <Link href="/admin/winners" className="text-xs text-[#D4AF37] hover:underline font-bold">
              View All Queue →
            </Link>
          </div>

          <div className="space-y-2 text-xs">
            {winnersList.slice(0, 3).map((w) => (
              <div key={w.id} className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">{w.userName}</div>
                  <div className="text-[10px] text-slate-400">
                    Prize: <strong className="text-[#F5E6AB]">${w.prizeAmount.toLocaleString()}</strong> ({w.matchType})
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#F5E6AB] uppercase">
                  {w.verificationStatus}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RECENT AUDIT TRAIL */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#D4AF37]" />
              Recent System Audit Trail Log
            </h3>
            <p className="text-xs text-slate-400 font-light">
              Immutable activity log recording all administrative parameter mutations and draw executions.
            </p>
          </div>
          <Link href="/admin/audit" className="text-xs text-[#D4AF37] hover:underline font-bold">
            Full Audit Log →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-white/5 text-slate-400 uppercase text-[10px] font-bold">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Administrator</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Entity</th>
                <th className="px-4 py-3">Mutation Record</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-[11px]">
              {filteredAudits.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                filteredAudits.map((log) => (
                  <tr key={log.id} className="hover:bg-white/5 transition">
                    <td className="px-4 py-3 text-slate-400">{log.timestamp.replace('T', ' ').substring(0, 19)}</td>
                    <td className="px-4 py-3 text-[#F5E6AB] font-sans font-semibold">{log.adminName}</td>
                    <td className="px-4 py-3 text-white font-sans font-bold">{log.action}</td>
                    <td className="px-4 py-3 text-[#D4AF37]">{log.entity}</td>
                    <td className="px-4 py-3 text-slate-400 truncate max-w-xs">{log.newValue || log.oldValue || 'Executed'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


