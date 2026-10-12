'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getDraws, getWinners } from '@/lib/storage';
import { Draw, Winner } from '@/types';
import {
  History,
  Trophy,
  Calendar,
  CheckCircle2,
  ArrowLeft,
  Search,
  Eye,
  X,
  ShieldCheck,
  Award,
} from 'lucide-react';

export default function HistoricalDrawVaultPage() {
  const [draws, setDraws] = useState<Draw[]>([]);
  const [allWinners, setAllWinners] = useState<Winner[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'published' | 'simulated' | 'scheduled'>('all');
  const [activeModalDraw, setActiveModalDraw] = useState<Draw | null>(null);

  const loadData = () => {
    setDraws(getDraws());
    setAllWinners(getWinners());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('dh-storage-update', loadData);
    return () => window.removeEventListener('dh-storage-update', loadData);
  }, []);

  const filteredDraws = draws.filter((d) => {
    const matchesSearch =
      d.monthYear.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.name.toLowerCase().includes(searchTerm.toLowerCase());

    if (selectedStatus === 'all') return matchesSearch;
    return matchesSearch && d.status === selectedStatus;
  });

  const getDrawWinners = (drawId: string): Winner[] => {
    return allWinners.filter((w) => w.drawId === drawId);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-900/30 pb-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-emerald-400 font-mono tracking-widest uppercase mb-1">
            <Link href="/admin/draws" className="hover:underline flex items-center gap-1 text-slate-400 hover:text-emerald-400">
              <ArrowLeft className="w-3 h-3" /> Draw Engine
            </Link>
            <span>/</span>
            <span>Historical Vault</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-amber-400" /> Immutable Draw Archive
          </h1>
          <p className="text-xs text-slate-400">
            Read-only cryptographic audit record of past lucky-draws, winner distributions, and prize pool allocations.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/admin/draws"
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-bold rounded-lg text-xs shadow-lg shadow-amber-500/20 flex items-center space-x-2 transition-all"
          >
            <Trophy className="w-4 h-4" />
            <span>Launch Live Draw</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by Month/Year or Draw ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          {(['all', 'published', 'simulated', 'scheduled'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                selectedStatus === status
                  ? 'bg-amber-500/20 border border-amber-500/50 text-amber-400'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Vault Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Draw Event</th>
                <th className="px-5 py-3.5">Draw Date</th>
                <th className="px-5 py-3.5">Total Pool</th>
                <th className="px-5 py-3.5">5-Match Pool</th>
                <th className="px-5 py-3.5">4-Match Pool</th>
                <th className="px-5 py-3.5">Eligible Pool</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredDraws.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-slate-500">
                    No historical draw records matching search filters.
                  </td>
                </tr>
              ) : (
                filteredDraws.map((draw) => (
                  <tr key={draw.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4 font-bold text-white flex items-center space-x-2">
                      <div className="p-1.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400">
                        <Trophy className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div>{draw.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono font-normal">{draw.id}</div>
                      </div>
                    </td>

                    <td className="px-5 py-4 font-mono text-slate-400">
                      {new Date(draw.drawDate).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>

                    <td className="px-5 py-4 font-black text-amber-400 text-sm">
                      ${draw.totalPrizePool.toLocaleString()}
                    </td>

                    <td className="px-5 py-4 font-semibold text-emerald-400">
                      ${draw.jackpotPool.toLocaleString()}
                    </td>

                    <td className="px-5 py-4 font-semibold text-blue-400">
                      ${draw.tier4Pool.toLocaleString()}
                    </td>

                    <td className="px-5 py-4 font-mono text-slate-400">{draw.totalSubscribersEntered} golfers</td>

                    <td className="px-5 py-4">
                      {draw.status === 'published' ? (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>PUBLISHED</span>
                        </span>
                      ) : draw.status === 'simulated' ? (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/40">
                          <ShieldCheck className="w-3 h-3" />
                          <span>SIMULATED</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                          <Calendar className="w-3 h-3" />
                          <span>SCHEDULED</span>
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setActiveModalDraw(draw)}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold rounded text-[11px] border border-slate-700 flex items-center space-x-1 ml-auto transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Archive</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Draw Details Modal */}
      {activeModalDraw && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/30 w-full max-w-2xl rounded-2xl p-6 shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <button
                onClick={() => setActiveModalDraw(null)}
                className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-3 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-400">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">{activeModalDraw.name} Certificate</h3>
                <p className="text-xs text-slate-400 font-mono">ID: {activeModalDraw.id}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
              <div>
                <div className="text-[10px] text-slate-500 font-mono uppercase">Total Prize Pool</div>
                <div className="text-lg font-black text-amber-400">${activeModalDraw.totalPrizePool.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 font-mono uppercase">5-Match Pool</div>
                <div className="text-lg font-black text-emerald-400">${activeModalDraw.jackpotPool.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 font-mono uppercase">4-Match Pool</div>
                <div className="text-lg font-black text-slate-300">${activeModalDraw.tier4Pool.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 font-mono uppercase">3-Match Pool</div>
                <div className="text-lg font-black text-slate-400">${activeModalDraw.tier3Pool.toLocaleString()}</div>
              </div>
            </div>

            {/* Winner Roster Section */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" /> Recorded Winners Roster
              </h4>
              {getDrawWinners(activeModalDraw.id).length > 0 ? (
                <div className="space-y-2">
                  {getDrawWinners(activeModalDraw.id).map((w, idx) => (
                    <div
                      key={w.id}
                      className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 font-black text-xs flex items-center justify-center border border-amber-500/40">
                          #{idx + 1}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">{w.userName}</div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            Match Type: <span className="text-amber-400 font-bold uppercase">{w.matchType}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-black text-emerald-400">${w.prizeAmount.toLocaleString()}</div>
                        <div className="text-[10px] text-slate-400 capitalize">{w.verificationStatus}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-center text-xs text-slate-500">
                  No verified winners published for this cycle yet.
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1 text-[11px] font-mono text-slate-400">
              <div className="flex justify-between">
                <span>Draw Engine Logic:</span>
                <span className="text-amber-400 font-bold capitalize">{activeModalDraw.drawLogic || 'Algorithmic'}</span>
              </div>
              <div className="flex justify-between">
                <span>Winning Numbers:</span>
                <span className="text-emerald-400 font-bold">
                  {activeModalDraw.winningNumbers && activeModalDraw.winningNumbers.length > 0
                    ? activeModalDraw.winningNumbers.join(' - ')
                    : 'Pending Draw Execution'}
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveModalDraw(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg border border-slate-700"
              >
                Close Archive View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
