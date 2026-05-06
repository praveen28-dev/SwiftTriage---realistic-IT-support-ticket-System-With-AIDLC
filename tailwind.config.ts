import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── Existing light-mode primary (preserved) ──────────────────────────
        primary: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },

        // ── Enterprise Dark Mode — Deep Slate base ────────────────────────────
        // Page / surface backgrounds
        'dark-base':     '#0A0F1E',  // deepest background
        'dark-surface':  '#0F172A',  // card background
        'dark-elevated': '#131C35',  // elevated card / modal
        'dark-overlay':  '#1E293B',  // borders, dividers

        // ── Indigo — brand / interactive ─────────────────────────────────────
        indigo: {
          950: '#1E1B4B',
          900: '#312E81',
          700: '#4338CA',
          600: '#4F46E5',  // primary CTA
          500: '#6366F1',  // hover
          400: '#818CF8',  // focus ring
          300: '#A5B4FC',  // subtle accent
          100: '#E0E7FF',  // badge bg
        },

        // ── Emerald — success / resolved ─────────────────────────────────────
        emerald: {
          950: '#022C22',
          600: '#059669',
          500: '#10B981',
          400: '#34D399',
          100: '#D1FAE5',
        },

        // ── Amber — warning / pending ─────────────────────────────────────────
        amber: {
          600: '#D97706',
          500: '#F59E0B',
          400: '#FCD34D',
          100: '#FEF3C7',
        },

        // ── Rose — critical / error ───────────────────────────────────────────
        rose: {
          600: '#E11D48',
          500: '#F43F5E',
          400: '#FB7185',
          100: '#FFE4E6',
        },

        // ── Cyan — AI / processing states ────────────────────────────────────
        cyan: {
          600: '#0891B2',
          500: '#06B6D4',
          400: '#22D3EE',
          100: '#CFFAFE',
        },
      },

      fontFamily: {
        sans: ['Inter', 'var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'var(--font-geist-mono)', 'monospace'],
      },

      fontSize: {
        // Fluid display scale
        'display-2xl': ['clamp(2.5rem, 5vw, 4.5rem)',   { lineHeight: '1.1',  letterSpacing: '-0.02em',  fontWeight: '800' }],
        'display-xl':  ['clamp(2rem, 4vw, 3.5rem)',     { lineHeight: '1.15', letterSpacing: '-0.02em',  fontWeight: '700' }],
        'display-lg':  ['clamp(1.75rem, 3vw, 2.5rem)',  { lineHeight: '1.2',  letterSpacing: '-0.015em', fontWeight: '700' }],
        'display-md':  ['clamp(1.5rem, 2.5vw, 2rem)',   { lineHeight: '1.25', letterSpacing: '-0.01em',  fontWeight: '600' }],
        'body-xl':     ['1.125rem', { lineHeight: '1.75' }],
        'body-lg':     ['1rem',     { lineHeight: '1.7'  }],
        'body-md':     ['0.9375rem', { lineHeight: '1.65' }],
        'body-sm':     ['0.875rem', { lineHeight: '1.6'  }],
        'label':       ['0.75rem',  { lineHeight: '1.5',  letterSpacing: '0.05em', fontWeight: '600' }],
        'code':        ['0.8125rem', { lineHeight: '1.6' }],
      },

      boxShadow: {
        'glow-indigo':  '0 0 20px rgba(99,102,241,0.3), 0 0 60px rgba(99,102,241,0.1)',
        'glow-emerald': '0 0 20px rgba(16,185,129,0.3)',
        'glow-cyan':    '0 0 20px rgba(6,182,212,0.4)',
        'card-dark':    '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',
        'card-dark-hover': '0 4px 16px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.3)',
        'modal-dark':   '0 25px 50px rgba(0,0,0,0.7)',
      },

      backgroundImage: {
        'gradient-mesh':
          'radial-gradient(at 40% 20%, rgba(99,102,241,0.15) 0px, transparent 50%), ' +
          'radial-gradient(at 80% 0%, rgba(6,182,212,0.1) 0px, transparent 50%), ' +
          'radial-gradient(at 0% 50%, rgba(16,185,129,0.08) 0px, transparent 50%)',
        'hero-glow':
          'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99,102,241,0.3), transparent)',
        'shimmer-gradient':
          'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)',
      },

      animation: {
        'pulse-slow':  'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer':     'shimmer 2s linear infinite',
        'float':       'float 6s ease-in-out infinite',
        'thinking':    'thinking 1.4s ease-in-out infinite',
        'scan':        'scan 2s ease-in-out infinite',
        'count-up':    'countUp 2s ease-out forwards',
        'fade-in-up':  'fadeInUp 0.5s ease-out forwards',
        'glow-pulse':  'glowPulse 2s ease-in-out infinite',
      },

      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        thinking: {
          '0%, 100%': { opacity: '0.3', transform: 'scale(0.8)' },
          '50%':      { opacity: '1',   transform: 'scale(1)' },
        },
        scan: {
          '0%':   { transform: 'translateY(-100%)', opacity: '0' },
          '50%':  { opacity: '1' },
          '100%': { transform: 'translateY(100%)',  opacity: '0' },
        },
        fadeInUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(99,102,241,0.3)' },
          '50%':      { boxShadow: '0 0 40px rgba(99,102,241,0.6)' },
        },
      },

      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};

export default config;
