'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getCharities,
  getDraws,
  getAnalytics,
  getCurrentUser,
} from '@/lib/storage';
import { Charity, Draw, PlatformAnalytics, User, SubscriptionPlan } from '@/types';
import SubscriptionModal from '@/components/subscription/SubscriptionModal';
import DirectDonationModal from '@/components/charity/DirectDonationModal';
import AuthModal from '@/components/auth/AuthModal';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import {
  Heart,
  Trophy,
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Flame,
  CheckCircle2,
  Calendar,
  Layers,
  Award,
  Users,
  ChevronRight,
  Target,
  Sparkle,
  Crown,
  Check,
} from 'lucide-react';

const DEFAULT_ANALYTICS: PlatformAnalytics = {
  totalUsers: 2425,
  activeSubscribers: 2380,
  totalPrizePool: 80500,
  activeJackpot: 40700,
  totalCharityContributions: 124800,
  totalDrawsCompleted: 14,
  totalWinnersPaid: 42,
};

function formatMoney(amount: number | undefined | null, fallback = 'Not Available'): string {
  if (amount === undefined || amount === null || isNaN(amount)) return fallback;
  return `$${amount.toLocaleString()}`;
}

export default function HomePage() {
  const { t } = useLanguage();
  const { user: authUser } = useAuth();
  const [analytics, setAnalytics] = useState<PlatformAnalytics>(DEFAULT_ANALYTICS);
  const [charities, setCharities] = useState<Charity[]>([]);
  const [draws, setDraws] = useState<Draw[]>([]);
  const [eligiblePlans, setEligiblePlans] = useState<SubscriptionPlan[]>([]);
  const [activePlan, setActivePlan] = useState<SubscriptionPlan | null>(null);

  // Modals
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [subModalCycle, setSubModalCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [donationModalOpen, setDonationModalOpen] = useState(false);
  const [selectedDonationCharityId, setSelectedDonationCharityId] = useState<string | undefined>();

  // Calculator state
  const [calcCycle, setCalcCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [calcCharityPct, setCalcCharityPct] = useState<number>(15);

  const isSubscribed = authUser?.subscriptionStatus === 'active';

  const fetchSubscriptionStatus = async () => {
    try {
      const res = await fetch('/api/user/subscription');
      const data = await res.json();
      if (data.success) {
        setEligiblePlans(data.eligiblePlans || []);
        setActivePlan(data.currentPlan || null);
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    setAnalytics(getAnalytics());
    setCharities(getCharities());
    setDraws(getDraws());
    fetchSubscriptionStatus();

    // Smooth anchor scrolling to avoid page jumps on refresh
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.replace('#', '');
      const element = document.getElementById(hash);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
    }
  }, [authUser]);

  const spotlightCharities = charities.filter((c) => c.isSpotlight);
  const publishedDraw = draws.find((d) => d.status === 'published') || draws[0] || {
    id: 'draw-prev',
    name: 'Official Championship Draw (Prev)',
    drawDate: '2026-08-31T20:00:00Z',
    winningNumbers: [7, 14, 21, 35, 42],
    totalPrizePool: 50000,
    jackpotPool: 40700,
    tier4Pool: 16975,
    tier3Pool: 12125,
    rolloverFromPrevious: 21300,
    totalSubscribersEntered: 2380,
  };

  const upcomingDraw = draws.find((d) => d.status === 'scheduled') || draws.find((d) => d.id === 'draw-current-championship') || draws[0] || {
    id: 'draw-current-championship',
    name: 'Current Live Championship Draw',
    drawDate: '2026-09-30T20:00:00Z',
    monthYear: '2026-09',
    status: 'scheduled',
    winningNumbers: [],
    totalPrizePool: 50000,
    jackpotPool: 40700,
    tier4Pool: 16975,
    tier3Pool: 12125,
    rolloverFromPrevious: 21300,
    totalSubscribersEntered: 2380,
  };

  // Dynamic calculator calculations
  const price = calcCycle === 'monthly' ? 19 : 190;
  const charityImpact = (price * (calcCharityPct / 100)).toFixed(2);
  const prizePoolShare = (price * 0.5).toFixed(2);

  return (
    <div className="space-y-28 pb-24 relative z-10 text-slate-100">
      {/* 1. HERO SECTION */}
      <section className="relative pt-16 md:pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Glow ambient background layers */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-3/4 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative text-center max-w-4xl mx-auto space-y-7">
          {/* Champagne Gold Crest Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#121824]/80 border border-[#D4AF37]/30 text-xs font-semibold text-[#F5E6AB] backdrop-blur-md shadow-lg">
            <Crown className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="uppercase tracking-widest text-[11px] font-bold">DIGITAL HEROES · PRIVATE GOLF MEMBERSHIP</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-bold tracking-tight text-white leading-[1.08]">
            Where Precision Meets <span className="gold-text">Prestige</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300/90 leading-relaxed max-w-2xl mx-auto font-light">
            Transform your rolling 5 Stableford golf rounds into charitable momentum, high-tier monthly rewards, and elite private club membership.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            {isSubscribed ? (
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-8 py-4 btn-gold-primary font-bold rounded-2xl text-sm transition shadow-2xl flex items-center justify-center gap-2 group"
              >
                <Trophy className="w-4 h-4 text-slate-950" />
                <span>GO TO GOLFER DASHBOARD</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </Link>
            ) : (
              <button
                onClick={() => {
                  if (!authUser) setAuthModalOpen(true);
                  else setSubModalOpen(true);
                }}
                className="w-full sm:w-auto px-8 py-4 btn-gold-primary font-bold rounded-2xl text-sm transition shadow-2xl flex items-center justify-center gap-2 group"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>JOIN THE CLUB & SUBSCRIBE</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </button>
            )}

            <button
              onClick={() => setDonationModalOpen(true)}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl border border-[#D4AF37]/30 bg-[#121824]/60 hover:bg-[#121824] text-slate-200 font-semibold text-sm transition flex items-center justify-center gap-2 backdrop-blur-md"
            >
              <Heart className="w-4 h-4 text-[#D4AF37]" />
              <span>{t('btn_direct_donate')}</span>
            </button>
          </div>

          <div className="pt-3 text-xs text-slate-400 flex items-center justify-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 text-amber-200/90">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" /> {t('pledge_min')}
            </span>
            <span className="text-[#D4AF37]/40">•</span>
            <span className="flex items-center gap-1.5 text-amber-200/90">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" /> {t('logic_stableford')}
            </span>
            <span className="text-[#D4AF37]/40">•</span>
            <span className="flex items-center gap-1.5 text-amber-200/90">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" /> {t('jackpot_guarantee')}
            </span>
          </div>
        </div>

        {/* 5-CARD PRESTIGE GOLF GALLERY SHOWCASE */}
        <div className="mt-14 space-y-6">
          <div className="text-center space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#D4AF37]">
              EXCLUSIVELY AFFILIATED ESTATES
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
              World-Class Fairways & Championship Venues
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Card 1: Aerial Sunset Resort (Image 1) */}
            <div className="relative rounded-3xl overflow-hidden border border-[#D4AF37]/30 bg-[#05070A]/80 shadow-2xl group flex flex-col justify-end h-80 sm:h-96">
              <img
                src="/images/golf_bg_1.jpg"
                alt="Lynwood Castle & Panoramic Estate"
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-110 transition duration-700 ease-out brightness-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#05070A] via-[#05070A]/40 to-transparent" />
              <div className="relative p-5 space-y-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-[#05070A]/80 border border-[#D4AF37]/40 text-[#F5E6AB] text-[9px] font-bold uppercase tracking-widest inline-block backdrop-blur-md">
                  CHAMPIONSHIP ESTATE
                </span>
                <h3 className="text-lg font-serif font-bold text-white leading-tight">Lynwood Castle & Estates</h3>
                <p className="text-[11px] text-slate-300 font-light line-clamp-2">
                  Panoramic sunset vistas over championship lakes and 18-hole tournament courses.
                </p>
              </div>
            </div>

            {/* Card 2: Golf Bag & Flag Sunset (Image 2) */}
            <div className="relative rounded-3xl overflow-hidden border border-[#D4AF37]/30 bg-[#05070A]/80 shadow-2xl group flex flex-col justify-end h-80 sm:h-96">
              <img
                src="/images/golf_bg_2.jpg"
                alt="Royal Melbourne Championship Equipment"
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-110 transition duration-700 ease-out brightness-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#05070A] via-[#05070A]/40 to-transparent" />
              <div className="relative p-5 space-y-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-[#05070A]/80 border border-[#D4AF37]/40 text-[#F5E6AB] text-[9px] font-bold uppercase tracking-widest inline-block backdrop-blur-md">
                  EQUIPMENT & PRECISION
                </span>
                <h3 className="text-lg font-serif font-bold text-white leading-tight">The Golfer's Sanctuary</h3>
                <p className="text-[11px] text-slate-300 font-light line-clamp-2">
                  Attested Stableford scorecards backed by official handicap verification.
                </p>
              </div>
            </div>

            {/* Card 3: Resort Lake Sunset (Image 3) */}
            <div className="relative rounded-3xl overflow-hidden border border-[#D4AF37]/30 bg-[#05070A]/80 shadow-2xl group flex flex-col justify-end h-80 sm:h-96">
              <img
                src="/images/golf_bg_3.jpg"
                alt="Palm Resort & Club House"
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-110 transition duration-700 ease-out brightness-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#05070A] via-[#05070A]/40 to-transparent" />
              <div className="relative p-5 space-y-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-[#05070A]/80 border border-[#D4AF37]/40 text-[#F5E6AB] text-[9px] font-bold uppercase tracking-widest inline-block backdrop-blur-md">
                  EXCLUSIVE RESORT
                </span>
                <h3 className="text-lg font-serif font-bold text-white leading-tight">Augusta Waters & Resort</h3>
                <p className="text-[11px] text-slate-300 font-light line-clamp-2">
                  Private clubhouse access, priority event invitations, and monthly jackpot eligibility.
                </p>
              </div>
            </div>

            {/* Card 4: Pine Forest Course Dusk (Image 4) */}
            <div className="relative rounded-3xl overflow-hidden border border-[#D4AF37]/30 bg-[#05070A]/80 shadow-2xl group flex flex-col justify-end h-80 sm:h-96">
              <img
                src="/images/golf_bg_4.jpg"
                alt="Pine Valley Fairway"
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-110 transition duration-700 ease-out brightness-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#05070A] via-[#05070A]/40 to-transparent" />
              <div className="relative p-5 space-y-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-[#05070A]/80 border border-[#D4AF37]/40 text-[#F5E6AB] text-[9px] font-bold uppercase tracking-widest inline-block backdrop-blur-md">
                  HERITAGE COURSE
                </span>
                <h3 className="text-lg font-serif font-bold text-white leading-tight">Pine Valley Fairways</h3>
                <p className="text-[11px] text-slate-300 font-light line-clamp-2">
                  Evergreen forest terrain where precision golf meets peaceful private surroundings.
                </p>
              </div>
            </div>

            {/* Card 5: Par & Co Flag Green (Image 5) */}
            <div className="relative rounded-3xl overflow-hidden border border-[#D4AF37]/30 bg-[#05070A]/80 shadow-2xl group flex flex-col justify-end h-80 sm:h-96">
              <img
                src="/images/golf_bg_5.jpg"
                alt="Par & Co Golf Club Flag"
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-110 transition duration-700 ease-out brightness-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#05070A] via-[#05070A]/40 to-transparent" />
              <div className="relative p-5 space-y-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-[#05070A]/80 border border-[#D4AF37]/40 text-[#F5E6AB] text-[9px] font-bold uppercase tracking-widest inline-block backdrop-blur-md">
                  CLUBHOUSE GREEN
                </span>
                <h3 className="text-lg font-serif font-bold text-white leading-tight">Par & Co Golf Club</h3>
                <p className="text-[11px] text-slate-300 font-light line-clamp-2">
                  Championship greens designed to elevate every moment on the fairway.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Live Platform KPI Banner */}
        <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel p-5 rounded-2xl border border-[#D4AF37]/20">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Active Rollover Jackpot</span>
              <Flame className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div suppressHydrationWarning className="text-2xl sm:text-3xl font-serif font-bold gold-text mt-1">
              ${upcomingDraw?.jackpotPool.toLocaleString() || '40,700'}
            </div>
            <div suppressHydrationWarning className="text-[11px] text-amber-200/80 mt-1 flex items-center gap-1 font-mono">
              <TrendingUp className="w-3 h-3 text-[#D4AF37]" /> +${upcomingDraw?.rolloverFromPrevious.toLocaleString()} Rollover
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-[#D4AF37]/20">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Total Charity Donated</span>
              <Heart className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div suppressHydrationWarning className="text-2xl sm:text-3xl font-serif font-bold gold-text mt-1">
              ${analytics.totalCharityContributions.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-light">
              100% distributed to verified partners
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-[#D4AF37]/20">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Active Golfers</span>
              <Users className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div suppressHydrationWarning className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1">
              {analytics.activeSubscribers.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-light">
              Competing across global courses
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-[#D4AF37]/20">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Winners Verified & Paid</span>
              <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div suppressHydrationWarning className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1">
              {analytics.totalWinnersPaid} Golfers
            </div>
            <div className="text-[11px] text-amber-200/80 mt-1 font-light">
              Scorecards attested & audited
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS & DRAW MECHANICS */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold tracking-widest text-[#D4AF37] uppercase">
            MEMBERSHIP ARCHITECTURE
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white">
            {t('how_section_title')}
          </h2>
          <p className="text-sm text-slate-300 font-light">
            Digital Heroes turns your regular club rounds into impactful charitable funding and monthly lottery-style cash rewards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="glass-panel p-8 rounded-3xl space-y-4 relative overflow-hidden border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 transition duration-300">
            <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 flex items-center justify-center font-bold text-lg font-serif">
              01
            </div>
            <h3 className="text-xl font-serif font-bold text-white">{t('step1_title')}</h3>
            <p className="text-xs text-slate-300 font-light leading-relaxed">
              {t('step1_desc')}
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-[#D4AF37] font-semibold font-mono">
              <span>Stableford 1–45</span>
              <span>·</span>
              <span>Rolling 5 Scores</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="glass-panel p-8 rounded-3xl space-y-4 relative overflow-hidden border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 transition duration-300">
            <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 flex items-center justify-center font-bold text-lg font-serif">
              02
            </div>
            <h3 className="text-xl font-serif font-bold text-white">{t('step2_title')}</h3>
            <p className="text-xs text-slate-300 font-light leading-relaxed">
              {t('step2_desc')}
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-[#D4AF37] font-semibold font-mono">
              <span>{t('pledge_min')}</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="glass-panel p-8 rounded-3xl space-y-4 relative overflow-hidden border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 transition duration-300">
            <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 flex items-center justify-center font-bold text-lg font-serif">
              03
            </div>
            <h3 className="text-xl font-serif font-bold text-white">{t('step3_title')}</h3>
            <p className="text-xs text-slate-300 font-light leading-relaxed">
              {t('step3_desc')}
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-[#D4AF37] font-semibold font-mono">
              <span>{t('jackpot_guarantee')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE IMPACT & SUBSCRIPTION CALCULATOR */}
      <section id="calculator" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-[#D4AF37]/30 relative overflow-hidden bg-gradient-to-br from-[#0c1017] via-[#05070A] to-[#0a0d14]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left description */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <span className="text-xs font-bold tracking-widest text-[#D4AF37] uppercase">
                  IMPACT ALLOCATION ENGINE
                </span>
                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white mt-2">
                  Calculate Your Membership Contribution
                </h2>
                <p className="text-sm text-slate-300 font-light mt-2 leading-relaxed">
                  See how your subscription fee is split between charitable giving, monthly jackpot pools, and operational infrastructure.
                </p>
              </div>

              {/* Plan Switcher */}
              <div className="flex gap-3">
                <button
                  onClick={() => setCalcCycle('monthly')}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition ${
                    calcCycle === 'monthly'
                      ? 'btn-gold-primary text-slate-950 shadow-md'
                      : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  Monthly ($19/mo)
                </button>
                <button
                  onClick={() => setCalcCycle('yearly')}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    calcCycle === 'yearly'
                      ? 'btn-gold-primary text-slate-950 shadow-md'
                      : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  Annual ($190/yr)
                  <span className="px-1.5 py-0.5 rounded bg-black/30 text-[10px] font-extrabold text-[#F5E6AB]">Save 17%</span>
                </button>
              </div>

              {/* Slider for pledge */}
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">Charity Pledge:</span>
                  <span className="text-[#D4AF37] font-bold font-mono">{calcCharityPct}% of fee</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="50"
                  step="5"
                  value={calcCharityPct}
                  onChange={(e) => setCalcCharityPct(Number(e.target.value))}
                  className="w-full accent-[#D4AF37] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-light">
                  <span>10% (Baseline)</span>
                  <span>25%</span>
                  <span>50% (Heroic Pledge)</span>
                </div>
              </div>
            </div>

            {/* Right card breakdown */}
            <div className="lg:col-span-6 bg-[#05070A]/90 border border-[#D4AF37]/30 rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="flex justify-between items-end border-b border-[#D4AF37]/20 pb-4">
                <div>
                  <span className="text-xs text-slate-400 font-medium">Selected Tier Rate</span>
                  <div className="text-3xl font-serif font-bold text-white">${price}</div>
                </div>
                <span className="text-xs text-slate-400 font-medium capitalize">
                  Per {calcCycle === 'monthly' ? 'Month' : 'Year'}
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-[#D4AF37]" />
                    <span className="text-slate-300 font-light">Direct to Chosen Charity:</span>
                  </div>
                  <span className="font-bold text-[#F5E6AB] text-base font-mono">${charityImpact}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-[#D4AF37]" />
                    <span className="text-slate-300 font-light">Monthly Jackpot Pool:</span>
                  </div>
                  <span className="font-bold text-[#F5E6AB] text-base font-mono">${prizePoolShare}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-300 font-light">Verification & Operations:</span>
                  </div>
                  <span className="font-bold text-slate-300 text-base font-mono">
                    ${(price - parseFloat(charityImpact) - parseFloat(prizePoolShare)).toFixed(2)}
                  </span>
                </div>
              </div>

              {isSubscribed ? (
                <Link
                  href="/dashboard"
                  className="w-full py-3.5 btn-gold-primary text-slate-950 font-bold rounded-xl text-sm transition shadow-lg flex items-center justify-center gap-2"
                >
                  <Trophy className="w-4 h-4 text-slate-950" />
                  <span>MANAGE PLEDGE IN DASHBOARD</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <button
                  onClick={() => {
                    if (!authUser) setAuthModalOpen(true);
                    else setSubModalOpen(true);
                  }}
                  className="w-full py-3.5 btn-gold-primary text-slate-950 font-bold rounded-xl text-sm transition shadow-lg flex items-center justify-center gap-2"
                >
                  <span>LOCK IN THIS PLEDGE & JOIN</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 4. LIVE DRAWS & JACKPOT ROLLOVER SHOWCASE */}
      <section id="draws" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold tracking-widest text-[#D4AF37] uppercase">
              {t('draw_section_tag')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white mt-1">
              {t('draw_section_title')}
            </h2>
          </div>
          <div className="text-xs text-slate-400 font-light max-w-md">
            {t('draw_section_desc')}
          </div>
        </div>

        {/* Two-card display: Last Month vs Next Month */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Published Past Draw */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6 border border-[#D4AF37]/20">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {t('pub_results')}
                </span>
                <h3 className="text-xl font-serif font-bold text-white mt-0.5">{publishedDraw?.name}</h3>
                <div className="text-xs text-slate-400 mt-0.5 font-light">
                  Conducted on {publishedDraw?.drawDate.split('T')[0]} · {publishedDraw?.totalSubscribersEntered.toLocaleString()} Golfers Entered
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#F5E6AB] text-xs font-bold">
                Completed
              </span>
            </div>

            {/* Winning numbers display */}
            <div>
              <span className="text-xs text-slate-400 font-medium block mb-3">
                {t('winning_numbers')}
              </span>
              <div className="flex gap-2.5 flex-wrap">
                {publishedDraw?.winningNumbers.map((num) => (
                  <div key={num} className="ball-number ball-winning">
                    {num}
                  </div>
                ))}
              </div>
            </div>

            {/* Tier breakdown */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-xs font-mono">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="text-slate-400 text-[10px]">{t('match_5')}</div>
                <div className="text-[#F5E6AB] font-bold mt-0.5">
                  {formatMoney(publishedDraw?.jackpotPool, '$40,700')}
                </div>
                <div className="text-[10px] text-[#D4AF37] mt-1 font-semibold">{t('rolled_over')}</div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="text-slate-400 text-[10px]">{t('match_4')}</div>
                <div className="text-white font-bold mt-0.5">
                  {formatMoney(publishedDraw?.tier4Pool, '$16,975')}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Sarah J. ($5,600)</div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="text-slate-400 text-[10px]">{t('match_3')}</div>
                <div className="text-white font-bold mt-0.5">
                  {formatMoney(publishedDraw?.tier3Pool, '$12,125')}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">4 Winners ($2k ea)</div>
              </div>
            </div>
          </div>

          {/* Upcoming Scheduled Draw */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6 border border-[#D4AF37]/40 relative overflow-hidden bg-gradient-to-b from-[#0e131d] to-[#05070A]">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-[#D4AF37]" /> {t('next_draw')}
                </span>
                <h3 className="text-xl font-serif font-bold text-white mt-0.5">{upcomingDraw?.name}</h3>
                <div className="text-xs text-slate-400 mt-0.5 font-light">
                  Scheduled for {upcomingDraw?.drawDate.split('T')[0]} · Cadence: Monthly
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#F5E6AB] text-xs font-bold">
                Live Entries Open
              </span>
            </div>

            {/* Jackpot highlight */}
            <div className="p-5 rounded-2xl bg-black/60 border border-[#D4AF37]/30">
              <span className="text-xs text-[#D4AF37] font-bold uppercase tracking-wider">
                {t('total_jackpot')}
              </span>
              <div className="text-3xl sm:text-4xl font-serif font-bold gold-text mt-1">
                {formatMoney(upcomingDraw?.jackpotPool, '$40,700')}
              </div>
              <div className="text-xs text-slate-300 mt-2 font-light leading-relaxed">
                Includes {formatMoney(upcomingDraw?.rolloverFromPrevious, '$21,300')} rolled over from previous draw because no golfer matched all 5 numbers!
              </div>
            </div>

            {/* Estimated Tiers */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-slate-400 text-[10px]">{t('match_4')}</span>
                <div className="text-white font-bold mt-0.5">
                  {formatMoney(upcomingDraw?.tier4Pool, '$16,975')}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Match 4 numbers</div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-slate-400 text-[10px]">{t('match_3')}</span>
                <div className="text-white font-bold mt-0.5">
                  {formatMoney(upcomingDraw?.tier3Pool, '$12,125')}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Match 3 numbers</div>
              </div>
            </div>

            {isSubscribed ? (
              <div className="space-y-2">
                <Link
                  href="/dashboard"
                  className="w-full py-3.5 btn-gold-primary text-slate-950 font-bold rounded-xl text-sm transition shadow-lg flex items-center justify-center gap-2"
                >
                  <Trophy className="w-4 h-4 text-slate-950" />
                  <span>VIEW ACTIVE ENTRY & DASHBOARD</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <button
                onClick={() => {
                  if (!authUser) setAuthModalOpen(true);
                  else setSubModalOpen(true);
                }}
                className="w-full py-3.5 btn-gold-primary text-slate-950 font-bold rounded-xl text-sm transition shadow-lg flex items-center justify-center gap-2"
              >
                <span>{t('btn_subscribe_draw')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 5. CHARITY SPOTLIGHT & UPCOMING EVENTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold tracking-widest text-[#D4AF37] uppercase">
              {t('charity_section_tag')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white mt-1">
              {t('charity_section_title')}
            </h2>
          </div>
          <Link
            href="/charities"
            className="text-xs font-bold text-[#D4AF37] hover:underline flex items-center gap-1 self-start md:self-auto"
          >
            <span>{t('view_all_charities')}</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {spotlightCharities.map((charity, index) => {
            const bgImages = ['/images/golf_bg_2.jpg', '/images/golf_bg_3.jpg', '/images/golf_bg_4.jpg'];
            const bgImage = bgImages[index % bgImages.length];

            return (
              <div
                key={charity.id}
                className="glass-panel rounded-3xl overflow-hidden border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 transition duration-500 flex flex-col justify-between group"
              >
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={bgImage}
                    alt={charity.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#05070A] via-[#05070A]/50 to-transparent" />
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#05070A]/80 backdrop-blur-md border border-[#D4AF37]/30 text-[#F5E6AB] text-[10px] font-bold uppercase tracking-wider">
                    {charity.category}
                  </span>
                </div>

                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="text-lg font-serif font-bold text-white group-hover:text-[#D4AF37] transition">
                      {charity.name}
                    </h3>
                    <p className="text-xs text-slate-300 font-light line-clamp-2 leading-relaxed">
                      {charity.tagline}
                    </p>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-white/10">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-light">Total Funds Raised:</span>
                      <span className="font-bold text-[#F5E6AB] font-mono">
                        ${charity.totalRaised.toLocaleString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => {
                          setSelectedDonationCharityId(charity.id);
                          setDonationModalOpen(true);
                        }}
                        className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-[#D4AF37]/10 border border-white/10 hover:border-[#D4AF37]/30 text-slate-200 text-xs font-semibold transition text-center"
                      >
                        Give Direct
                      </button>

                      {isSubscribed ? (
                        <Link
                          href="/dashboard"
                          className="py-2.5 px-3 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#F5E6AB] text-xs font-bold transition text-center flex items-center justify-center gap-1"
                        >
                          Manage Pledge
                        </Link>
                      ) : (
                        <button
                          onClick={() => {
                            if (!authUser) setAuthModalOpen(true);
                            else setSubModalOpen(true);
                          }}
                          className="py-2.5 px-3 rounded-xl btn-gold-primary text-slate-950 text-xs font-bold transition text-center"
                        >
                          Pledge via Golf
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. SUBSCRIPTION PRICING PLANS */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold tracking-widest text-[#D4AF37] uppercase">
            MEMBERSHIP TIERS & ELIGIBILITY
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white">
            Transparent Access. Exclusive Privileges.
          </h2>
          <p className="text-sm text-slate-300 font-light">
            Every tier includes 5-score Stableford tracking, charity pledge allocation, and guaranteed jackpot draw entry.
          </p>
        </div>

        {/* User Active Plan Summary Banner */}
        {activePlan && (
          <div className="max-w-4xl mx-auto p-6 rounded-3xl bg-[#05070A] border border-[#D4AF37]/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] flex items-center justify-center font-bold">
                <Crown className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest">YOUR CURRENT ACTIVE MEMBERSHIP</span>
                <h4 className="text-lg font-serif font-bold text-white">{activePlan.name} (${activePlan.price}/{activePlan.interval})</h4>
                <p className="text-xs text-slate-400 font-light">This plan is active on your account. Non-owned plans are shown below.</p>
              </div>
            </div>
            <Link
              href="/dashboard"
              className="px-6 py-3 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#F5E6AB] text-xs font-bold hover:bg-[#D4AF37]/30 transition shrink-0"
            >
              Manage in Dashboard
            </Link>
          </div>
        )}

        {/* Pricing Cards Grid - Only Eligible Plans Available to Purchase */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Monthly Card */}
          {(!activePlan || ((activePlan.billingCycle || activePlan.interval) !== 'monthly' && activePlan.id !== 'plan-monthly')) ? (
            <div className="glass-panel p-8 rounded-3xl space-y-6 border border-[#D4AF37]/30 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Monthly Membership
                </span>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-serif font-bold text-white">$19</span>
                    <span className="text-xs text-slate-400">/ month</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1 font-light">Flexible month-to-month billing.</div>
                </div>

                <ul className="space-y-3 text-xs text-slate-300 font-light pt-4 border-t border-white/10">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#D4AF37]" />
                    <span>Entry into all 12 monthly draws each year</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#D4AF37]" />
                    <span>Customizable charity pledge (10% to 50%)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#D4AF37]" />
                    <span>Rolling 5-score Stableford tracking (1–45)</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => {
                  setSubModalCycle('monthly');
                  if (!authUser) setAuthModalOpen(true);
                  else setSubModalOpen(true);
                }}
                className="w-full py-3.5 rounded-2xl btn-gold-primary text-slate-950 font-bold text-sm transition shadow-lg"
              >
                Choose Monthly Plan ($19)
              </button>
            </div>
          ) : (
            <div className="glass-panel p-8 rounded-3xl space-y-4 border border-[#D4AF37]/20 opacity-60 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-[#D4AF37] uppercase">Monthly Membership</span>
                <div className="text-3xl font-serif font-bold text-white mt-2">$19 / mo</div>
                <div className="text-xs text-slate-400 mt-2 font-light">Already active on your account. Duplicate purchases are restricted.</div>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-[#F5E6AB] text-center font-bold">
                ✓ Currently Active Plan
              </div>
            </div>
          )}

          {/* Annual Card */}
          {(!activePlan || ((activePlan.billingCycle || activePlan.interval) !== 'yearly' && activePlan.id !== 'plan-yearly')) ? (
            <div className="glass-panel p-8 rounded-3xl space-y-6 border border-[#D4AF37]/50 relative overflow-hidden flex flex-col justify-between shadow-2xl bg-gradient-to-b from-[#0e131d] to-[#05070A]">
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-[#D4AF37] text-slate-950 font-extrabold text-[10px] uppercase tracking-wider">
                Most Popular · 2 Months Free
              </div>

              <div className="space-y-4">
                <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
                  Annual Membership
                </span>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-serif font-bold text-white">$190</span>
                    <span className="text-xs text-slate-400">/ year</span>
                  </div>
                  <div className="text-xs text-amber-200/90 mt-1 font-light">
                    Save 17% (Equivalent to just $15.83 / month)
                  </div>
                </div>

                <ul className="space-y-3 text-xs text-slate-300 font-light pt-4 border-t border-white/10">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#D4AF37]" />
                    <span className="font-semibold text-white">Includes 2 months free per year</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#D4AF37]" />
                    <span>Automatic rollover ticket preservation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#D4AF37]" />
                    <span>Priority scorecard verification & payout</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => {
                  setSubModalCycle('yearly');
                  if (!authUser) setAuthModalOpen(true);
                  else setSubModalOpen(true);
                }}
                className="w-full py-3.5 rounded-2xl btn-gold-primary text-slate-950 font-bold text-sm transition shadow-lg"
              >
                Get Annual Access ($190)
              </button>
            </div>
          ) : (
            <div className="glass-panel p-8 rounded-3xl space-y-4 border border-[#D4AF37]/20 opacity-60 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-[#D4AF37] uppercase">Annual Membership</span>
                <div className="text-3xl font-serif font-bold text-white mt-2">$190 / yr</div>
                <div className="text-xs text-slate-400 mt-2 font-light">Already active on your account. Duplicate purchases are restricted.</div>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-[#F5E6AB] text-center font-bold">
                ✓ Currently Active Plan
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode="login"
        requestedCycle={subModalCycle}
        onNeedSubscribe={(cycle) => {
          if (cycle) setSubModalCycle(cycle);
          setSubModalOpen(true);
        }}
      />

      <SubscriptionModal
        isOpen={subModalOpen}
        initialCycle={subModalCycle}
        onClose={() => setSubModalOpen(false)}
        onSuccess={() => {
          fetchSubscriptionStatus();
          window.location.href = '/dashboard';
        }}
      />

      <DirectDonationModal
        isOpen={donationModalOpen}
        onClose={() => {
          setDonationModalOpen(false);
          setSelectedDonationCharityId(undefined);
        }}
        defaultCharityId={selectedDonationCharityId}
      />
    </div>
  );
}
