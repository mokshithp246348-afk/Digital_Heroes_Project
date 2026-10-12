'use client';

import React from 'react';

interface ScoreChartProps {
  scores: { date: string; score: number }[];
  height?: number;
}

export function ScoreChart({ scores, height = 160 }: ScoreChartProps) {
  if (!scores || scores.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center text-xs text-slate-500 italic">
        No score trends available yet. Log rounds to render your score progression chart.
      </div>
    );
  }

  // Reverse so chronological order left to right
  const sorted = [...scores].reverse();
  const maxScore = 45;
  const minScore = 0;

  const points = sorted.map((s, idx) => {
    const x = (idx / Math.max(sorted.length - 1, 1)) * 100;
    const y = 100 - (s.score / maxScore) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold uppercase">
        <span>Stableford Progression (1–45)</span>
        <span>Rolling {sorted.length} Rounds</span>
      </div>

      <div className="w-full bg-slate-950/60 p-4 rounded-2xl border border-white/10 relative">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-32 overflow-visible">
          {/* Grid lines */}
          <line x1="0" y1="25" x2="100" y2="25" stroke="rgba(255,255,255,0.05)" strokeDasharray="2" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.05)" strokeDasharray="2" />
          <line x1="0" y1="75" x2="100" y2="75" stroke="rgba(255,255,255,0.05)" strokeDasharray="2" />

          {/* Line Path */}
          <polyline
            fill="none"
            stroke="#f97316"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />

          {/* Dots */}
          {sorted.map((s, idx) => {
            const x = (idx / Math.max(sorted.length - 1, 1)) * 100;
            const y = 100 - (s.score / maxScore) * 100;
            return (
              <g key={idx}>
                <circle cx={x} cy={y} r="3" fill="#fbbf24" stroke="#090d15" strokeWidth="1.5" />
              </g>
            );
          })}
        </svg>

        <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono mt-2 pt-2 border-t border-white/5">
          {sorted.map((s, idx) => (
            <span key={idx} className="truncate max-w-[50px]">{s.date.substring(5)}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
