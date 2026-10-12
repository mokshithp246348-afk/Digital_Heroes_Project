'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { addDonation, getCharities } from '@/lib/storage';
import { Charity } from '@/types';
import { X, Heart, Check, Sparkles, CreditCard, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

interface DirectDonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCharityId?: string;
}

export default function DirectDonationModal({
  isOpen,
  onClose,
  defaultCharityId,
}: DirectDonationModalProps) {
  const { user: currentUser } = useAuth();
  const charities = getCharities();

  const [charityId, setCharityId] = useState<string>(defaultCharityId || charities[0]?.id || '');
  const [selectedPreset, setSelectedPreset] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [donorName, setDonorName] = useState(currentUser?.name || '');
  const [donorEmail, setDonorEmail] = useState(currentUser?.email || '');
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);

  if (!isOpen) return null;

  const activeAmount = customAmount ? parseFloat(customAmount) || 0 : selectedPreset;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeAmount <= 0) return;

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setCompleted(true);

      addDonation(
        charityId,
        activeAmount,
        donorName || 'Anonymous Hero',
        donorEmail || 'anonymous@donor.test',
        message,
        currentUser?.id
      );

      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#e0633b', '#f59e0b', '#34d399', '#ffffff'],
        });
      } catch {
        // ignore
      }

      setTimeout(() => {
        setCompleted(false);
        onClose();
      }, 2500);
    }, 1000);
  };

  const selectedCharity = charities.find((c) => c.id === charityId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#121724] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl text-slate-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {completed ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
              <Heart className="w-8 h-8 fill-rose-500 text-rose-500 animate-pulse" />
            </div>
            <h3 className="text-2xl font-bold text-white">Thank You for Your Giving!</h3>
            <p className="text-slate-300 text-sm max-w-md mx-auto">
              Your direct donation of <span className="text-emerald-400 font-bold">${activeAmount.toFixed(2)}</span> has been recorded for <span className="text-orange-400 font-semibold">{selectedCharity?.name}</span>. 100% goes directly to their mission.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/25 text-rose-300 text-[11px] font-semibold mb-2">
                <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
                Direct Giving (§ 08.1 PRD)
              </div>
              <h2 className="text-2xl font-bold text-white">Direct Cause Donation</h2>
              <p className="text-slate-400 text-xs mt-1">
                Independent donation option, not tied to gameplay. 100% goes directly to the chosen cause.
              </p>
            </div>

            {/* Charity Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Select Charity Recipient
              </label>
              <select
                value={charityId}
                onChange={(e) => setCharityId(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-white/15 rounded-xl text-sm focus:outline-none focus:border-rose-500 text-white"
              >
                {charities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Donation Presets */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Select Donation Amount
              </label>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {[25, 50, 100, 250].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setSelectedPreset(amt);
                      setCustomAmount('');
                    }}
                    className={`py-2.5 rounded-xl text-sm font-bold border transition ${
                      selectedPreset === amt && !customAmount
                        ? 'border-rose-500 bg-rose-500/20 text-white'
                        : 'border-white/10 bg-white/5 hover:border-white/20 text-slate-300'
                    }`}
                  >
                    ${amt}
                  </button>
                ))}
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-sm text-slate-400 font-bold">$</span>
                <input
                  type="number"
                  placeholder="Or enter custom amount"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setSelectedPreset(0);
                  }}
                  className="w-full pl-8 pr-4 py-2 bg-slate-900 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-rose-500 text-white"
                />
              </div>
            </div>

            {/* Donor info */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Your Name</label>
                <input
                  type="text"
                  placeholder="e.g. Arthur Pendelton"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 bg-slate-900 border border-white/10 rounded-xl text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. arthur@example.com"
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 bg-slate-900 border border-white/10 rounded-xl text-sm text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Dedication or Encouragement Note (Optional)
              </label>
              <textarea
                placeholder="Share why you're backing this cause..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={2}
                className="w-full px-3.5 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white"
              />
            </div>

            <button
              type="submit"
              disabled={isProcessing || activeAmount <= 0}
              className="w-full py-3.5 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>Processing Gift...</>
              ) : (
                <>
                  <Heart className="w-4 h-4 fill-white" />
                  Donate ${activeAmount > 0 ? activeAmount.toFixed(2) : '0.00'} Directly
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
