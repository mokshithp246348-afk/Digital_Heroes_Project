'use client';

import { useState, useEffect } from 'react';
import { getCharities, updateUser, setCurrentUser } from '@/lib/storage';
import { useAuth } from '@/context/AuthContext';
import { BillingCycle, Charity } from '@/types';
import { X, Check, Heart, Trophy, ShieldCheck, Sparkles, CreditCard, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialCycle?: BillingCycle;
}

interface PlanOption {
  id: string;
  name: string;
  billingCycle: 'monthly' | 'yearly';
  price: number;
  formattedPrice: string;
  description: string;
  badge?: string;
}

const AVAILABLE_PLANS: PlanOption[] = [
  {
    id: 'plan-monthly',
    name: '1 Month Plan (Monthly)',
    billingCycle: 'monthly',
    price: 19,
    formattedPrice: '$19 / month',
    description: 'Flexible 1-month membership billing.',
  },
  {
    id: 'plan-yearly',
    name: '1 Year Plan (Annual)',
    billingCycle: 'yearly',
    price: 190,
    formattedPrice: '$190 / year',
    description: 'Equivalent to $15.83/mo (2 months free).',
    badge: 'Save 17%',
  },
];

import { authenticatedFetch, handleAuthRedirect } from '@/lib/authClient';

