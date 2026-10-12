'use client';

import { useState, useEffect } from 'react';
import { getAnalytics, getUsers, getDraws, getWinners, getCharities } from '@/lib/storage';
import { PlatformAnalytics, User, Draw, Winner, Charity } from '@/types';
import {
  BarChart3,
  Download,
  DollarSign,
  Users,
  TrendingUp,
  Heart,
  Trophy,
  FileSpreadsheet,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

export default function AdminReportsPage() {
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [draws, setDraws] = useState<Draw[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [charities, setCharities] = useState<Charity[]>([]);

  const loadData = () => {
    setAnalytics(getAnalytics());
    setUsers(getUsers());
    setDraws(getDraws());
    setWinners(getWinners());
    setCharities(getCharities());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('dh-storage-update', loadData);
    return () => window.removeEventListener('dh-storage-update', loadData);
  }, []);

  const exportFinancialsCSV = () => {
    const headers = ['Draw ID', 'Month/Year', 'Draw Date', 'Status', 'Total Prize Pool ($)', '5-Match Pool ($)', '4-Match Pool ($)', '3-Match Pool ($)', 'Subscribers Entered'];
    const rows = draws.map((d) => [
      d.id,
      d.monthYear,
      d.drawDate,
      d.status,
      d.totalPrizePool,
      d.jackpotPool,
      d.tier4Pool,
      d.tier3Pool,
      d.totalSubscribersEntered,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `digital_heroes_draw_financials_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportSubscribersCSV = () => {
    const headers = ['User ID', 'Name', 'Email', 'Role', 'Status', 'Billing Cycle', 'Handicap', 'Charity ID', 'Registration Date'];
    const rows = users.map((u) => [
      u.id,
      `"${u.name}"`,
      u.email,
      u.role,
      u.subscriptionStatus,
      u.billingCycle,
      u.handicap ?? 15,
      u.charityId || 'charity-1',
      u.createdAt || '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `digital_heroes_subscriber_roster_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const activeSubscribersCount = users.filter((u) => u.subscriptionStatus === 'active').length;
  const estimatedMonthlyARR = activeSubscribersCount * 29;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-900/30 pb-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-emerald-400 font-mono tracking-widest uppercase mb-1">
            <span>Admin Control Center</span>
            <span>/</span>
            <span>Reports & Analytics</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-400" /> Platform Financials & Reports
          </h1>
          <p className="text-xs text-slate-400">
            Real-time subscriber metrics, prize pool disbursements, charity impact telemetry, and downloadable CSV audit data.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={exportFinancialsCSV}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-400 font-bold rounded-lg text-xs flex items-center space-x-2 transition-all shadow-md"
          >
            <Download className="w-4 h-4" />
            <span>Export Draw Financials CSV</span>
          </button>

          <button
            onClick={exportSubscribersCSV}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold rounded-lg text-xs flex items-center space-x-2 transition-all shadow-md shadow-emerald-500/20"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export User Roster CSV</span>
          </button>
        </div>
      </div>

      {/* Primary Telemetry Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-emerald-500/30 rounded-xl p-4 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>ESTIMATED MRR</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-2">${estimatedMonthlyARR.toLocaleString()}</div>
          <div className="text-[11px] text-slate-500 mt-1">Based on active $29/mo billing</div>
        </div>

        <div className="bg-slate-900/80 border border-amber-500/30 rounded-xl p-4 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>CUMULATIVE PRIZES ALLOCATED</span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 mt-2">
            ${(analytics?.totalPrizePool || 120000).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Total jackpot pool allocations</div>
        </div>

        <div className="bg-slate-900/80 border border-rose-500/30 rounded-xl p-4 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>CHARITY GRANTS GENERATED</span>
            <Heart className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400 mt-2">
            ${(analytics?.totalCharityContributions || 12450).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Raised for non-profit beneficiaries</div>
        </div>

        <div className="bg-slate-900/80 border border-blue-500/30 rounded-xl p-4 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>ACTIVE SUBSCRIBER BASE</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-blue-400 mt-2">{activeSubscribersCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Total active golfers enrolled</div>
        </div>
      </div>

      {/* Draw Performance Breakdown */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 backdrop-blur-md space-y-4">
        <h3 className="text-base font-black text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-amber-400" /> Monthly Draw Performance Breakdown
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Draw Cycle</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Total Pool</th>
                <th className="px-4 py-3">5-Match Pool</th>
                <th className="px-4 py-3">4-Match Pool</th>
                <th className="px-4 py-3">3-Match Pool</th>
                <th className="px-4 py-3">Subscribers Entered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {draws.map((d) => (
                <tr key={d.id} className="hover:bg-slate-800/40">
                  <td className="px-4 py-3.5 font-bold text-white">{d.name} ({d.id})</td>
                  <td className="px-4 py-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-950 border border-slate-700 text-amber-400">
                      {d.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-black text-amber-400">${d.totalPrizePool.toLocaleString()}</td>
                  <td className="px-4 py-3.5 font-semibold text-emerald-400">${d.jackpotPool.toLocaleString()}</td>
                  <td className="px-4 py-3.5 font-semibold text-slate-300">${d.tier4Pool.toLocaleString()}</td>
                  <td className="px-4 py-3.5 font-semibold text-slate-400">${d.tier3Pool.toLocaleString()}</td>
                  <td className="px-4 py-3.5 font-mono text-slate-400">{d.totalSubscribersEntered} golfers</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
