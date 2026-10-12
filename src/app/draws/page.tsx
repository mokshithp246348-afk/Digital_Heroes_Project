'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Draw, Winner } from '@/types';
import {
  Trophy,
  Flame,
  Calendar,
  Sparkles,
  CheckCircle2,
  Clock,
  Award,
  AlertTriangle,
  History,
  ShieldCheck,
  ChevronRight,
  Eye,
  RefreshCw,
  X,
} from 'lucide-react';

import { getDraws, getWinners } from '@/lib/storage';

export default function DrawsPage() {
  const { user } = useAuth();
  const [draws, setDraws] = useState<Draw[]>(() => (typeof window !== 'undefined' ? getDraws() : []));
  const [allWinners, setAllWinners] = useState<Winner[]>(() => (typeof window !== 'undefined' ? getWinners() : []));
  const [isLoading, setIsLoading] = useState(false);

  // Selected draw detail modal
  const [selectedDrawModal, setSelectedDrawModal] = useState<Draw | null>(null);

  const fetchDrawsData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/draws', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setDraws(data.draws || []);
        setAllWinners(data.allWinners || []);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDrawsData();
  }, []);

  const activeDraw = draws.find((d) => d.status === 'scheduled') || draws[0];
  const completedDraws = draws.filter((d) => d.status === 'published');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/25 text-amber-300 text-xs font-semibold mb-2">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            MONTHLY CHAMPIONSHIP DRAW SYSTEM
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Draw Engine & History</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time monthly jackpot draws, active tickets, and historical verified winner records.
          </p>
        </div>

        <button onClick={fetchDrawsData} className="p-2.5 text-slate-400 hover:text-white bg-white/5 rounded-xl border border-white/10 transition flex items-center gap-2 self-start md:self-auto text-xs font-semibold">
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Draws</span>
        </button>
      </div>

      {/* ACTIVE CURRENT DRAW BANNER */}
      {activeDraw && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-amber-500/30 space-y-6 bg-gradient-to-b from-[#141c2c] to-[#0a0e17]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-4">
            <div>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-400 animate-pulse" /> UPCOMING ACTIVE MONTHLY DRAW
              </span>
              <h2 className="text-2xl font-extrabold text-white mt-1">{activeDraw.name}</h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase">
                {activeDraw.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-1">
              <span className="text-slate-400 font-semibold">ESTIMATED GRAND JACKPOT</span>
              <div className="text-3xl font-black text-gradient-gold">${activeDraw.jackpotPool.toLocaleString()}</div>
              <div className="text-[11px] text-amber-400 flex items-center gap-1">
                <Flame className="w-3 h-3" /> Includes ${activeDraw.rolloverFromPrevious.toLocaleString()} Rollover
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-1">
              <span className="text-slate-400 font-semibold">DRAW DATE & TIME</span>
              <div className="text-xl font-extrabold text-white">{activeDraw.drawDate.replace('T', ' ').substring(0, 16)}</div>
              <div className="text-[11px] text-slate-400">Algorithmic score-frequency weighted</div>
            </div>

            <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-1">
              <span className="text-slate-400 font-semibold">YOUR ENTRY STATUS</span>
              <div className="text-xl font-extrabold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>{user?.subscriptionStatus === 'active' ? 'Eligible Subscriber' : 'Subscription Required'}</span>
              </div>
              <div className="text-[11px] text-slate-400">Log 5 rolling scores before draw date.</div>
            </div>
          </div>

          {/* Winning numbers preview */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-amber-500/20 text-center space-y-3">
            <div className="text-xs font-semibold text-slate-300">
              Target Winning Numbers (Drawn at conclusion):
            </div>
            <div className="flex justify-center items-center gap-3 sm:gap-4 flex-wrap">
              {(activeDraw.winningNumbers.length > 0 ? activeDraw.winningNumbers : [9, 17, 28, 36, 42]).map((n, i) => (
                <div
                  key={i}
                  className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 border border-amber-300 text-slate-950 font-black text-lg flex items-center justify-center shadow-lg"
                >
                  {n}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* COMPLETED DRAWS HISTORY */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" />
            Completed Draw Vault & History
          </h3>
          <span className="text-xs text-slate-400 font-semibold">{completedDraws.length} Draws Published</span>
        </div>

        {completedDraws.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <div className="text-2xl text-slate-500">🏆</div>
            <h4 className="text-sm font-bold text-white">No Completed Draws Yet</h4>
            <p className="text-xs text-slate-400">The upcoming monthly draw will appear here once officially published.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedDraws.map((d) => {
              const drawWinners = allWinners.filter((w) => w.drawId === d.id);
              return (
                <div key={d.id} className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4 hover:border-amber-500/30 transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400">ID: {d.id}</span>
                      <h4 className="font-extrabold text-white text-base">{d.name}</h4>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                      PUBLISHED
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-3 rounded-xl bg-slate-900 border border-white/5 space-y-0.5">
                      <span className="text-slate-400 text-[10px]">TOTAL PRIZE POOL</span>
                      <div className="font-extrabold text-amber-400">${d.totalPrizePool.toLocaleString()}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-white/5 space-y-0.5">
                      <span className="text-slate-400 text-[10px]">VERIFIED WINNERS</span>
                      <div className="font-extrabold text-emerald-400">{drawWinners.length} Winners</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{d.drawDate.split('T')[0]}</span>
                    </div>

                    <button
                      onClick={() => setSelectedDrawModal(d)}
                      className="px-3.5 py-1.5 bg-white/10 hover:bg-white/15 text-white font-bold rounded-xl text-xs transition flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Draw Details</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* DRAW DETAIL MODAL */}
      {selectedDrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[#121724] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-xs text-slate-200">
            <div className="flex justify-between items-start border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-mono text-amber-400">ID: {selectedDrawModal.id}</span>
                <h3 className="text-lg font-black text-white">{selectedDrawModal.name}</h3>
              </div>
              <button onClick={() => setSelectedDrawModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-center space-y-2">
                <span className="text-slate-400 font-semibold">Official Winning Numbers Drawn</span>
                <div className="flex justify-center items-center gap-3">
                  {(selectedDrawModal.winningNumbers || [9, 17, 28, 36, 42]).map((num, i) => (
                    <div key={i} className="w-10 h-10 rounded-xl bg-orange-500 text-white font-black text-base flex items-center justify-center">
                      {num}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white/5 space-y-1">
                  <span className="text-slate-400">Total Prize Pool</span>
                  <div className="text-lg font-bold text-amber-400">${selectedDrawModal.totalPrizePool.toLocaleString()}</div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 space-y-1">
                  <span className="text-slate-400">Jackpot Split</span>
                  <div className="text-lg font-bold text-emerald-400">${selectedDrawModal.jackpotPool.toLocaleString()}</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedDrawModal(null)}
              className="w-full py-3 bg-white/10 hover:bg-white/15 text-white font-bold rounded-xl"
            >
              Close Vault Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
