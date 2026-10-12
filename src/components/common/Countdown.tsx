'use client';

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownProps {
  targetDate: string;
}

export default function DrawCountdown({ targetDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTime = () => {
      const target = new Date(targetDate).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, target - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="space-y-3 text-center sm:text-left">
      <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest flex items-center justify-center sm:justify-start gap-1.5">
        <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
        <span>NEXT DRAW COUNTDOWN</span>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:gap-3 max-w-xs mx-auto sm:mx-0">
        <div className="p-2.5 sm:p-3 rounded-2xl bg-slate-950/80 border border-amber-500/30 text-center shadow-lg">
          <div className="text-xl sm:text-2xl font-black text-white font-mono">
            {String(timeLeft.days).padStart(2, '0')}
          </div>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">DAYS</span>
        </div>

        <div className="p-2.5 sm:p-3 rounded-2xl bg-slate-950/80 border border-amber-500/30 text-center shadow-lg">
          <div className="text-xl sm:text-2xl font-black text-white font-mono">
            {String(timeLeft.hours).padStart(2, '0')}
          </div>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">HOURS</span>
        </div>

        <div className="p-2.5 sm:p-3 rounded-2xl bg-slate-950/80 border border-amber-500/30 text-center shadow-lg">
          <div className="text-xl sm:text-2xl font-black text-white font-mono">
            {String(timeLeft.minutes).padStart(2, '0')}
          </div>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">MINS</span>
        </div>

        <div className="p-2.5 sm:p-3 rounded-2xl bg-slate-950/80 border border-amber-500/30 text-center shadow-lg">
          <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
            {String(timeLeft.seconds).padStart(2, '0')}
          </div>
          <span className="text-[9px] font-bold text-amber-400/80 uppercase tracking-wider">SECS</span>
        </div>
      </div>
    </div>
  );
}
