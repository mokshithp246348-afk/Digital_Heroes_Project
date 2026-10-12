'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 text-slate-300 text-xs sm:text-sm">
      <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-orange-400 hover:underline">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <div className="space-y-3 border-b border-white/10 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> DATA PROTECTION & PRIVACY
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">Privacy Policy</h1>
        <p className="text-xs text-slate-400">Last updated: September 2026</p>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-white uppercase tracking-wider">1. Data Collection & Processing</h2>
          <p>
            Digital Heroes collects minimal account information (name, email address, golf handicap, home club) required to provide membership services, track rolling golf scores, and disburse prize winnings.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white uppercase tracking-wider">2. Security & Encryption</h2>
          <p>
            All user authentication tokens and sensitive operations are protected with HS256 JWT tokens and bcrypt password hashing. Financial transactions are processed strictly via secure Stripe payment processing.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white uppercase tracking-wider">3. Winner Anonymity & Protection</h2>
          <p>
            Winner records displayed on public leaderboards show only anonymized first names and initial club details to protect user privacy. Full personal credentials are never exposed publicly.
          </p>
        </section>
      </div>
    </div>
  );
}
