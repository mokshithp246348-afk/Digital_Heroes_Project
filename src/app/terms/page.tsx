'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 text-slate-300 text-xs sm:text-sm">
      <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-orange-400 hover:underline">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <div className="space-y-3 border-b border-white/10 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> LEGAL & COMPLIANCE
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">Terms & Conditions</h1>
        <p className="text-xs text-slate-400">Last updated: September 2026</p>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-white uppercase tracking-wider">1. Membership & Subscription Terms</h2>
          <p>
            Digital Heroes provides a digital subscription platform combining golf score tracking, charity contributions, and monthly championship draws. Membership is billed at $19/month or $190/year. 15% of membership revenue is allocated directly to verified non-profit charity partners.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white uppercase tracking-wider">2. Monthly Draw Eligibility</h2>
          <p>
            Subscribers must maintain an active membership status and log 5 rolling Stableford golf scores (ranging from 1 to 45 points) prior to the official monthly draw date. Scores are validated against official handicapping systems.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white uppercase tracking-wider">3. Rollover Jackpot Rules</h2>
          <p>
            If zero subscribers match all 5 winning numbers in a monthly draw, 100% of the jackpot pool carries forward to the following month’s jackpot.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white uppercase tracking-wider">4. Cancellation Policy</h2>
          <p>
            Members may cancel or alter their subscription cadence at any time via the User Dashboard or Subscription management settings without penalty.
          </p>
        </section>
      </div>
    </div>
  );
}
