'use client';

import { useState } from 'react';
import { HelpCircle, ChevronDown, Trophy, Heart, Target, ShieldCheck } from 'lucide-react';

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does Digital Heroes combine golf, subscription draws, and charity?',
      a: 'Golfer subscribers pay a monthly or yearly membership fee ($19/mo or $190/yr). 15% of membership fees directly support accredited charity initiatives (like youth sports mentorship and veterans support), while another portion funds the monthly draw prize pool.',
    },
    {
      q: 'What are the rules for submitting my 5 rolling golf scores?',
      a: 'Golfers submit official Stableford round scores (ranging from 1 to 45 points). Only 1 score per date is permitted. Your 5 most recent scores form your active rolling scorecard entry for the monthly championship draw.',
    },
    {
      q: 'How are winning numbers generated for the monthly draw?',
      a: 'Draw numbers are generated using either a cryptographically secure random number generator or an algorithmic score-frequency weighted engine based on actual golfer scores logged during the month.',
    },
    {
      q: 'What happens if no golfer hits the 5-match Jackpot?',
      a: 'If zero golfers achieve 5 matching numbers in a monthly draw, 100% of the jackpot pool rolls over to the next month’s grand jackpot, causing the prize pool to grow continuously!',
    },
    {
      q: 'How are prize payouts verified and disbursed?',
      a: 'Winners upload a screenshot or photo from an official golf handicapping app (e.g. Golf Australia / USGA handicap system). Once verified by administrators, payouts are disbursed directly via bank transfer.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3 border-b border-white/10 pb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/25 text-amber-300 text-xs font-bold uppercase tracking-wider">
          <HelpCircle className="w-4 h-4 text-amber-400" />
          KNOWLEDGE BASE & FREQUENTLY ASKED QUESTIONS
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">How Digital Heroes Works</h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          Everything you need to know about golf score logging, monthly draw mechanics, and charity contributions.
        </p>
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-4">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="glass-panel p-6 rounded-3xl border border-white/10 transition cursor-pointer hover:border-amber-500/30"
              onClick={() => setOpenIndex(isOpen ? null : idx)}
            >
              <div className="flex justify-between items-center gap-4">
                <h3 className="font-extrabold text-white text-base sm:text-lg flex items-center gap-3">
                  <span className="w-7 h-7 rounded-xl bg-orange-500/15 text-orange-400 font-black text-xs flex items-center justify-center shrink-0">
                    ?
                  </span>
                  {faq.q}
                </h3>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-amber-400' : ''}`} />
              </div>

              {isOpen && <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-4 border-t border-white/10 mt-4">{faq.a}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
