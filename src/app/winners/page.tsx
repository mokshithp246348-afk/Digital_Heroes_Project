'use client';

import { useState, useEffect } from 'react';
import { Winner } from '@/types';
import {
  Trophy,
  Award,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Sparkles,
  Search,
  Filter,
  RefreshCw,
} from 'lucide-react';

export default function WinnersPage() {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterMatch, setFilterMatch] = useState<string>('all');

  const fetchWinners = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/draws', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.allWinners)) {
        setWinners(data.allWinners);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWinners();
  }, []);

  const filteredWinners = winners.filter((w) => {
    if (filterMatch === 'all') return true;
    return w.matchType === filterMatch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/25 text-amber-300 text-xs font-semibold mb-2">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            VERIFIED CHAMPIONSHIP WINNERS HALL
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Verified Draw Winners</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Celebrating golfers whose rolling 5 Stableford scores matched monthly draw winning combinations.
          </p>
        </div>

        <button onClick={fetchWinners} className="p-2.5 text-slate-400 hover:text-white bg-white/5 rounded-xl border border-white/10 transition flex items-center gap-2 self-start md:self-auto text-xs font-semibold">
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Hall</span>
        </button>
      </div>

      {/* Filter controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
        <span className="text-xs text-slate-300 font-bold uppercase tracking-wider">Filter Winner Tier</span>
        <div className="flex gap-2 text-xs w-full sm:w-auto">
          {['all', '5_match', '4_match', '3_match'].map((tier) => (
            <button
              key={tier}
              onClick={() => setFilterMatch(tier)}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl font-bold transition capitalize ${
                filterMatch === tier
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-white/10'
              }`}
            >
              {tier === 'all' ? 'All Winners' : tier.replace('_', '-')}
            </button>
          ))}
        </div>
      </div>

      {/* Winners Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 bg-white/5 animate-pulse rounded-3xl border border-white/10" />
          ))}
        </div>
      ) : filteredWinners.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-3xl border border-white/10 space-y-3">
          <div className="text-3xl text-amber-400">🏆</div>
          <h3 className="text-lg font-bold text-white">No Verified Winners Recorded Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Winners will be officially spotlighted here as monthly draws complete and payouts are verified.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWinners.map((w) => (
            <div
              key={w.id}
              className="glass-panel p-6 rounded-3xl border border-amber-500/30 space-y-4 hover:border-amber-400 transition bg-gradient-to-b from-[#141b2a] to-[#0a0e17]"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center font-black text-slate-950 text-base shadow-lg shadow-orange-500/20">
                    {w.userName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-base">{w.userName}</h4>
                    <span className="text-[10px] text-slate-400">Verified Golfer</span>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  VERIFIED
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">PRIZE WINNINGS</span>
                <div className="text-2xl font-black text-gradient-gold">${w.prizeAmount.toLocaleString()}</div>
                <div className="text-[10px] text-amber-400 font-bold">{w.matchType.replace('_', '-').toUpperCase()} MATCH</div>
              </div>

              <div className="pt-2 border-t border-white/10 flex justify-between items-center text-xs text-slate-400">
                <span className="truncate max-w-[180px] font-medium text-slate-300">{w.drawName}</span>
                <span className="text-[11px]">{w.drawDate}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
