'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getCurrentUser,
  getCharities,
  getCharityById,
  getUserGolfScores,
  getDraws,
  getWinners,
  updateUser,
} from '@/lib/storage';
import { User, Charity, Draw, Winner, GolfScore } from '@/types';
import ScoreManager from '@/components/scores/ScoreManager';
import WinnerProofModal from '@/components/winners/WinnerProofModal';
import SubscriptionModal from '@/components/subscription/SubscriptionModal';
import AuthModal from '@/components/auth/AuthModal';
import { ScoreChart } from '@/components/common/Chart';
import DrawCountdown from '@/components/common/Countdown';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import {
  Trophy,
  Heart,
  Calendar,
  ShieldCheck,
  Upload,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  Edit3,
  Flame,
  ArrowRight,
  Target,
  DollarSign,
  Users,
  LogIn,
  Check,
  Plus,
  Compass,
  Award,
  Circle,
  RefreshCw,
  Crown,
} from 'lucide-react';

export default function DashboardPage() {
  const { t } = useLanguage();
  const { user: authUser, isLoading, refreshUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [charity, setCharity] = useState<Charity | null>(null);
  const [charities, setCharities] = useState<Charity[]>([]);
  const [scores, setScores] = useState<GolfScore[]>([]);
  const [draws, setDraws] = useState<Draw[]>([]);
  const [userWinners, setUserWinners] = useState<Winner[]>([]);

  // Modals
  const [selectedWinnerForProof, setSelectedWinnerForProof] = useState<Winner | null>(null);
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Charity pledge editing
  const [editingPledge, setEditingPledge] = useState(false);
  const [pledgePct, setPledgePct] = useState(15);
  const [selectedCharityId, setSelectedCharityId] = useState('');

  const loadData = async () => {
    const currentUser = authUser || getCurrentUser();
    if (authUser) {
      updateUser(authUser);
    }
    setUser(currentUser);
    const allCharities = getCharities();
    setCharities(allCharities);

    if (currentUser) {
      const c = getCharityById(currentUser.charityId || 'charity-1');
      setCharity(c || allCharities[0] || null);
      setPledgePct(currentUser.charityContributionPct || 15);
      setSelectedCharityId(currentUser.charityId || allCharities[0]?.id || '');

      try {
        const url = `/api/scores?userId=${encodeURIComponent(currentUser.id)}`;
        const res = await fetch(url, { cache: 'no-store' });
        const data = await res.json();
        if (data.success && Array.isArray(data.scores) && data.scores.length > 0) {
          setScores(data.scores);
        } else {
          setScores(getUserGolfScores(currentUser.id));
        }
      } catch {
        setScores(getUserGolfScores(currentUser.id));
      }

      const allWinners = getWinners();
      const myWinners = allWinners.filter((w) => w.userId === currentUser.id);
      setUserWinners(myWinners);
    }

    setDraws(getDraws());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('dh-storage-update', loadData);
    window.addEventListener('dh-language-change', loadData);
    return () => {
      window.removeEventListener('dh-storage-update', loadData);
      window.removeEventListener('dh-language-change', loadData);
    };
  }, [authUser]);

  const handleSavePledge = async () => {
    if (!user) return;
    const newPct = Math.max(10, pledgePct);
    try {
      const res = await fetch('/api/user/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          subscriptionStatus: user.subscriptionStatus,
          billingCycle: user.billingCycle,
          charityId: selectedCharityId,
          charityContributionPct: newPct,
        }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        updateUser(data.user);
        setUser(data.user);
        await refreshUser();
      }
    } catch {
      const updated: User = {
        ...user,
        charityId: selectedCharityId,
        charityContributionPct: newPct,
      };
      updateUser(updated);
      setUser(updated);
    }
    setEditingPledge(false);
  };

  // Session restore loading state
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 flex flex-col items-center justify-center min-h-[65vh]">
        <div className="w-12 h-12 border-4 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin mb-4" />
        <p className="text-slate-400 text-xs font-semibold tracking-widest uppercase">Loading Command Center...</p>
      </div>
    );
  }

  // Unauthenticated Welcome State
  if (!user) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 space-y-12 min-h-screen text-slate-100">
        <div className="glass-panel p-8 sm:p-14 rounded-3xl border border-[#D4AF37]/30 text-center space-y-6 relative overflow-hidden bg-gradient-to-br from-[#0c1017] via-[#05070A] to-[#0a0d14]">
          <div className="w-16 h-16 rounded-2xl btn-gold-primary text-slate-950 flex items-center justify-center mx-auto shadow-2xl font-serif text-3xl font-bold">
            §
          </div>

          <h1 className="text-4xl sm:text-6xl font-serif font-bold text-white tracking-tight">
            Golfer Command Center
          </h1>

          <p className="text-sm sm:text-base text-slate-300 font-light max-w-2xl mx-auto leading-relaxed">
            Log your rolling 5 Stableford golf scores, enter monthly championship jackpot draws, and automatically support verified partner charities.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => setAuthModalOpen(true)}
              className="w-full sm:w-auto px-8 py-3.5 btn-gold-primary text-slate-950 font-bold rounded-xl text-xs transition shadow-xl flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4 text-slate-950" />
              <span>Sign In to Account</span>
            </button>

            <button
              onClick={() => setSubModalOpen(true)}
              className="w-full sm:w-auto px-8 py-3.5 bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold rounded-xl text-xs transition flex items-center justify-center gap-2"
            >
              <Crown className="w-4 h-4 text-[#D4AF37]" />
              <span>Subscribe & Start Playing</span>
            </button>
          </div>
        </div>

        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          initialMode="login"
          onNeedSubscribe={() => setSubModalOpen(true)}
        />

        <SubscriptionModal
          isOpen={subModalOpen}
          onClose={() => setSubModalOpen(false)}
          onSuccess={loadData}
        />
      </div>
    );
  }

  const isRestricted = user.subscriptionStatus !== 'active';
  const upcomingDraw = draws.find((d) => d.status === 'scheduled') || draws[0];
  const totalWon = userWinners.reduce((sum, w) => sum + w.prizeAmount, 0);

  return (
    <div className="min-h-screen py-10 text-slate-100 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-9">
        
        {/* 1. PREMIUM DASHBOARD HEADER / HERO BANNER */}
        <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-[#D4AF37]/30 relative overflow-hidden bg-gradient-to-r from-[#0d121c] via-[#05070A] to-[#0a0e16]">
          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#121824] border border-[#D4AF37]/30 text-[#F5E6AB] text-xs font-semibold uppercase tracking-wider">
                <Crown className="w-3.5 h-3.5 text-[#D4AF37]" />
                VERIFIED GOLFER MEMBER
              </div>

              <div className="space-y-1">
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest block">WELCOME BACK</span>
                <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight">
                  {user.name}
                </h1>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-300 font-light flex-wrap">
                <span className="flex items-center gap-1.5 text-[#F5E6AB]">
                  <Compass className="w-4 h-4 text-[#D4AF37]" /> {user.homeClub || 'Royal Melbourne Golf Club'}
                </span>
                <span className="text-white/20">·</span>
                <span className="text-slate-300 font-mono">Handicap: {user.handicap || 14.5}</span>
                <span className="text-white/20">·</span>
                <span className="text-slate-400">{user.email}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 self-start lg:self-center">
              <button
                onClick={() => setSubModalOpen(true)}
                className="px-6 py-3.5 btn-gold-primary text-slate-950 font-bold rounded-2xl text-xs transition shadow-xl flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Manage Plan Tier</span>
              </button>
            </div>
          </div>
        </div>

        {/* 5-CARD PRESTIGE 4K GOLF GALLERY SHOWCASE (BELOW WELCOME BANNER) */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">
                EXCLUSIVELY AFFILIATED ESTATES
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
                World-Class Fairways & Championship Venues
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Card 1: Lynwood Castle & Estates */}
            <div className="relative rounded-3xl overflow-hidden border border-[#D4AF37]/30 bg-[#05070A]/80 shadow-2xl group flex flex-col justify-end h-72 sm:h-80">
              <img
                src="/images/golf_bg_1.jpg"
                alt="Lynwood Castle & Panoramic Estate"
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-110 transition duration-700 ease-out brightness-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#05070A] via-[#05070A]/40 to-transparent" />
              <div className="relative p-4 space-y-1">
                <span className="px-2.5 py-0.5 rounded-full bg-[#05070A]/80 border border-[#D4AF37]/40 text-[#F5E6AB] text-[9px] font-bold uppercase tracking-widest inline-block backdrop-blur-md">
                  CHAMPIONSHIP ESTATE
                </span>
                <h3 className="text-base font-serif font-bold text-white leading-tight">Lynwood Castle & Estates</h3>
                <p className="text-[10px] text-slate-300 font-light line-clamp-2">
                  Panoramic sunset vistas over championship lakes and 18-hole tournament courses.
                </p>
              </div>
            </div>

            {/* Card 2: The Golfer's Sanctuary */}
            <div className="relative rounded-3xl overflow-hidden border border-[#D4AF37]/30 bg-[#05070A]/80 shadow-2xl group flex flex-col justify-end h-72 sm:h-80">
              <img
                src="/images/golf_bg_2.jpg"
                alt="Royal Melbourne Championship Equipment"
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-110 transition duration-700 ease-out brightness-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#05070A] via-[#05070A]/40 to-transparent" />
              <div className="relative p-4 space-y-1">
                <span className="px-2.5 py-0.5 rounded-full bg-[#05070A]/80 border border-[#D4AF37]/40 text-[#F5E6AB] text-[9px] font-bold uppercase tracking-widest inline-block backdrop-blur-md">
                  EQUIPMENT & PRECISION
                </span>
                <h3 className="text-base font-serif font-bold text-white leading-tight">The Golfer's Sanctuary</h3>
                <p className="text-[10px] text-slate-300 font-light line-clamp-2">
                  Attested Stableford scorecards backed by official handicap verification.
                </p>
              </div>
            </div>

            {/* Card 3: Augusta Waters & Resort */}
            <div className="relative rounded-3xl overflow-hidden border border-[#D4AF37]/30 bg-[#05070A]/80 shadow-2xl group flex flex-col justify-end h-72 sm:h-80">
              <img
                src="/images/golf_bg_3.jpg"
                alt="Palm Resort & Club House"
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-110 transition duration-700 ease-out brightness-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#05070A] via-[#05070A]/40 to-transparent" />
              <div className="relative p-4 space-y-1">
                <span className="px-2.5 py-0.5 rounded-full bg-[#05070A]/80 border border-[#D4AF37]/40 text-[#F5E6AB] text-[9px] font-bold uppercase tracking-widest inline-block backdrop-blur-md">
                  EXCLUSIVE RESORT
                </span>
                <h3 className="text-base font-serif font-bold text-white leading-tight">Augusta Waters & Resort</h3>
                <p className="text-[10px] text-slate-300 font-light line-clamp-2">
                  Private clubhouse access, priority event invitations, and monthly jackpot eligibility.
                </p>
              </div>
            </div>

            {/* Card 4: Pine Valley Fairways */}
            <div className="relative rounded-3xl overflow-hidden border border-[#D4AF37]/30 bg-[#05070A]/80 shadow-2xl group flex flex-col justify-end h-72 sm:h-80">
              <img
                src="/images/golf_bg_4.jpg"
                alt="Pine Valley Fairway"
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-110 transition duration-700 ease-out brightness-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#05070A] via-[#05070A]/40 to-transparent" />
              <div className="relative p-4 space-y-1">
                <span className="px-2.5 py-0.5 rounded-full bg-[#05070A]/80 border border-[#D4AF37]/40 text-[#F5E6AB] text-[9px] font-bold uppercase tracking-widest inline-block backdrop-blur-md">
                  HERITAGE COURSE
                </span>
                <h3 className="text-base font-serif font-bold text-white leading-tight">Pine Valley Fairways</h3>
                <p className="text-[10px] text-slate-300 font-light line-clamp-2">
                  Evergreen forest terrain where precision golf meets peaceful private surroundings.
                </p>
              </div>
            </div>

            {/* Card 5: Par & Co Golf Club */}
            <div className="relative rounded-3xl overflow-hidden border border-[#D4AF37]/30 bg-[#05070A]/80 shadow-2xl group flex flex-col justify-end h-72 sm:h-80">
              <img
                src="/images/golf_bg_5.jpg"
                alt="Par & Co Golf Club Flag"
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-110 transition duration-700 ease-out brightness-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#05070A] via-[#05070A]/40 to-transparent" />
              <div className="relative p-4 space-y-1">
                <span className="px-2.5 py-0.5 rounded-full bg-[#05070A]/80 border border-[#D4AF37]/40 text-[#F5E6AB] text-[9px] font-bold uppercase tracking-widest inline-block backdrop-blur-md">
                  CLUBHOUSE GREEN
                </span>
                <h3 className="text-base font-serif font-bold text-white leading-tight">Par & Co Golf Club</h3>
                <p className="text-[10px] text-slate-300 font-light line-clamp-2">
                  Championship greens designed to elevate every moment on the fairway.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 2. DASHBOARD STATISTICS SYSTEM (4 MAIN KPI MODULES) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Module 1: Membership Status */}
          <div className="glass-panel p-5 rounded-2xl border border-[#D4AF37]/20 space-y-2">
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <span>MEMBERSHIP STATUS</span>
              <Crown className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div className="text-2xl font-serif font-bold text-[#F5E6AB] uppercase flex items-center gap-2">
              {user.subscriptionStatus}
            </div>
            <div className="text-[11px] text-slate-400 font-light">
              Tier: <strong className="text-white font-mono">{user.billingCycle || 'Monthly'}</strong>
            </div>
          </div>

          {/* Module 2: Charity Impact */}
          <div className="glass-panel p-5 rounded-2xl border border-[#D4AF37]/20 space-y-2">
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <span>CHARITY PLEDGE</span>
              <Heart className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div className="text-2xl font-serif font-bold text-white">
              {user.charityContributionPct || 15}% OF FEE
            </div>
            <div className="text-[11px] text-[#F5E6AB] font-light truncate">
              {charity?.name || 'Fairway for Kids'}
            </div>
          </div>

          {/* Module 3: Golf Qualification */}
          <div className="glass-panel p-5 rounded-2xl border border-[#D4AF37]/20 space-y-2">
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <span>GOLF QUALIFICATION</span>
              <Target className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div className="text-2xl font-serif font-bold text-[#F5E6AB] font-mono">
              {scores.length} / 5
            </div>
            <div className="text-[11px] text-slate-400 font-light">
              {scores.length === 5 ? '5/5 Full Entry Ready' : `${5 - scores.length} More Rounds Needed`}
            </div>
          </div>

          {/* Module 4: Prize Winnings */}
          <div className="glass-panel p-5 rounded-2xl border border-[#D4AF37]/20 space-y-2">
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <span>PRIZE WINNINGS</span>
              <Trophy className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div className="text-2xl font-serif font-bold gold-text">
              ${totalWon.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 font-light">
              {userWinners.length} Winning Tier Matches
            </div>
          </div>
        </div>

        {/* 3. NEXT DRAW & CHAMPIONSHIP PRIZE POOL SECTION */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[#D4AF37]/30 bg-gradient-to-b from-[#0f1420] to-[#05070A] space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/10 pb-6">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-[#D4AF37]" /> CURRENT CHAMPIONSHIP DRAW
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">{upcomingDraw?.name}</h2>
              <p className="text-xs text-slate-400 font-light">
                Draw Date: <strong className="text-white">{upcomingDraw?.drawDate.split('T')[0]}</strong> · Cadence: <strong className="text-[#F5E6AB]">Monthly</strong>
              </p>
            </div>

            {/* Countdown Component */}
            <DrawCountdown targetDate={upcomingDraw?.drawDate || '2026-09-30T20:00:00Z'} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-[#05070A] border border-[#D4AF37]/30 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">ESTIMATED GRAND JACKPOT</span>
              <div className="text-4xl font-serif font-bold gold-text">${upcomingDraw?.jackpotPool.toLocaleString()}</div>
              <div className="text-[11px] text-[#F5E6AB] font-mono flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-[#D4AF37]" /> +${upcomingDraw?.rolloverFromPrevious.toLocaleString()} Rollover
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#05070A] border border-white/10 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">TIER 4 (4-MATCH POOL)</span>
              <div className="text-2xl font-serif font-bold text-white">${upcomingDraw?.tier4Pool.toLocaleString()}</div>
              <div className="text-[11px] text-slate-400 font-light">Split among 4-match scorecards</div>
            </div>

            <div className="p-5 rounded-2xl bg-[#05070A] border border-white/10 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">TIER 3 (3-MATCH POOL)</span>
              <div className="text-2xl font-serif font-bold text-white">${upcomingDraw?.tier3Pool.toLocaleString()}</div>
              <div className="text-[11px] text-slate-400 font-light">Split among 3-match scorecards</div>
            </div>
          </div>
        </div>

        {/* 4. QUALIFICATION / 5-SCORE PROGRESSION TRACKER */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[#D4AF37]/20 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest">QUALIFICATION TRACKER</span>
              <h3 className="text-xl font-serif font-bold text-white mt-1">5-Round Stableford Progression</h3>
            </div>

            <Link
              href="/scores"
              className="px-5 py-2.5 btn-gold-primary text-slate-950 font-bold rounded-xl text-xs transition shadow-md flex items-center gap-2 self-start sm:self-auto"
            >
              <span>LOG YOUR NEXT ROUND →</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {[0, 1, 2, 3, 4].map((idx) => {
              const score = scores[idx];
              const isFilled = !!score;
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border text-center space-y-2 transition ${
                    isFilled
                      ? 'bg-[#121824] border-[#D4AF37]/40'
                      : 'bg-[#05070A] border-white/10'
                  }`}
                >
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase">
                    <span>ROUND {idx + 1}</span>
                    {isFilled ? (
                      <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-600" />
                    )}
                  </div>

                  <div className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center font-serif font-bold text-lg ${
                    isFilled ? 'ball-matched text-[#05070A]' : 'bg-slate-900 border border-white/10 text-slate-600'
                  }`}>
                    {isFilled ? score.score : '—'}
                  </div>

                  <div className="text-[10px] font-mono text-slate-400 truncate">
                    {isFilled ? `${score.date.slice(5)} · ${score.courseName || 'Local'}` : 'Pending Entry'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5. SCORE PROGRESSION CHART */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10">
          <ScoreChart scores={scores} />
        </div>

        {/* 6. SCORE MANAGER CRUD SECTION */}
        <div className="space-y-4">
          <ScoreManager userId={user.id} onScoresChanged={loadData} />
        </div>

        {/* 7. CHARITY & MY IMPACT SECTION */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[#D4AF37]/30 space-y-6 bg-gradient-to-b from-[#0f1420] to-[#05070A]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-[#D4AF37]" /> YOUR PHILANTHROPIC PLEDGE
              </span>
              <h3 className="text-xl font-serif font-bold text-white mt-1">Your Selected Cause & Pledge</h3>
            </div>

            <button
              onClick={() => setEditingPledge(!editingPledge)}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#D4AF37]" />
              {editingPledge ? 'Cancel Adjustments' : 'Adjust Charity or Pledge %'}
            </button>
          </div>

          {editingPledge ? (
            <div className="p-5 rounded-2xl bg-[#05070A] border border-[#D4AF37]/30 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Change Charity Recipient
                </label>
                <select
                  value={selectedCharityId}
                  onChange={(e) => setSelectedCharityId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-white/15 rounded-xl text-xs text-white"
                >
                  {charities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">Pledge Percentage:</span>
                  <span className="text-[#D4AF37] font-bold font-mono">{pledgePct}% of subscription</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="50"
                  step="5"
                  value={pledgePct}
                  onChange={(e) => setPledgePct(Number(e.target.value))}
                  className="w-full accent-[#D4AF37] cursor-pointer"
                />
              </div>

              <button
                onClick={handleSavePledge}
                className="px-5 py-2.5 btn-gold-primary text-slate-950 font-bold rounded-xl text-xs transition shadow-md"
              >
                Save New Charity Settings
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="md:col-span-2 flex items-center gap-4">
                {charity?.imageUrl && (
                  <img
                    src={charity.imageUrl}
                    alt={charity.name}
                    className="w-16 h-16 rounded-2xl object-cover border border-[#D4AF37]/30 shrink-0"
                  />
                )}
                <div>
                  <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider">
                    {charity?.category}
                  </span>
                  <h4 className="text-lg font-serif font-bold text-white">{charity?.name}</h4>
                  <p className="text-xs text-slate-400 font-light line-clamp-1">{charity?.tagline}</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-black/60 border border-white/10 text-center">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Current Contribution</div>
                <div className="text-2xl font-serif font-bold gold-text mt-0.5">
                  {user.charityContributionPct || 15}%
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 font-light">of your membership fee</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <SubscriptionModal
        isOpen={subModalOpen}
        onClose={() => setSubModalOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
}
