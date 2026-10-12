'use client';

import { useState, useEffect } from 'react';
import { getUsers, updateUser, addAuditLog } from '@/lib/storage';
import { User } from '@/types';
import ScoreManager from '@/components/scores/ScoreManager';
import {
  Users,
  Search,
  ShieldCheck,
  UserCheck,
  UserX,
  Edit2,
  Eye,
  Trophy,
  AlertTriangle,
  X,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

export default function AdminUsersPage() {
  const [usersList, setUsersList] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'lapsed' | 'suspended'>('all');
  const [inspectingScoresUser, setInspectingScoresUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [inspectingUserDetail, setInspectingUserDetail] = useState<User | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const loadUsers = () => {
    setUsersList(getUsers());
  };

  useEffect(() => {
    loadUsers();
    window.addEventListener('dh-storage-update', loadUsers);
    return () => window.removeEventListener('dh-storage-update', loadUsers);
  }, []);

  const handleToggleSuspend = (user: User) => {
    const isSuspended = (user as any).isSuspended || false;
    const newStatus = !isSuspended;
    const updated = { ...user, isSuspended: newStatus };
    updateUser(updated);

    addAuditLog(
      newStatus ? 'Account Suspended' : 'Account Unsuspended',
      'USER',
      user.id,
      `isSuspended: ${isSuspended}`,
      `isSuspended: ${newStatus}`
    );

    setNotification(`Account for ${user.name} has been ${newStatus ? 'SUSPENDED' : 'UNSUSPENDED'}.`);
    loadUsers();
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const oldUser = usersList.find((u) => u.id === editingUser.id);
    updateUser(editingUser);

    addAuditLog(
      'User Profile Edited',
      'USER',
      editingUser.id,
      JSON.stringify(oldUser),
      JSON.stringify(editingUser)
    );

    setEditingUser(null);
    setNotification(`Profile for ${editingUser.name} updated successfully.`);
    loadUsers();
    setTimeout(() => setNotification(null), 4000);
  };

  const filteredUsers = usersList.filter((u) => {
    const q = searchQuery.toLowerCase();
    const matchesQ =
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.homeClub && u.homeClub.toLowerCase().includes(q));

    const isSuspended = (u as any).isSuspended || false;

    if (statusFilter === 'suspended') return matchesQ && isSuspended;
    if (statusFilter === 'active') return matchesQ && u.subscriptionStatus === 'active' && !isSuspended;
    if (statusFilter === 'lapsed') return matchesQ && u.subscriptionStatus === 'lapsed' && !isSuspended;
    return matchesQ;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/25 text-amber-300 text-xs font-semibold mb-1">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            § 11.01 · Subscriber Management & Audit Control
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">User Directory</h1>
          <p className="text-xs text-slate-400">Search, filter, inspect rolling scores, and manage account eligibility states.</p>
        </div>
      </div>

      {notification && (
        <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-xs text-emerald-300 flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-bold">{notification}</span>
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, email, home club..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto self-start sm:self-auto">
          {(['all', 'active', 'lapsed', 'suspended'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold capitalize transition ${
                statusFilter === st
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* User Table */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-white/5 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-white/10">
              <tr>
                <th className="px-5 py-3.5">USER / EMAIL</th>
                <th className="px-5 py-3.5">SUBSCRIPTION</th>
                <th className="px-5 py-3.5">PLAN</th>
                <th className="px-5 py-3.5">ELIGIBILITY</th>
                <th className="px-5 py-3.5">STATUS</th>
                <th className="px-5 py-3.5">JOINED</th>
                <th className="px-5 py-3.5 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-500 text-xs">
                    No registered subscribers found matching query.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isSuspended = (u as any).isSuspended || false;
                  const isEligible = u.subscriptionStatus === 'active' && !isSuspended;

                  return (
                    <tr key={u.id} className="hover:bg-white/5 transition">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          {u.name}
                          {u.role === 'admin' && (
                            <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 text-[9px] rounded font-bold">
                              Admin
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                      </td>

                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold capitalize ${
                          u.subscriptionStatus === 'active'
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : 'bg-rose-500/15 text-rose-400'
                        }`}>
                          {u.subscriptionStatus}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 capitalize font-medium text-slate-200">
                        {u.billingCycle || 'monthly'}
                      </td>

                      <td className="px-5 py-3.5">
                        <span className={`text-[11px] font-bold flex items-center gap-1 ${
                          isEligible ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {isEligible ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                          {isEligible ? 'Draw Eligible' : 'Ineligible'}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        {isSuspended ? (
                          <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold">
                            SUSPENDED
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                            ACTIVE
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-3.5 text-slate-400 font-mono text-[11px]">
                        {u.createdAt ? u.createdAt.split('T')[0] : '2026-01-01'}
                      </td>

                      <td className="px-5 py-3.5 text-right space-x-2">
                        <button
                          onClick={() => setInspectingScoresUser(u)}
                          className="px-2.5 py-1.5 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 text-orange-300 text-[11px] font-semibold transition"
                          title="Inspect 5 Scores"
                        >
                          Scores
                        </button>

                        <button
                          onClick={() => setInspectingUserDetail(u)}
                          className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-[11px] font-semibold transition"
                          title="View Profile Details"
                        >
                          View
                        </button>

                        <button
                          onClick={() => setEditingUser(u)}
                          className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-[11px] font-semibold transition"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleToggleSuspend(u)}
                          className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition ${
                            isSuspended
                              ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                          }`}
                        >
                          {isSuspended ? 'Unsuspend' : 'Suspend'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Scores Modal */}
      {inspectingScoresUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-3xl bg-[#121724] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">
                  § 05 · Rolling 5 Scores Inspector
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">
                  {inspectingScoresUser.name}’s 5 Scores
                </h3>
              </div>
              <button
                onClick={() => setInspectingScoresUser(null)}
                className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ScoreManager userId={inspectingScoresUser.id} onScoresChanged={loadUsers} />
          </div>
        </div>
      )}

      {/* User Detail Inspection Modal */}
      {inspectingUserDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-xl bg-[#121724] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-xs text-slate-300">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                  Subscriber Profile & Audit File
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">{inspectingUserDetail.name}</h3>
                <p className="text-slate-400">{inspectingUserDetail.email}</p>
              </div>
              <button onClick={() => setInspectingUserDetail(null)} className="p-2 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                <span className="text-slate-400 text-[10px]">Subscription Status</span>
                <div className="text-sm font-bold text-emerald-400 capitalize">{inspectingUserDetail.subscriptionStatus}</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                <span className="text-slate-400 text-[10px]">Billing Plan</span>
                <div className="text-sm font-bold text-white capitalize">{inspectingUserDetail.billingCycle || 'Monthly'}</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                <span className="text-slate-400 text-[10px]">Home Club & Handicap</span>
                <div className="text-sm font-bold text-white">{inspectingUserDetail.homeClub || 'Local Links'} (Hcp: {inspectingUserDetail.handicap || 14.0})</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                <span className="text-slate-400 text-[10px]">Charity Pledge</span>
                <div className="text-sm font-bold text-amber-400">{inspectingUserDetail.charityContributionPct || 10}% of fee</div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setInspectingScoresUser(inspectingUserDetail);
                  setInspectingUserDetail(null);
                }}
                className="w-full py-2.5 bg-orange-500 text-white font-bold rounded-xl text-center"
              >
                Inspect 5 Golf Scores
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <form onSubmit={handleSaveEdit} className="w-full max-w-md bg-[#121724] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 text-xs">
            <h4 className="text-base font-bold text-white">Edit Subscriber Profile</h4>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
              <input
                type="text"
                value={editingUser.name}
                onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Email</label>
              <input
                type="email"
                value={editingUser.email}
                onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Subscription Status</label>
                <select
                  value={editingUser.subscriptionStatus}
                  onChange={(e) => setEditingUser({ ...editingUser, subscriptionStatus: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="lapsed">Lapsed</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Charity Pledge %</label>
                <input
                  type="number"
                  min={10}
                  max={50}
                  value={editingUser.charityContributionPct || 10}
                  onChange={(e) => setEditingUser({ ...editingUser, charityContributionPct: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-3">
              <button type="button" onClick={() => setEditingUser(null)} className="flex-1 py-2.5 rounded-xl bg-white/10 text-slate-300 font-semibold">
                Cancel
              </button>
              <button type="submit" className="flex-1 py-2.5 rounded-xl bg-orange-500 text-white font-bold">
                Save & Log Audit
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
