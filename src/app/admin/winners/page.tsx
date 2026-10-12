'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getWinners, verifyWinner, getUsers } from '@/lib/storage';
import { Winner, WinnerVerificationStatus } from '@/types';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Search,
  Trophy,
  FileCheck,
  AlertTriangle,
  X,
  FileText,
  DollarSign,
  UserCheck,
} from 'lucide-react';

export default function AdminWinnersPage() {
  const [winnersList, setWinnersList] = useState<Winner[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [inspectingWinner, setInspectingWinner] = useState<Winner | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const loadData = () => {
    setWinnersList(getWinners());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('dh-storage-update', loadData);
    return () => window.removeEventListener('dh-storage-update', loadData);
  }, []);

  const handleVerify = (winnerId: string, status: WinnerVerificationStatus, notes?: string) => {
    const ok = verifyWinner(winnerId, status, notes || (status === 'approved' ? 'Scorecard verified against club ledger' : rejectReason));
    if (ok) {
      setActionSuccess(`Winner verification status updated to ${status.toUpperCase()}`);
      setInspectingWinner(null);
      setRejectReason('');
      loadData();
      setTimeout(() => setActionSuccess(null), 4000);
    }
  };

  const filteredWinners = winnersList.filter((w) => {
    const matchesSearch =
      w.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.drawId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.matchType.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === 'all') return matchesSearch;
    return matchesSearch && w.verificationStatus === filterStatus;
  });

  const pendingCount = winnersList.filter((w) => w.verificationStatus === 'pending').length;
  const approvedCount = winnersList.filter((w) => w.verificationStatus === 'approved').length;
  const rejectedCount = winnersList.filter((w) => w.verificationStatus === 'rejected').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-900/30 pb-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-emerald-400 font-mono tracking-widest uppercase mb-1">
            <span>Admin Control Center</span>
            <span>/</span>
            <span>Winner Verification</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" /> Winner Verification Queue
          </h1>
          <p className="text-xs text-slate-400">
            Split-screen verification module matching golfer submitted scorecards against platform draw results prior to payout release.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/admin/payouts"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-400 font-bold rounded-lg text-xs flex items-center space-x-2 transition-all"
          >
            <DollarSign className="w-4 h-4" />
            <span>Proceed to Payout Ops</span>
          </Link>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-semibold flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Counter Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-amber-500/30 rounded-xl p-4 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-amber-400 font-mono font-bold">
            <span>PENDING PROOF REVIEW</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-amber-400 mt-2">{pendingCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">Awaiting administrative scorecard sign-off</div>
        </div>

        <div className="bg-slate-900/80 border border-emerald-500/30 rounded-xl p-4 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-emerald-400 font-mono font-bold">
            <span>VERIFIED & APPROVED</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-2">{approvedCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">Scorecards authenticated and passed</div>
        </div>

        <div className="bg-slate-900/80 border border-rose-500/30 rounded-xl p-4 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-rose-400 font-mono font-bold">
            <span>REJECTED / DISQUALIFIED</span>
            <XCircle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-rose-400 mt-2">{rejectedCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">Audit failures or missing verification proof</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search winner name or draw ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                filterStatus === st
                  ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Winners Verification Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Winner Golfer</th>
                <th className="px-5 py-3.5">Draw Event</th>
                <th className="px-5 py-3.5">Tier / Match</th>
                <th className="px-5 py-3.5">Prize Amount</th>
                <th className="px-5 py-3.5">Proof File</th>
                <th className="px-5 py-3.5">Verification Status</th>
                <th className="px-5 py-3.5 text-right">Verification Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredWinners.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-500">
                    No winner records found matching active filter.
                  </td>
                </tr>
              ) : (
                filteredWinners.map((winner) => (
                  <tr key={winner.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4 font-bold text-white flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-black">
                        {winner.userName.charAt(0)}
                      </div>
                      <div>
                        <div>{winner.userName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{winner.userEmail}</div>
                      </div>
                    </td>

                    <td className="px-5 py-4 font-mono text-slate-400">{winner.drawId}</td>

                    <td className="px-5 py-4 font-black text-amber-400 text-xs uppercase">
                      {winner.matchType}
                    </td>

                    <td className="px-5 py-4 font-black text-emerald-400 text-sm">
                      ${winner.prizeAmount.toLocaleString()}
                    </td>

                    <td className="px-5 py-4">
                      {winner.proofImageUrl ? (
                        <span className="inline-flex items-center space-x-1 text-xs text-blue-400 font-mono">
                          <FileCheck className="w-3.5 h-3.5" />
                          <span>Uploaded</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-xs text-slate-500 font-mono">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Pending Upload</span>
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      {winner.verificationStatus === 'approved' ? (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>APPROVED</span>
                        </span>
                      ) : winner.verificationStatus === 'rejected' ? (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40">
                          <XCircle className="w-3 h-3" />
                          <span>REJECTED</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                          <Clock className="w-3 h-3" />
                          <span>PENDING AUDIT</span>
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setInspectingWinner(winner)}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold rounded text-[11px] border border-slate-700 flex items-center space-x-1 ml-auto transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Proof</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Split Screen Proof Modal */}
      {inspectingWinner && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/30 w-full max-w-4xl rounded-2xl p-6 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">Scorecard Verification Inspection</h3>
                  <p className="text-xs text-slate-400">Golfer: <strong className="text-white">{inspectingWinner.userName}</strong> (Winner ID: {inspectingWinner.id})</p>
                </div>
              </div>
              <button
                onClick={() => setInspectingWinner(null)}
                className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Split Screen Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Golfer Ledger Metadata */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                <h4 className="text-xs font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4" /> Official Platform Score Entry
                </h4>

                <div className="space-y-2.5 text-xs text-slate-300">
                  <div className="flex justify-between border-b border-slate-900 pb-2">
                    <span className="text-slate-500">Golfer Name:</span>
                    <span className="font-bold text-white">{inspectingWinner.userName}</span>
                  </div>

                  <div className="flex justify-between border-b border-slate-900 pb-2">
                    <span className="text-slate-500">Winner Match Tier:</span>
                    <span className="font-mono text-amber-400 font-bold uppercase">{inspectingWinner.matchType}</span>
                  </div>

                  <div className="flex justify-between border-b border-slate-900 pb-2">
                    <span className="text-slate-500">Matched Numbers:</span>
                    <span className="font-bold text-emerald-400 text-sm">
                      {inspectingWinner.matchedNumbers?.join(', ') || 'N/A'}
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-slate-900 pb-2">
                    <span className="text-slate-500">Draw Cycle:</span>
                    <span className="font-mono text-slate-300">{inspectingWinner.drawId}</span>
                  </div>

                  <div className="flex justify-between border-b border-slate-900 pb-2">
                    <span className="text-slate-500">Prize Allocation:</span>
                    <span className="font-black text-amber-400 text-sm">${inspectingWinner.prizeAmount.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Current Status:</span>
                    <span className="capitalize font-bold text-slate-200">{inspectingWinner.verificationStatus}</span>
                  </div>
                </div>

                {inspectingWinner.adminNotes && (
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-400">
                    <div className="text-[10px] text-slate-500 uppercase font-mono">Previous Inspector Notes:</div>
                    <div>{inspectingWinner.adminNotes}</div>
                  </div>
                )}
              </div>

              {/* Right Column: Uploaded Scorecard Proof */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
                <h4 className="text-xs font-mono text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-4 h-4" /> Uploaded Scorecard Proof File
                </h4>

                <div className="bg-slate-900 border border-slate-800 rounded-lg p-2 flex items-center justify-center min-h-[220px]">
                  {inspectingWinner.proofImageUrl ? (
                    <img
                      src={inspectingWinner.proofImageUrl}
                      alt="Uploaded Scorecard Proof"
                      className="max-h-56 object-contain rounded border border-slate-800 shadow-md"
                    />
                  ) : (
                    <div className="text-center space-y-2 p-6">
                      <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
                      <div className="text-xs text-slate-400 font-semibold">No Scorecard Image Attached Yet</div>
                      <div className="text-[10px] text-slate-500">
                        Golfer has not uploaded official signed physical scorecard for this draw cycle.
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-[11px] text-slate-500 font-mono text-center">
                  Uploaded: {inspectingWinner.proofUploadedAt ? new Date(inspectingWinner.proofUploadedAt).toLocaleString() : 'N/A'}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
              <div className="text-xs font-mono text-slate-400">ADMINISTRATIVE ACTION SIGN-OFF:</div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex-1 w-full">
                  <input
                    type="text"
                    placeholder="Enter audit review reason or rejection cause..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <button
                    onClick={() => handleVerify(inspectingWinner.id, 'rejected')}
                    className="flex-1 sm:flex-none px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 font-bold rounded-lg text-xs border border-rose-500/40 flex items-center justify-center space-x-1"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject Proof</span>
                  </button>

                  <button
                    onClick={() => handleVerify(inspectingWinner.id, 'approved')}
                    className="flex-1 sm:flex-none px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black rounded-lg text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-1"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve Scorecard</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
