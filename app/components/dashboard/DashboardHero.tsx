'use client';

import { useEffect, useRef, useState } from 'react';

// ── Animated counter ──────────────────────────────────────────────────────────

function AnimatedCounter({
  target,
  suffix = '',
  prefix = '',
  decimals = 0,
  duration = 2000,
}: {
  target: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  duration?: number;
}) {
  const [value, setValue] = useState(0);
  const hasStarted = useRef(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted.current) {
          hasStarted.current = true;
          const steps = 60;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current = Math.min(current + increment, target);
            setValue(parseFloat(current.toFixed(decimals)));
            if (current >= target) clearInterval(timer);
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration, decimals]);

  const display = decimals > 0
    ? value.toFixed(decimals)
    : value.toLocaleString();

  return (
    <span ref={ref}>
      {prefix}{display}{suffix}
    </span>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────

interface StatConfig {
  label: string;
  target: number;
  suffix: string;
  prefix?: string;
  decimals?: number;
  description: string;
  color: string;
  glowColor: string;
  icon: React.ReactNode;
}

function StatCard({ stat }: { stat: StatConfig }) {
  return (
    <div
      className="relative rounded-2xl p-6 transition-all duration-300 group"
      style={{
        backgroundColor: '#0F172A',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Glow on hover */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ boxShadow: `0 0 30px ${stat.glowColor}` }}
        aria-hidden="true"
      />

      {/* Icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
        style={{ backgroundColor: `${stat.color}18`, color: stat.color }}
        aria-hidden="true"
      >
        {stat.icon}
      </div>

      {/* Value */}
      <div
        className="text-4xl font-black mb-1 tabular-nums"
        style={{ color: stat.color, letterSpacing: '-0.02em' }}
        aria-label={`${stat.label}: ${stat.target}${stat.suffix}`}
      >
        <AnimatedCounter
          target={stat.target}
          suffix={stat.suffix}
          prefix={stat.prefix}
          decimals={stat.decimals}
        />
      </div>

      {/* Label */}
      <p className="text-sm font-semibold mb-1" style={{ color: '#F1F5F9' }}>
        {stat.label}
      </p>

      {/* Description */}
      <p className="text-xs" style={{ color: '#64748B' }}>
        {stat.description}
      </p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface DashboardHeroProps {
  userName?: string;
  timeSavedHours?: number;
  aiAccuracyPercent?: number;
  ticketsTriaged?: number;
  avgResponseMs?: number;
}

export function DashboardHero({
  userName = 'there',
  timeSavedHours = 47,
  aiAccuracyPercent = 94,
  ticketsTriaged = 312,
  avgResponseMs = 780,
}: DashboardHeroProps) {
  const stats: StatConfig[] = [
    {
      label: 'Hours Saved',
      target: timeSavedHours,
      suffix: 'h',
      description: 'vs. manual triage this month',
      color: '#10B981',
      glowColor: 'rgba(16,185,129,0.25)',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'AI Accuracy',
      target: aiAccuracyPercent,
      suffix: '%',
      description: 'correct category assignment',
      color: '#6366F1',
      glowColor: 'rgba(99,102,241,0.25)',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'Tickets Triaged',
      target: ticketsTriaged,
      suffix: '',
      description: 'zero human intervention',
      color: '#06B6D4',
      glowColor: 'rgba(6,182,212,0.25)',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      label: 'Avg Response',
      target: avgResponseMs,
      suffix: 'ms',
      description: 'Groq LPU inference speed',
      color: '#F59E0B',
      glowColor: 'rgba(245,158,11,0.25)',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
  ];

  return (
    <section aria-label="Dashboard overview">
      {/* Welcome banner */}
      <div
        className="relative rounded-2xl p-6 mb-6 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #312E81 0%, #1E1B4B 50%, #0A0F1E 100%)',
          border: '1px solid rgba(99,102,241,0.2)',
        }}
      >
        {/* Mesh background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(at 80% 20%, rgba(6,182,212,0.15) 0px, transparent 50%), ' +
              'radial-gradient(at 20% 80%, rgba(16,185,129,0.1) 0px, transparent 50%)',
          }}
          aria-hidden="true"
        />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1
              className="text-2xl sm:text-3xl font-black mb-1"
              style={{ color: '#F1F5F9', letterSpacing: '-0.02em' }}
            >
              Welcome back, {userName} 👋
            </h1>
            <p className="text-sm" style={{ color: '#94A3B8' }}>
              Your AI triage engine is active and processing tickets in real time.
            </p>
          </div>

          {/* Live indicator */}
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full self-start sm:self-auto"
            style={{
              backgroundColor: 'rgba(16,185,129,0.12)',
              border: '1px solid rgba(16,185,129,0.25)',
            }}
            role="status"
            aria-label="AI engine is live"
          >
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: '#10B981' }}
              aria-hidden="true"
            />
            <span className="text-xs font-semibold" style={{ color: '#34D399' }}>
              AI Engine Live
            </span>
          </div>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </div>
    </section>
  );
}
