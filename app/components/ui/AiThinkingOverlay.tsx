'use client';

import { useEffect, useState } from 'react';

const THINKING_STEPS = [
  { label: 'Reading ticket content',      duration: 600 },
  { label: 'Classifying category',        duration: 700 },
  { label: 'Calculating urgency score',   duration: 800 },
  { label: 'Generating AI summary',       duration: 900 },
  { label: 'Routing to queue',            duration: 400 },
];

interface AiThinkingOverlayProps {
  isVisible: boolean;
}

export function AiThinkingOverlay({ isVisible }: AiThinkingOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    if (!isVisible) {
      setCurrentStep(0);
      setCompletedSteps([]);
      return;
    }

    let stepIndex = 0;
    let timer: ReturnType<typeof setTimeout>;

    const advance = () => {
      if (stepIndex >= THINKING_STEPS.length) return;
      setCurrentStep(stepIndex);
      timer = setTimeout(() => {
        setCompletedSteps(prev => [...prev, stepIndex]);
        stepIndex++;
        advance();
      }, THINKING_STEPS[stepIndex].duration);
    };

    advance();
    return () => clearTimeout(timer);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(10,15,30,0.85)', backdropFilter: 'blur(8px)' }}
      role="dialog"
      aria-modal="true"
      aria-label="AI triage in progress"
    >
      <div
        className="w-full max-w-md mx-4 rounded-2xl p-8"
        style={{
          backgroundColor: '#0F172A',
          border: '1px solid rgba(99,102,241,0.2)',
          boxShadow: '0 25px 50px rgba(0,0,0,0.7)',
        }}
      >
        {/* Animated brain icon */}
        <div className="flex justify-center mb-6">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full animate-ping"
              style={{ backgroundColor: 'rgba(99,102,241,0.2)' }} />
            <div className="absolute inset-2 rounded-full animate-pulse"
              style={{ backgroundColor: 'rgba(99,102,241,0.3)' }} />
            <div className="absolute inset-4 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#4F46E5' }}>
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>

        <h3 className="text-center font-semibold text-lg mb-1" style={{ color: '#F1F5F9' }}>
          AI Triage in Progress
        </h3>
        <p className="text-center text-sm mb-6" style={{ color: '#64748B' }}>
          Llama 3 is analyzing your ticket
        </p>

        {/* Step list */}
        <div className="space-y-3">
          {THINKING_STEPS.map((step, i) => {
            const isDone = completedSteps.includes(i);
            const isActive = currentStep === i && !isDone;
            const isPending = i > currentStep && !isDone;

            return (
              <div
                key={i}
                className="flex items-center gap-3 transition-all duration-300"
                style={{ opacity: isPending ? 0.3 : 1 }}
              >
                {/* Step indicator */}
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300"
                  style={{
                    backgroundColor: isDone ? '#10B981' : isActive ? '#4F46E5' : '#1E293B',
                  }}
                >
                  {isDone ? (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: isActive ? 'white' : '#475569' }}
                    />
                  )}
                </div>

                {/* Label */}
                <span
                  className="text-sm flex-1"
                  style={{
                    color: isDone ? '#34D399' : isActive ? '#A5B4FC' : '#64748B',
                  }}
                >
                  {step.label}
                  {isDone && '...'}
                  {isActive && '...'}
                </span>

                {/* Active dots */}
                {isActive && (
                  <div className="flex gap-1" aria-hidden="true">
                    {[0, 1, 2].map(dot => (
                      <div
                        key={dot}
                        className="ai-thinking-dot"
                        style={{ animationDelay: `${dot * 0.15}s` }}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div
          className="mt-6 pt-4 flex items-center justify-between text-xs"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)', color: '#475569' }}
        >
          <span>Powered by Groq LPU</span>
          <span className="font-mono" style={{ color: '#22D3EE' }}>~800ms</span>
        </div>
      </div>
    </div>
  );
}
