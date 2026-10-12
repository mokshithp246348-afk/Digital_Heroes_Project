'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Charity } from '@/types';
import DirectDonationModal from '@/components/charity/DirectDonationModal';
import {
  Heart,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Award,
  Users,
  CheckCircle2,
  ExternalLink,
  DollarSign,
} from 'lucide-react';

export default function MyImpactPage() {
  const { user } = useAuth();
  const [charities, setCharities] = useState<Charity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [donationModalOpen, setDonationModalOpen] = useState(false);

  useEffect(() => {
    async function loadCharities() {
      try {
        const res = await fetch('/api/admin/metrics', { cache: 'no-store' });
        const data = await res.json();
        // Fallback to local storage charities if available
        const { getCharities } = await import('@/lib/storage');
        setCharities(getCharities());
      } catch {
        const { getCharities } = await import('@/lib/storage');
        setCharities(getCharities());
      } finally {
        setIsLoading(false);
      }
    }
    loadCharities();
  }, []);

  // Compute user personalized impact
  const pct = user?.charityContributionPct || 15;
  const price = user?.billingCycle === 'yearly' ? 190 : 19;
  const monthlyContribution = (price * (pct / 100)).toFixed(2);
  const selectedCharity = charities.find((c) => c.id === user?.charityId) || charities[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/25 text-rose-300 text-xs font-semibold mb-2">
            <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
            CHARITY & COMMUNITY IMPACT PORTAL
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">My Philanthropic Impact</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Every golf round logged contributes directly to verified community causes and youth sports initiatives.
          </p>
        </div>

        <button
          onClick={() => setDonationModalOpen(true)}
          className="px-5 py-3 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold rounded-2xl text-xs transition shadow-lg shadow-rose-500/25 flex items-center gap-2 self-start md:self-auto"
        >
          <Heart className="w-4 h-4 fill-white text-white" />
          <span>Make Direct Charity Pledge</span>
        </button>
      </div>

      {/* PERSONALIZED IMPACT DASHBOARD */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-rose-500/30 space-y-6 bg-gradient-to-b from-[#1c1422] to-[#0a0e17]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-4">
          <div>
            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-rose-400" /> YOUR PERSONALIZED CONTRIBUTION PLEDGE
            </span>
            <h2 className="text-2xl font-extrabold text-white mt-1">
              Supporting: {selectedCharity?.name || 'Fairway for Kids'}
            </h2>
          </div>

          <span className="px-3.5 py-1.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-black text-xs">
            {pct}% OF MEMBERSHIP FEE PLEDGED
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-1">
            <span className="text-slate-400 font-semibold">MONTHLY DONATION PACE</span>
            <div className="text-3xl font-black text-gradient-impact">${monthlyContribution}/mo</div>
            <div className="text-[11px] text-slate-400">Derived from your {pct}% pledge setting</div>
          </div>

          <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-1">
            <span className="text-slate-400 font-semibold">SELECTED CAUSE CATEGORY</span>
            <div className="text-xl font-extrabold text-white">{selectedCharity?.category || 'Youth & Children'}</div>
            <div className="text-[11px] text-rose-300">100% Tax-Deductible Partner</div>
          </div>

          <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-1">
            <span className="text-slate-400 font-semibold">TOTAL COMMUNITY RAISED</span>
            <div className="text-xl font-extrabold text-emerald-400">${selectedCharity?.totalRaised.toLocaleString() || '52,400'}</div>
            <div className="text-[11px] text-slate-400">Supported by {selectedCharity?.supporterCount || 438} golfers</div>
          </div>
        </div>
      </div>

      {/* ALL VERIFIED CHARITY PARTNERS */}
      <div className="space-y-6">
        <h3 className="text-xl font-black text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-rose-400" />
          Verified Non-Profit Partners & Causes
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {charities.map((c) => (
            <div key={c.id} className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4 hover:border-rose-500/30 transition">
              <div className="flex justify-between items-start">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[10px] font-bold uppercase">
                    {c.category}
                  </span>
                  <h4 className="text-lg font-extrabold text-white mt-2">{c.name}</h4>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-emerald-400">${c.totalRaised.toLocaleString()} Raised</div>
                  <div className="text-[10px] text-slate-400">{c.supporterCount} Supporters</div>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{c.description}</p>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1 text-xs">
                <span className="font-bold text-amber-300 flex items-center gap-1 text-[11px]">
                  <Award className="w-3.5 h-3.5 text-amber-400" /> Verified Impact Story:
                </span>
                <p className="text-[11px] text-slate-400">{c.impactStory}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <DirectDonationModal isOpen={donationModalOpen} onClose={() => setDonationModalOpen(false)} />
    </div>
  );
}
