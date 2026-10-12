'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import SubscriptionModal from '@/components/subscription/SubscriptionModal';
import {
  CreditCard,
  CheckCircle2,
  Calendar,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  Clock,
  ArrowRight,
  Crown,
} from 'lucide-react';

export default function SubscriptionPage() {
  const { user, refreshUser } = useAuth();
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const cycle = user?.billingCycle || 'monthly';
  const price = cycle === 'yearly' ? '$190 / year ($15.83/mo)' : '$19 / month';
  const startDate = user?.subscriptionStartDate ? user.subscriptionStartDate.split('T')[0] : '2026-01-01';
  const renewalDate = user?.subscriptionRenewalDate ? user.subscriptionRenewalDate.split('T')[0] : '2026-10-24';

  const handleToggleCycle = async () => {
    setIsUpdating(true);
    setMessage(null);
    const newCycle = cycle === 'monthly' ? 'yearly' : 'monthly';

    try {
      const res = await fetch('/api/user/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          email: user?.email,
          billingCycle: newCycle,
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.user) {
          const { updateUser } = await import('@/lib/storage');
          updateUser(data.user);
        }
        await refreshUser();
        setMessage(`Subscription plan updated to ${newCycle === 'yearly' ? '1 Year (Annual)' : '1 Month (Monthly)'} billing!`);
      } else {
        setMessage('Failed to update subscription.');
      }
    } catch {
      setMessage('Error updating subscription.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 text-slate-100 relative z-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#121824] border border-[#D4AF37]/30 text-[#F5E6AB] text-xs font-semibold mb-2 uppercase tracking-wider">
            <Crown className="w-3.5 h-3.5 text-[#D4AF37]" />
            MEMBERSHIP & BILLING MANAGEMENT
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">Subscription Plan</h1>
          <p className="text-xs sm:text-sm text-slate-400 font-light mt-1">
            Manage your Digital Heroes membership tier, billing frequency, and charity contribution allocation.
          </p>
        </div>

        <button
          onClick={() => setSubModalOpen(true)}
          className="px-5 py-3 btn-gold-primary text-slate-950 font-bold rounded-2xl text-xs transition shadow-xl flex items-center gap-2 self-start md:self-auto"
        >
          <Sparkles className="w-4 h-4 text-slate-950" />
          <span>Change Subscription Tier</span>
        </button>
      </div>

      {message && (
        <div className="p-4 bg-[#D4AF37]/15 border border-[#D4AF37]/30 rounded-2xl text-[#F5E6AB] text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
          <span>{message}</span>
        </div>
      )}

      {/* PLAN SUMMARY CARDS */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[#D4AF37]/30 space-y-6 bg-gradient-to-b from-[#0f1420] to-[#05070A]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-4">
          <div>
            <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest">ACTIVE MEMBERSHIP TIER</span>
            <h2 className="text-2xl font-serif font-bold text-white mt-1 capitalize">Digital Heroes {cycle} Subscription</h2>
          </div>

          <span className="px-3.5 py-1.5 rounded-full bg-[#D4AF37]/20 text-[#F5E6AB] border border-[#D4AF37]/40 font-bold text-xs uppercase flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" /> ACTIVE MEMBER
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-5 rounded-2xl bg-[#05070A] border border-[#D4AF37]/20 space-y-1">
            <span className="text-slate-400 font-semibold uppercase text-[10px]">PLAN RATE</span>
            <div className="text-2xl font-serif font-bold gold-text">{price}</div>
            <div className="text-[11px] text-slate-400 font-light">Includes 100% draw entry & charity pledge</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#05070A] border border-white/10 space-y-1">
            <span className="text-slate-400 font-semibold uppercase text-[10px]">START DATE</span>
            <div className="text-xl font-serif font-bold text-white">{startDate}</div>
            <div className="text-[11px] text-slate-400 font-light">Membership initial activation</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#05070A] border border-white/10 space-y-1">
            <span className="text-slate-400 font-semibold uppercase text-[10px]">NEXT RENEWAL DATE</span>
            <div className="text-xl font-serif font-bold text-[#F5E6AB]">{renewalDate}</div>
            <div className="text-[11px] text-slate-400 font-light">Auto-renews safely via Stripe</div>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10 text-xs">
          <span className="text-slate-400 font-light">
            Current Billing Cadence: <strong className="text-white font-semibold uppercase">{cycle === 'yearly' ? '1 Year (Annual)' : '1 Month (Monthly)'}</strong>
          </span>

          <button
            onClick={handleToggleCycle}
            disabled={isUpdating}
            className="px-5 py-2.5 rounded-xl btn-gold-primary text-slate-950 font-bold transition shadow-md flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
            <span>{cycle === 'yearly' ? 'Switch Plan to 1 Month ($19/mo)' : 'Switch Plan to 1 Year (Save 17%)'}</span>
          </button>
        </div>
      </div>

      {/* PAYMENT HISTORY TABLE */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
        <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#D4AF37]" />
          Payment & Transaction History
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-white/5 text-slate-400 uppercase text-[10px] font-bold">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-[11px]">
              <tr className="hover:bg-white/5 transition">
                <td className="px-4 py-3 text-slate-400">{startDate}</td>
                <td className="px-4 py-3 text-white font-sans font-semibold">Digital Heroes {cycle} Subscription</td>
                <td className="px-4 py-3 text-[#F5E6AB] font-bold">{cycle === 'yearly' ? '$190.00' : '$19.00'}</td>
                <td className="px-4 py-3 text-[#D4AF37] font-sans font-bold">Paid (Verified)</td>
                <td className="px-4 py-3 text-slate-500">TX-REF-884920</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <SubscriptionModal isOpen={subModalOpen} onClose={() => setSubModalOpen(false)} />
    </div>
  );
}
