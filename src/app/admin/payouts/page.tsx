'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getWinners, markWinnerPaid, getAnalytics } from '@/lib/storage';
import { Winner, PlatformAnalytics } from '@/types';
import {
  DollarSign,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Search,
  ArrowUpRight,
  Receipt,
  AlertCircle,
  X,
  CreditCard,
  Building2,
} from 'lucide-react';

export default function AdminPayoutsPage() {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPayment, setFilterPayment] = useState<'all' | 'pending' | 'paid'>('all');
  const [selectedWinnerForPayout, setSelectedWinnerForPayout] = useState<Winner | null>(null);
  const [transactionRef, setTransactionRef] = useState('');
  const [payoutSuccessMsg, setPayoutSuccessMsg] = useState<string | null>(null);

  const loadData = () => {
    setWinners(getWinners());
    setAnalytics(getAnalytics());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('dh-storage-update', loadData);
    return () => window.removeEventListener('dh-storage-update', loadData);
  }, []);

  const openPayoutModal = (winner: Winner) => {
    setSelectedWinnerForPayout(winner);
    setTransactionRef(`TX-REF-${Math.floor(100000 + Math.random() * 900000)}`);
  };

  const handleConfirmPayout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWinnerForPayout || !transactionRef.trim()) return;

    const ok = markWinnerPaid(selectedWinnerForPayout.id, transactionRef.trim());
    if (ok) {
      setPayoutSuccessMsg(
        `Payout of $${selectedWinnerForPayout.prizeAmount.toLocaleString()} successfully recorded for ${
          selectedWinnerForPayout.userName
        } (TxID: ${transactionRef})`
      );
      setSelectedWinnerForPayout(null);
      setTransactionRef('');
      loadData();
      setTimeout(() => setPayoutSuccessMsg(null), 5000);
    }
  };

  const filteredWinners = winners.filter((w) => {
    const matchesSearch =
      w.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.drawId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ((w as any).transactionId && (w as any).transactionId.toLowerCase().includes(searchTerm.toLowerCase()));

    if (filterPayment === 'all') return matchesSearch;
    return matchesSearch && w.paymentStatus === filterPayment;
  });

  const pendingPayoutWinners = winners.filter((w) => w.paymentStatus === 'pending' && w.verificationStatus === 'approved');
  const paidWinners = winners.filter((w) => w.paymentStatus === 'paid');

  const totalPaidOut = paidWinners.reduce((sum, w) => sum + w.prizeAmount, 0);
  const totalPendingPayout = pendingPayoutWinners.reduce((sum, w) => sum + w.prizeAmount, 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-900/30 pb-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-emerald-400 font-mono tracking-widest uppercase mb-1">
            <span>Admin Control Center</span>
            <span>/</span>
            <span>Payout Management</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-emerald-400" /> Winner Payout Operations
          </h1>
          <p className="text-xs text-slate-400">
            Process direct bank transfers, track payment reference receipts, and manage verified draw prize distributions.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/admin/winners"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold rounded-lg text-xs flex items-center space-x-2 transition-all"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Verification Queue</span>
          </Link>
        </div>
      </div>

      {payoutSuccessMsg && (
        <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-semibold flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{payoutSuccessMsg}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>TOTAL DISBURSED PRIZES</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-2">${totalPaidOut.toLocaleString()}</div>
          <div className="text-[11px] text-slate-500 mt-1">{paidWinners.length} winner payouts completed</div>
        </div>

        <div className="bg-slate-900/80 border border-amber-500/30 rounded-xl p-4 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-amber-400 font-mono font-bold">
            <span>READY FOR DISBURSEMENT</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-amber-400 mt-2">${totalPendingPayout.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400 mt-1">{pendingPayoutWinners.length} verified winners awaiting payout</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>CHARITY GRANTS DISBURSED</span>
            <Building2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-blue-400 mt-2">
            ${(analytics?.totalCharityContributions || 12450).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Direct charity grant transfers</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search winner name, TxID, draw..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          {(['all', 'pending', 'paid'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterPayment(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                filterPayment === st
                  ? 'bg-amber-500/20 border border-amber-500/50 text-amber-400'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Payout Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Winner Golfer</th>
                <th className="px-5 py-3.5">Draw Event</th>
                <th className="px-5 py-3.5">Prize Amount</th>
                <th className="px-5 py-3.5">Verification</th>
                <th className="px-5 py-3.5">Payment Status</th>
                <th className="px-5 py-3.5">Transaction Ref</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredWinners.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-500">
                    No payout records found matching filter.
                  </td>
                </tr>
              ) : (
                filteredWinners.map((winner) => (
                  <tr key={winner.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4 font-bold text-white flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-black">
                        {winner.userName.charAt(0)}
                      </div>
                      <div>
                        <div>{winner.userName}</div>
                        <div className="text-[10px] text-slate-500 font-mono uppercase">{winner.matchType} prize</div>
                      </div>
                    </td>

                    <td className="px-5 py-4 font-mono text-slate-400">{winner.drawId}</td>

                    <td className="px-5 py-4 font-black text-amber-400 text-sm">
                      ${winner.prizeAmount.toLocaleString()}
                    </td>

                    <td className="px-5 py-4">
                      {winner.verificationStatus === 'approved' ? (
                        <span className="inline-flex items-center space-x-1 text-emerald-400 font-bold text-[10px]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> APPROVED
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-amber-400 font-bold text-[10px]">
                          <AlertCircle className="w-3.5 h-3.5" /> {winner.verificationStatus.toUpperCase()}
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      {winner.paymentStatus === 'paid' ? (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>PAID</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                          <Clock className="w-3 h-3" />
                          <span>PAYMENT PENDING</span>
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 font-mono text-slate-400">
                      {(winner as any).transactionId || 'Unprocessed'}
                    </td>

                    <td className="px-5 py-4 text-right">
                      {winner.paymentStatus === 'paid' ? (
                        <span className="text-[11px] text-slate-500 font-mono font-bold">DISBURSED</span>
                      ) : (
                        <button
                          disabled={winner.verificationStatus !== 'approved'}
                          onClick={() => openPayoutModal(winner)}
                          className={`px-3 py-1.5 rounded text-[11px] font-bold flex items-center space-x-1 ml-auto transition-all ${
                            winner.verificationStatus === 'approved'
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                          }`}
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Process Payout</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mandatory Transaction ID Entry Modal */}
      {selectedWinnerForPayout && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-6 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Execute Winner Payout</h3>
                  <p className="text-xs text-slate-400">Golfer: <strong className="text-white">{selectedWinnerForPayout.userName}</strong></p>
                </div>
              </div>
              <button
                onClick={() => setSelectedWinnerForPayout(null)}
                className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmPayout} className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Match Type:</span>
                  <span className="font-bold text-white uppercase">{selectedWinnerForPayout.matchType} Prize</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Prize Amount:</span>
                  <span className="font-black text-emerald-400 text-base">${selectedWinnerForPayout.prizeAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Draw Cycle:</span>
                  <span className="font-mono text-slate-300">{selectedWinnerForPayout.drawId}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-amber-400 font-bold mb-1">
                  MANDATORY REFERENCE / TRANSACTION ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TX-REF-994821 or WIRE-2026-0399"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-amber-500/50 rounded-lg text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-amber-400"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Required for banking audit trail compliance before funds release sign-off.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedWinnerForPayout(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black rounded-lg text-xs shadow-lg shadow-amber-500/20"
                >
                  Confirm & Mark Paid
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
