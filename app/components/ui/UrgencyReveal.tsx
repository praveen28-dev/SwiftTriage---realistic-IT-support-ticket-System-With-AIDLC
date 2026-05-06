'use client';

import { useEffect, useState } from 'react';

interface UrgencyRevealProps {
  score: number;       // 0–10
  category: string;
  summary: string;
}

function getScoreColor(score: number): string {
  if (score >= 8) return '#F43F5E';
  if (score >= 5) return '#F59E0B';
  return '#10B981';
}

function getScoreLabel(score: number): string {
  if (score >= 8) return 'Critical';
  if (score >= 5) return 'High';
  return 'Normal';
}

export function UrgencyReveal({ score, category, summary }: UrgencyRevealProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setIsRevealed(true), 300);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!isRevealed) return;
    let current = 0;
    const increment = score / 20;
    const timer = setInterval(() => {
      current = Math.min(current + increment, score);
      setDisplayScore(Math.round(current * 10) / 10);
      if (current >= score) clearInterval(timer);
    }, 50);
    return () => clearInterval(timer);
  }, [isRevealed, score]);

  const color = getScoreColor(score);
  const label = getScoreLabel(score);
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (displayScore / 10) * circumference;

  return (
    <div
      className="transition-all duration-500"
      style={{
        opacity: isRevealed ? 1 : 0,
        transform: isRevealed ? 'translateY(0)' : 'translateY(16px)',
      }}
      role="status"
      aria-label={`Urgency score: ${score} out of 10, ${label} priority`}
    >
      <div
        className="rounded-2xl p-6 flex items-center gap-6"
        style={{
          backgroundColor: '#0F172A',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {/* Circular progress ring */}
        <div className="relative flex-shrink-0" aria-hidden="true">
          <svg width="88" height="88" viewBox="0 0 88 88" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="44" cy="44" r={radius} fill="none" stroke="#1E293B" strokeWidth="6" />
            <circle
              cx="44" cy="44" r={radius}
              fill="none"
              stroke={color}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: 'stroke-dashoffset 0.05s linear' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-black" style={{ color }}>{displayScore}</span>
            <span className="text-xs" style={{ color: '#475569' }}>/10</span>
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${color}20`, color }}
            >
              {label} Priority
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: '#94A3B8' }}
            >
              {category}
            </span>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: '#CBD5E1' }}>
            {summary}
          </p>
          <p className="text-xs mt-2 flex items-center gap-1.5" style={{ color: '#475569' }}>
            <span
              className="w-1.5 h-1.5 rounded-full inline-block"
              style={{ backgroundColor: '#22D3EE' }}
              aria-hidden="true"
            />
            AI-generated in ~800ms via Groq LPU
          </p>
        </div>
      </div>
    </div>
  );
}
