'use client';

import React from 'react';
import Link from 'next/link';
import { Trophy, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function RulesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 text-slate-300 text-xs sm:text-sm">
      <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-orange-400 hover:underline">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <div className="space-y-3 border-b border-white/10 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/25 text-amber-300 text-xs font-semibold">
          <Trophy className="w-3.5 h-3.5 text-amber-400" /> OFFICIAL COMPETITION RULES
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">Draw Engine Mechanics & Rules</h1>
        <p className="text-xs text-slate-400">Official rules governing monthly championship draws</p>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Rule 1: The 5 Rolling Score Requirement
          </h2>
          <p>
            Golfer entries are derived from their 5 most recent Stableford round scores (1–45). Submitting a 6th round score automatically evicts the oldest score. Only 1 score per date is permitted.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Rule 2: Prize Tier Disbursement
          </h2>
          <p>
            - <strong>5-Match (Jackpot)</strong>: 40% of draw pool + 100% of accumulated rollover.<br />
            - <strong>4-Match</strong>: 35% of draw pool split equally among winners.<br />
            - <strong>3-Match</strong>: 25% of draw pool split equally among winners.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Rule 3: Rollover Jackpot Policy
          </h2>
          <p>
            If no active subscriber matches 5 drawn numbers, the entire 5-match jackpot pool carries forward to the following month's draw.
          </p>
        </section>
      </div>
    </div>
  );
}
