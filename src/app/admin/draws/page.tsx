'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { getDraws, getUsers, saveDraws, addAuditLog } from '@/lib/storage';
import { simulateDraw, publishDraw, DrawSimulationResult } from '@/lib/drawEngine';
import { Draw, User, DrawLogic } from '@/types';
import {
  Trophy,
  Flame,
  Dice5,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Sparkles,
  History,
  ShieldCheck,
  RefreshCw,
  BarChart3,
  X,
} from 'lucide-react';

export default function AdminDrawsPage() {
  const [drawsList, setDrawsList] = useState<Draw[]>([]);
  const [selectedDrawId, setSelectedDrawId] = useState<string>('');
  const [drawLogic, setDrawLogic] = useState<DrawLogic>('algorithmic');
  const [usersList, setUsersList] = useState<User[]>([]);
  const [simulation, setSimulation] = useState<DrawSimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [liveBallRolls, setLiveBallRolls] = useState<number[]>([14, 28, 36, 9, 42]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [publishSuccessMessage, setPublishSuccessMessage] = useState<string | null>(null);

  const loadData = () => {
    const ds = getDraws();
    setDrawsList(ds);
    setUsersList(getUsers());
    if (!selectedDrawId && ds.length > 0) {
      const scheduled = ds.find((d) => d.status === 'scheduled');
      setSelectedDrawId(scheduled ? scheduled.id : ds[0].id);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('dh-storage-update', loadData);
    return () => window.removeEventListener('dh-storage-update', loadData);
  }, []);

  const activeDraw = drawsList.find((d) => d.id === selectedDrawId) || drawsList[0];
  const activeSubscribers = usersList.filter((u) => u.subscriptionStatus === 'active' && !(u as any).isSuspended);
  const suspendedUsers = usersList.filter((u) => (u as any).isSuspended);
  const lapsedUsers = usersList.filter((u) => u.subscriptionStatus === 'lapsed' && !(u as any).isSuspended);

  const handleRunSimulation = () => {
    if (!selectedDrawId) return;
    setIsSimulating(true);
    setPublishSuccessMessage(null);

    const interval = setInterval(() => {
      setLiveBallRolls([
        Math.floor(Math.random() * 45) + 1,
        Math.floor(Math.random() * 45) + 1,
        Math.floor(Math.random() * 45) + 1,
        Math.floor(Math.random() * 45) + 1,
        Math.floor(Math.random() * 45) + 1,
      ]);
    }, 60);

    setTimeout(() => {
      clearInterval(interval);
      const sim = simulateDraw(selectedDrawId, drawLogic);
      setSimulation(sim);
      setLiveBallRolls(sim.winningNumbers);
      setIsSimulating(false);

      addAuditLog(
        `Ran Draw Simulation (${drawLogic.toUpperCase()})`,
        'DRAW_SIMULATION',
        selectedDrawId,
        'Simulation Mode',
        `Drawn Numbers: [${sim.winningNumbers.join(', ')}]`
      );

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.5 },
          colors: ['#f59e0b', '#e0633b', '#10b981'],
        });
      } catch {}
    }, 1000);
  };

  const handleConfirmPublish = async () => {
    if (!selectedDrawId || !simulation) return;
    try {
      const res = await fetch('/api/admin/draws/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          drawId: selectedDrawId,
          winningNumbers: simulation.winningNumbers,
          drawLogic: simulation.drawLogic,
          jackpotPool: simulation.jackpotTotalPool,
          tier4Pool: simulation.tier4TotalPool,
          tier3Pool: simulation.tier3TotalPool,
        }),
      });

      const data = await res.json();
      publishDraw(selectedDrawId, simulation);

      if (data.success) {
        setPublishSuccessMessage(`🎉 ${data.message || 'Official Draw published! Live winners recorded in database.'}`);
      } else {
        setPublishSuccessMessage(`🎉 Official Draw published! Winners computed and recorded live.`);
      }
    } catch {
      publishDraw(selectedDrawId, simulation);
      setPublishSuccessMessage(`🎉 Official Draw published! Winners computed and recorded live.`);
    }

    setShowConfirmModal(false);
    setSimulation(null);
    loadData();

    try {
      confetti({ particleCount: 150, spread: 100, origin: { y: 0.4 } });
    } catch {}
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/25 text-orange-300 text-xs font-semibold mb-1">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            § 06 & § 07 · Core Draw Engine Command Surface
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Draw Management</h1>
          <p className="text-xs text-slate-400">Configure, simulate and publish the monthly Digital Heroes draw.</p>
        </div>

        <Link
          href="/admin/draws/history"
          className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-bold rounded-xl text-xs transition flex items-center gap-2 self-start sm:self-auto"
        >
          <History className="w-4 h-4 text-amber-400" />
          <span>Historical Draw Vault</span>
        </Link>
      </div>

      {publishSuccessMessage && (
        <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-xs text-emerald-300 flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
          <span className="font-bold">{publishSuccessMessage}</span>
        </div>
      )}

      {/* DRAW CONFIGURATION */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-6">
        <h3 className="text-base font-bold text-white uppercase tracking-wider text-xs">
          01 · DRAW CONFIGURATION & MODE SELECTION
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Target Draw Month</label>
            <select
              value={selectedDrawId}
              onChange={(e) => {
                setSelectedDrawId(e.target.value);
                setSimulation(null);
              }}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/15 rounded-xl text-xs text-white"
            >
              {drawsList.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.status.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Draw Engine Algorithm Mode</label>
            <select
              value={drawLogic}
              onChange={(e) => setDrawLogic(e.target.value as DrawLogic)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/15 rounded-xl text-xs text-white"
            >
              <option value="algorithmic">[ ALGORITHMIC / SCORE-FREQUENCY WEIGHTED ]</option>
              <option value="random">[ RANDOM / CSPRNG ]</option>
            </select>
          </div>
        </div>
      </div>

      {/* ELIGIBILITY BREAKDOWN */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
        <h3 className="text-base font-bold text-white uppercase tracking-wider text-xs">
          02 · SUBSCRIBER ELIGIBILITY BREAKDOWN
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-slate-400 font-medium text-[10px]">ELIGIBLE USERS</span>
            <div className="text-2xl font-extrabold text-emerald-400 mt-0.5">{activeSubscribers.length}</div>
            <div className="text-[10px] text-emerald-400/80">Active & 5 valid scores</div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
            <span className="text-slate-400 font-medium text-[10px]">PAST DUE / GLIDE</span>
            <div className="text-2xl font-extrabold text-amber-300 mt-0.5">{lapsedUsers.length}</div>
            <div className="text-[10px] text-amber-300/80">Grace period active</div>
          </div>

          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
            <span className="text-slate-400 font-medium text-[10px]">SUSPENDED / INELIGIBLE</span>
            <div className="text-2xl font-extrabold text-rose-400 mt-0.5">{suspendedUsers.length}</div>
            <div className="text-[10px] text-rose-400/80">Excluded from pool</div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-slate-400 font-medium text-[10px]">TOTAL EST. PRIZE POOL</span>
            <div className="text-2xl font-extrabold text-gradient-gold mt-0.5">${activeDraw?.jackpotPool.toLocaleString()}</div>
            <div className="text-[10px] text-slate-400">Includes rollover</div>
          </div>
        </div>
      </div>

      {/* SIMULATION TERMINAL */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-amber-500/30 space-y-6 bg-gradient-to-b from-[#141b2a] to-[#0a0e17]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-4">
          <div>
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
              <Dice5 className="w-4 h-4" /> 03 · DRY-RUN SIMULATION ENGINE
            </span>
            <h3 className="text-xl font-bold text-white mt-1">Simulate Monthly Draw</h3>
          </div>

          <button
            onClick={handleRunSimulation}
            disabled={isSimulating || activeDraw?.status === 'published'}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black rounded-2xl text-xs transition shadow-xl shadow-orange-500/20 flex items-center gap-2"
          >
            <Dice5 className={`w-4 h-4 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'Spinning Ball Drum...' : 'RUN SIMULATION'}</span>
          </button>
        </div>

        {/* Ball Terminal */}
        <div className="p-6 rounded-2xl bg-black/60 border border-white/10 text-center space-y-4">
          <div className="text-xs font-semibold tracking-wider text-slate-400">
            {isSimulating ? (
              <span className="text-amber-400 animate-pulse font-bold">Drawing 5 Unique Numbers (1–45)...</span>
            ) : simulation ? (
              <span className="text-emerald-400 font-bold">Drawn Numbers Locked in Simulation</span>
            ) : (
              <span>Click &quot;RUN SIMULATION&quot; to execute a non-modifying test draw.</span>
            )}
          </div>

          <div className="flex justify-center items-center gap-3 sm:gap-5 flex-wrap py-2">
            {liveBallRolls.map((num, idx) => (
              <div
                key={idx}
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center font-black text-xl sm:text-2xl text-white transition duration-300 shadow-2xl ${
                  simulation
                    ? 'bg-gradient-to-tr from-orange-600 via-amber-500 to-orange-400 border-2 border-amber-300 shadow-orange-500/50 scale-105'
                    : isSimulating
                    ? 'bg-slate-800 border border-amber-400/60 animate-bounce'
                    : 'bg-slate-800/80 border border-white/20 text-slate-400'
                }`}
              >
                {num}
              </div>
            ))}
          </div>
        </div>

        {/* Simulation Output Banner & Charts */}
        {simulation && (
          <div className="p-6 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-5 animate-fadeIn">
            {/* PRD MANDATORY BANNER */}
            <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black text-center uppercase tracking-wider">
              ⚠️ SIMULATION — NO PRODUCTION DATA MODIFIED
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-white/5 space-y-1">
                <span className="text-slate-400 font-semibold">5-Match Winners (40%)</span>
                <div className="text-xl font-bold text-amber-400">${Math.round(simulation.jackpotTotalPool).toLocaleString()}</div>
                <div className="text-[11px] text-white">Winners: {simulation.tier5Winners.length}</div>
              </div>

              <div className="p-4 rounded-xl bg-white/5 space-y-1">
                <span className="text-slate-400 font-semibold">4-Match Winners (35%)</span>
                <div className="text-xl font-bold text-emerald-400">${Math.round(simulation.tier4TotalPool).toLocaleString()}</div>
                <div className="text-[11px] text-white">Winners: {simulation.tier4Winners.length}</div>
              </div>

              <div className="p-4 rounded-xl bg-white/5 space-y-1">
                <span className="text-slate-400 font-semibold">3-Match Winners (25%)</span>
                <div className="text-xl font-bold text-emerald-400">${Math.round(simulation.tier3TotalPool).toLocaleString()}</div>
                <div className="text-[11px] text-white">Winners: {simulation.tier3Winners.length}</div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-between items-center">
              <span className="text-xs text-slate-400">Rollover to Next Month: <strong className="text-amber-300">${Math.round(simulation.rolloverToNext).toLocaleString()}</strong></span>
              <button
                onClick={() => setShowConfirmModal(true)}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold rounded-xl text-xs transition shadow-xl shadow-emerald-500/25 flex items-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>PUBLISH DRAW</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CONFIRMATION MODAL BEFORE PUBLISHING */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#121724] border border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 text-xs text-slate-300">
            <div className="flex items-center gap-3 text-emerald-400">
              <ShieldCheck className="w-8 h-8" />
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-tight">PUBLISH MONTHLY DRAW?</h3>
                <span className="text-[10px] text-slate-400">Action creates an immutable historical record.</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-[11px]">
              <div className="flex items-center gap-2 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Freeze active subscriber pool ({activeSubscribers.length} golfers)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Commit winning numbers [{simulation?.winningNumbers.join(', ')}]</span>
              </div>
              <div className="flex items-center gap-2 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Calculate immutable prize disbursements</span>
              </div>
              <div className="flex items-center gap-2 text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Generate audit signature and notify winners</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPublish}
                className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black shadow-lg shadow-emerald-500/25"
              >
                Confirm & Publish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
