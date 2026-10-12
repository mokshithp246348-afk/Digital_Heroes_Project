'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  User as UserIcon,
  ShieldCheck,
  Mail,
  Key,
  Award,
  CheckCircle2,
  AlertCircle,
  Save,
  Lock,
} from 'lucide-react';

export default function UserProfilePage() {
  const { user, refreshUser } = useAuth();
  const [nameInput, setNameInput] = useState(user?.name || '');
  const [handicapInput, setHandicapInput] = useState(user?.handicap?.toString() || '15.0');
  const [clubInput, setClubInput] = useState(user?.homeClub || 'City Links Club');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/user/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          email: user?.email,
          name: nameInput,
          handicap: parseFloat(handicapInput) || 15.0,
          homeClub: clubInput,
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (data.user) {
          const { updateUser } = await import('@/lib/storage');
          updateUser(data.user);
        }
        await refreshUser();
        setMessage('Profile updated successfully!');
      } else {
        setMessage('Failed to update profile.');
      }
    } catch {
      setMessage('Error updating profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="border-b border-white/10 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/25 text-amber-300 text-xs font-semibold mb-2">
          <UserIcon className="w-3.5 h-3.5 text-amber-400" />
          ACCOUNT & GOLFER PROFILE SETTINGS
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Profile & Security</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Update your golfer details, home handicap club, and account notification preferences.
        </p>
      </div>

      {message && (
        <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{message}</span>
        </div>
      )}

      {/* Profile Form */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
        <h3 className="text-base font-bold text-white uppercase tracking-wider text-xs">
          01 · PERSONAL & GOLF INFORMATION
        </h3>

        <form onSubmit={handleSaveProfile} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5 uppercase tracking-wider">Full Name</label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-950 border border-white/15 rounded-xl text-white focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5 uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-slate-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5 uppercase tracking-wider">Official Handicap Index</label>
              <input
                type="number"
                step="0.1"
                value={handicapInput}
                onChange={(e) => setHandicapInput(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-white/15 rounded-xl text-white focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5 uppercase tracking-wider">Home Golf Club</label>
              <input
                type="text"
                value={clubInput}
                onChange={(e) => setClubInput(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-white/15 rounded-xl text-white focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs rounded-xl transition shadow-lg shadow-orange-500/20 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* SECURITY PANEL */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
        <h3 className="text-base font-bold text-white uppercase tracking-wider text-xs flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-400" />
          02 · ACCOUNT SECURITY & PASSWORD
        </h3>

        <p className="text-xs text-slate-400">
          Your account is secured with HS256 JWT tokens and encrypted password hashing. Password change requests can be triggered via password reset.
        </p>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-white">Password Authentication</span>
            <div className="text-[11px] text-slate-400">Last authenticated via encrypted session cookie</div>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 text-[10px]">
            SECURE
          </span>
        </div>
      </div>
    </div>
  );
}
