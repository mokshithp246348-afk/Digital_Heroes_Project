'use client';

import { useState, useEffect } from 'react';
import { getUsers, updateUser, addAuditLog } from '@/lib/storage';
import { User } from '@/types';
import { CreditCard, Filter, AlertCircle, CheckCircle2, Clock, ShieldCheck, XCircle } from 'lucide-react';

export default function AdminSubscriptionsPage() {
  const [usersList, setUsersList] = useState<User[]>([]);
  const [subFilter, setSubFilter] = useState<'ALL' | 'ACTIVE' | 'PAST_DUE' | 'PAYMENT_FAILED' | 'CANCELLED' | 'EXPIRED'>('ALL');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const loadData = () => {
    setUsersList(getUsers());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('dh-storage-update', loadData);
    return () => window.removeEventListener('dh-storage-update', loadData);
  }, []);

  const getDerivedSubState = (user: User): 'ACTIVE' | 'PAST_DUE' | 'PAYMENT_FAILED' | 'CANCELLED' | 'EXPIRED' => {
    const isSuspended = (user as any).isSuspended || false;
    if (isSuspended) return 'PAYMENT_FAILED';
    if (user.subscriptionStatus === 'active') return 'ACTIVE';
    if (user.subscriptionStatus === 'lapsed') return 'PAST_DUE';
    if (user.subscriptionStatus === 'inactive') return 'CANCELLED';
    return 'EXPIRED';
  };

  const handleSimulatePaymentState = (user: User, nextState: 'ACTIVE' | 'PAST_DUE' | 'PAYMENT_FAILED' | 'CANCELLED') => {
    let subStatus: User['subscriptionStatus'] = 'active';
    let isSuspended = false;

    if (nextState === 'ACTIVE') {
      subStatus = 'active';
    } else if (nextState === 'PAST_DUE') {
      subStatus = 'lapsed';
    } else if (nextState === 'PAYMENT_FAILED') {
      subStatus = 'lapsed';
      isSuspended = true;
    } else if (nextState === 'CANCELLED') {
      subStatus = 'inactive';
    }

    const updated = { ...user, subscriptionStatus: subStatus, isSuspended };
    updateUser(updated);

    addAuditLog(
      `Subscription State Machine Transition to ${nextState}`,
      'SUBSCRIPTION',
      user.id,
      `State: ${getDerivedSubState(user)}`,
      `State: ${nextState}`
    );

    loadData();
    setSelectedUser(null);
  };

  const filtered = usersList.filter((u) => {
    if (subFilter === 'ALL') return true;
    return getDerivedSubState(u) === subFilter;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 text-xs font-semibold mb-1">
            <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
            § 04 & § 11 · Subscription Lifecycle & State Machine
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Subscription Operations</h1>
          <p className="text-xs text-slate-400">Monitor payment states, grace periods, and draw eligibility suspensions.</p>
        </div>
      </div>

      {/* State Machine Status Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(['ALL', 'ACTIVE', 'PAST_DUE', 'PAYMENT_FAILED', 'CANCELLED', 'EXPIRED'] as const).map((st) => (
          <button
            key={st}
            onClick={() => setSubFilter(st)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              subFilter === st
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            {st.replace('_', ' ')} (
            {st === 'ALL'
              ? usersList.length
              : usersList.filter((u) => getDerivedSubState(u) === st).length}
            )
          </button>
        ))}
      </div>

      {/* Subscription Table */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-white/5 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-white/10">
              <tr>
                <th className="px-5 py-3.5">SUBSCRIBER</th>
                <th className="px-5 py-3.5">STATE MACHINE</th>
                <th className="px-5 py-3.5">PLAN & RATE</th>
                <th className="px-5 py-3.5">RENEWAL DATE</th>
                <th className="px-5 py-3.5">DRAW ELIGIBILITY</th>
                <th className="px-5 py-3.5 text-right">MANAGE STATE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((u) => {
                const subState = getDerivedSubState(u);
                const isEligible = subState === 'ACTIVE';

                return (
                  <tr key={u.id} className="hover:bg-white/5 transition">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-white">{u.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                        subState === 'ACTIVE'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : subState === 'PAST_DUE'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : subState === 'PAYMENT_FAILED'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-slate-500/20 text-slate-400'
                      }`}>
                        {subState.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-white capitalize">{u.billingCycle || 'Monthly'}</div>
                      <div className="text-[10px] text-slate-500">{u.billingCycle === 'yearly' ? '$190/yr' : '$19/mo'}</div>
                    </td>

                    <td className="px-5 py-3.5 font-mono text-slate-400">
                      {u.subscriptionRenewalDate ? u.subscriptionRenewalDate.split('T')[0] : '2026-04-01'}
                    </td>

                    <td className="px-5 py-3.5">
                      <span className={`font-bold text-[11px] flex items-center gap-1 ${
                        isEligible ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {isEligible ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {isEligible ? 'Eligible' : 'Suspended'}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => setSelectedUser(u)}
                        className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold transition"
                      >
                        State Machine →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* State Machine Transition Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#121724] border border-white/15 rounded-3xl p-6 shadow-2xl space-y-5 text-xs text-slate-300">
            <h3 className="text-lg font-bold text-white">Subscription State Machine</h3>
            <p className="text-slate-400">Target Subscriber: <strong className="text-white">{selectedUser.name}</strong></p>

            <div className="space-y-2">
              <button
                onClick={() => handleSimulatePaymentState(selectedUser, 'ACTIVE')}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-left flex justify-between items-center"
              >
                <span>Set to ACTIVE (Payment Received)</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </button>

              <button
                onClick={() => handleSimulatePaymentState(selectedUser, 'PAST_DUE')}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-left flex justify-between items-center"
              >
                <span>Set to PAST_DUE (Grace Period)</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </button>

              <button
                onClick={() => handleSimulatePaymentState(selectedUser, 'PAYMENT_FAILED')}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-left flex justify-between items-center"
              >
                <span>Set to PAYMENT_FAILED (Suspend Eligibility)</span>
                <AlertCircle className="w-4 h-4 text-rose-400" />
              </button>

              <button
                onClick={() => handleSimulatePaymentState(selectedUser, 'CANCELLED')}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-500/20 hover:bg-slate-500/30 text-slate-300 font-bold text-left flex justify-between items-center"
              >
                <span>Set to CANCELLED</span>
                <XCircle className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <button onClick={() => setSelectedUser(null)} className="w-full py-2 bg-white/10 text-slate-300 font-semibold rounded-xl mt-2">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