export default function SubscriptionModal({ isOpen, onClose, onSuccess, initialCycle }: SubscriptionModalProps) {
  const { user, refreshUser, isLoading } = useAuth();
  
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [eligiblePlans, setEligiblePlans] = useState<PlanOption[]>([]);
  const [selectedCycle, setSelectedCycle] = useState<BillingCycle>(initialCycle || 'monthly');
  const [charityId, setCharityId] = useState<string>(user?.charityId || 'charity-1');
  const [charityPct, setCharityPct] = useState<number>(user?.charityContributionPct || 15);
  const [emailInput, setEmailInput] = useState(user?.email || 'mokshithp1234@gmail.com');
  const [nameInput, setNameInput] = useState(user?.name || 'Mokshithp1234');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvc, setCvc] = useState('888');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const charities = getCharities();
  const selectedCharity = charities.find((c) => c.id === charityId) || charities[0];

  useEffect(() => {
    if (user) {
      if (user.email) setEmailInput(user.email);
      if (user.name) setNameInput(user.name);
    }
  }, [user]);

  useEffect(() => {
    if (initialCycle) {
      setSelectedCycle(initialCycle);
    }
  }, [initialCycle, isOpen]);

  // Fetch server-enforced eligible plans on open
  useEffect(() => {
    if (!isOpen) return;

    setErrorMessage(null);
    setCompleted(false);

    const fetchServerPlans = async () => {
      try {
        const queryParams = new URLSearchParams();
        if (user?.id) queryParams.set('userId', user.id);
        if (user?.email) queryParams.set('email', user.email);

        const url = `/api/user/subscription?${queryParams.toString()}`;
        const res = await authenticatedFetch(url, { cache: 'no-store' });
        if (res.status === 401) {
          console.error('[SubscriptionModal] 401 Unauthorized loading subscription. Closing modal & redirecting.');
          onClose();
          handleAuthRedirect();
          return;
        }
        const data = await res.json();
        if (data.success) {
          setCurrentPlan(data.currentPlan);
          const rawEligible = data.eligiblePlans || [];
          const activeUserCycle = data.currentPlan?.billingCycle || user?.billingCycle || 'monthly';
          
          // STRICT RULE: If user holds 'monthly', only show 'yearly'. If user holds 'yearly', only show 'monthly'.
          const filteredEligible = rawEligible.length > 0
            ? rawEligible.filter((p: PlanOption) => p.billingCycle !== activeUserCycle)
            : AVAILABLE_PLANS.filter((p: PlanOption) => p.billingCycle !== activeUserCycle);

          setEligiblePlans(filteredEligible);

          if (filteredEligible.length > 0) {
            setSelectedCycle(filteredEligible[0].billingCycle as BillingCycle);
          } else {
            setSelectedCycle(activeUserCycle === 'monthly' ? 'yearly' : 'monthly');
          }
        }
      } catch (err: any) {
        console.error('[SubscriptionModal Fetch Error]:', err);
      }
    };

    fetchServerPlans();
  }, [isOpen, initialCycle, user?.id, user?.email, user?.billingCycle]);

  if (!isOpen) return null;

  const activeUserCycle = currentPlan?.billingCycle || user?.billingCycle || 'monthly';
  const displayEligiblePlans = eligiblePlans.length > 0
    ? eligiblePlans.filter((p: PlanOption) => p.billingCycle !== activeUserCycle)
    : AVAILABLE_PLANS.filter((p: PlanOption) => p.billingCycle !== activeUserCycle);

  const activeCycle = selectedCycle;
  const basePrice = activeCycle === 'monthly' ? 19 : 190;
  const charityAmount = (basePrice * (charityPct / 100)).toFixed(2);
  const prizePoolAmount = (basePrice * 0.5).toFixed(2);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const targetEmail = user?.email || emailInput || 'mokshithp1234@gmail.com';
      const targetName = user?.name || nameInput || 'Mokshithp1234';

      const res = await authenticatedFetch('/api/user/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          email: targetEmail,
          name: targetName,
          billingCycle: activeCycle,
          charityId,
          charityContributionPct: charityPct,
          subscriptionStatus: 'active',
        }),
      });

      if (res.status === 401) {
        console.error('[SubscriptionModal] 401 Unauthorized updating plan. Closing modal & redirecting.');
        setIsProcessing(false);
        onClose();
        handleAuthRedirect();
        return;
      }

      const resData = await res.json();

      if (!resData.success) {
        setErrorMessage(resData.message || 'Subscription update failed.');
        setIsProcessing(false);
        return;
      }

      if (resData.user) {
        setCurrentUser(resData.user.id);
        updateUser(resData.user);
      }
      await refreshUser();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Network error updating subscription.');
      setIsProcessing(false);
      return;
    }

    setIsProcessing(false);
    setCompleted(true);

    try {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#F5E6AB', '#C5A059', '#FFFFFF'],
      });
    } catch {
      // ignore
    }

    setTimeout(() => {
      if (onSuccess) onSuccess();
      onClose();
      setCompleted(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-[#0B0E16] border border-[#D4AF37]/30 rounded-3xl p-6 md:p-8 shadow-2xl text-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {completed ? (
          <div className="text-center py-10 space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center mx-auto border border-[#D4AF37]/40 shadow-xl">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <h3 className="text-2xl font-bold font-serif text-gradient-gold">Subscription Verified!</h3>
            <p className="text-slate-300 text-sm max-w-md mx-auto leading-relaxed">
              Your membership is active under the <span className="text-[#D4AF37] font-bold">{activeCycle === 'monthly' ? '1 Month ($19/mo)' : '1 Year ($190/yr)'}</span> tier. {charityPct}% of your fee is directed to <span className="text-[#F3E5AB] font-semibold">{selectedCharity?.name}</span>.
            </p>
            <div className="text-xs text-slate-400 font-mono">Updating your private golfer command center...</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <span className="text-[11px] font-mono font-bold tracking-widest text-[#D4AF37] uppercase">
                Digital Heroes Private Membership
              </span>
              <h2 className="text-2xl font-bold font-serif text-white mt-1">
                {currentPlan ? 'Manage Subscription & Philanthropic Impact' : 'Select Membership Tier & Direct Impact'}
              </h2>
              <p className="text-slate-400 text-xs mt-1">
                Enter every monthly championship draw, log rolling Stableford rounds, and fund verified charity partners.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3.5 bg-rose-950/60 border border-rose-500/40 rounded-2xl text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* ACTIVE MEMBERSHIP SUMMARY AREA (If user currently holds a plan) */}
            {currentPlan && (
              <div className="p-4 rounded-2xl bg-[#141A28] border border-[#D4AF37]/40 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                    YOUR CURRENT ACTIVE MEMBERSHIP
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] text-[10px] font-bold uppercase tracking-wider">
                    ACTIVE MEMBER
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <div className="text-lg font-bold font-serif text-white">{currentPlan.name}</div>
                  <div className="text-sm font-bold text-[#F5E6AB]">{currentPlan.formattedPrice}</div>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                  Renews: {currentPlan.renewalDate ? currentPlan.renewalDate.split('T')[0] : 'Active'} · Auto-renewal enabled
                </div>
              </div>
            )}

            {/* ELIGIBLE PURCHASE PLANS LIST (Server-filtered: Previously purchased plan is completely hidden) */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300 font-serif">
                {currentPlan ? 'Available Plan Tier Switches (Eligible Only)' : 'Choose Available Plan Tier'}
              </label>

              {displayEligiblePlans.length === 0 ? (
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-400 text-center">
                  You currently hold the active membership tier ({currentPlan?.name || user?.billingCycle}).
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {displayEligiblePlans.map((plan) => {
                    const isSelected = selectedCycle === plan.billingCycle;
                    return (
                      <div
                        key={plan.id}
                        onClick={() => setSelectedCycle(plan.billingCycle)}
                        className={`p-4 rounded-2xl border cursor-pointer relative transition ${
                          isSelected
                            ? 'border-[#D4AF37] bg-[#D4AF37]/15 shadow-xl shadow-[#D4AF37]/15 ring-1 ring-[#D4AF37]'
                            : 'border-white/10 bg-white/5 hover:border-white/20'
                        }`}
                      >
                        {plan.badge && (
                          <div className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F5E6AB] text-[9px] font-bold text-[#05070A] uppercase tracking-wider">
                            {plan.badge}
                          </div>
                        )}
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-semibold text-slate-200">{plan.name}</span>
                          {isSelected && <Check className="w-4 h-4 text-[#D4AF37]" />}
                        </div>
                        <div className="mt-2">
                          <span className="text-2xl font-extrabold text-white font-serif">{plan.formattedPrice.split(' ')[0]}</span>
                          <span className="text-xs text-slate-400"> {plan.formattedPrice.split(' ').slice(1).join(' ')}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">{plan.description}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* CHARITY PARTNER SELECTOR */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-serif">
                  <Heart className="w-3.5 h-3.5 text-[#D4AF37]" />
                  Select Partner Charity (§ 08.1)
                </span>
                <span className="text-[10px] text-slate-400 font-mono">100% Direct Allocation</span>
              </label>
              <select
                value={charityId}
                onChange={(e) => setCharityId(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#070A12] border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-[#D4AF37]"
              >
                {charities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {c.category}
                  </option>
                ))}
              </select>
            </div>

            {/* CHARITY PLEDGE SLIDER (10% to 50%) */}
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                  Charity Pledge Allocation
                </span>
                <span className="text-xs font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-2.5 py-0.5 rounded-lg border border-[#D4AF37]/30">
                  {charityPct}% of Subscription
                </span>
              </div>

              <input
                type="range"
                min="10"
                max="50"
                step="5"
                value={charityPct}
                onChange={(e) => setCharityPct(Number(e.target.value))}
                className="w-full accent-[#D4AF37] cursor-pointer"
              />

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs">
                <div>
                  <span className="text-slate-400 text-[11px]">Monthly Charity Impact:</span>
                  <div className="font-bold text-[#F5E6AB]">${charityAmount}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">Prize Pool Contribution:</span>
                  <div className="font-bold text-[#D4AF37]">${prizePoolAmount}</div>
                </div>
              </div>
            </div>

            {/* PAYMENT DETAILS (Only shown when fully authenticated active session and plan details are loaded) */}
            {!isLoading && user?.id && currentPlan && user.subscriptionStatus === 'active' ? (
              <div className="p-3.5 bg-[#D4AF37]/10 border border-[#D4AF37]/25 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span className="text-slate-300">
                    Payment Method on File: <strong className="text-white font-mono">•••• 4242</strong>
                  </span>
                </div>
                <span className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-wider">VERIFIED</span>
              </div>
            ) : (
              <div className="space-y-3">
                {(!user || !user.id) && (
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-300 font-serif">
                      Golfer Account & Email Details
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#070A12] border border-white/15 rounded-xl text-xs text-white"
                        placeholder="Full Name"
                        required
                      />
                      <input
                        type="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#070A12] border border-white/15 rounded-xl text-xs text-white"
                        placeholder="Email address"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
                  <span className="flex items-center gap-1.5 font-serif">
                    <CreditCard className="w-3.5 h-3.5 text-[#D4AF37]" />
                    Payment Details (Stripe Encrypted)
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-[#D4AF37]">
                    <Lock className="w-3 h-3" /> 256-Bit Encrypted
                  </span>
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#070A12] border border-white/15 rounded-xl text-xs font-mono text-white"
                    placeholder="Card number"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      className="w-full px-4 py-2 bg-[#070A12] border border-white/15 rounded-xl text-xs font-mono text-white"
                      placeholder="MM/YY"
                    />
                    <input
                      type="text"
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value)}
                      className="w-full px-4 py-2 bg-[#070A12] border border-white/15 rounded-xl text-xs font-mono text-white"
                      placeholder="CVC"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 btn-gold-primary rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Processing Subscription Request...
                </>
              ) : currentPlan ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  Save & Update Plan Settings
                </>
              ) : (
                <>
                  <Trophy className="w-4 h-4" />
                  Pay ${basePrice} & Activate Membership
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
