'use client';

interface AiSubmitButtonProps {
  isLoading: boolean;
  disabled?: boolean;
  label?: string;
}

export function AiSubmitButton({
  isLoading,
  disabled = false,
  label = 'Submit for AI Triage',
}: AiSubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled || isLoading}
      className="relative w-full group overflow-hidden rounded-xl font-semibold text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
      style={{
        padding: '0.875rem 1.5rem',
        backgroundColor: isLoading ? '#4338CA' : '#4F46E5',
        focusRingColor: '#818CF8',
        focusRingOffsetColor: '#0F172A',
        opacity: disabled && !isLoading ? 0.5 : 1,
        cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
      }}
      aria-busy={isLoading}
      aria-label={isLoading ? 'AI triage in progress' : label}
    >
      {/* Shimmer on hover */}
      <span
        className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
        }}
        aria-hidden="true"
      />

      {isLoading ? (
        <span className="flex items-center justify-center gap-3">
          {/* Groq-style processing dots */}
          <span className="flex gap-1" aria-hidden="true">
            {[0, 1, 2].map(i => (
              <span
                key={i}
                className="ai-thinking-dot"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.9)' }}>Triaging with AI...</span>
          <span
            className="text-xs font-mono hidden sm:inline"
            style={{ color: '#A5B4FC' }}
          >
            Groq LPU
          </span>
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          {label}
        </span>
      )}
    </button>
  );
}
