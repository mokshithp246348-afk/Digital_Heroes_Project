'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Bell,
  CheckCircle2,
  Calendar,
  Sparkles,
  Trophy,
  Award,
  Heart,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      title: 'Welcome to Digital Heroes!',
      message: 'Your golfer membership and initial draw eligibility are active.',
      date: '2026-09-24',
      type: 'account',
      read: true,
    },
    {
      id: 'notif-2',
      title: 'Upcoming Monthly Championship Draw',
      message: 'Remember to log your latest 5 rolling Stableford golf scores before draw date.',
      date: '2026-09-24',
      type: 'draw',
      read: false,
    },
    {
      id: 'notif-3',
      title: 'Subscription Active & Verified',
      message: 'Your monthly pledge contribution to Fairway for Kids has been allocated.',
      date: '2026-09-24',
      type: 'subscription',
      read: false,
    },
  ]);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/25 text-orange-300 text-xs font-semibold mb-2">
            <Bell className="w-3.5 h-3.5 text-orange-400" />
            NOTIFICATION & ALERT CENTER
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Notifications</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time updates regarding your draw entries, score logs, subscription status, and charity pledges.
          </p>
        </div>

        <button
          onClick={markAllRead}
          className="px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white font-bold rounded-xl text-xs transition flex items-center gap-2 self-start sm:self-auto"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Mark All Read</span>
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`p-5 rounded-2xl border transition flex items-start gap-4 ${
              !n.read
                ? 'bg-amber-500/10 border-amber-500/30'
                : 'bg-white/5 border-white/10 text-slate-300'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center shrink-0">
              {n.type === 'draw' ? (
                <Trophy className="w-5 h-5 text-amber-400" />
              ) : n.type === 'subscription' ? (
                <Heart className="w-5 h-5 text-rose-400" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              )}
            </div>

            <div className="space-y-1 flex-1">
              <div className="flex justify-between items-start">
                <h4 className="font-extrabold text-white text-sm">{n.title}</h4>
                <span className="text-[10px] text-slate-400 font-mono">{n.date}</span>
              </div>
              <p className="text-xs text-slate-300">{n.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
