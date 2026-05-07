/**
 * Centralized configuration module
 * Loads and validates environment variables
 *
 * Security fix MED-04:
 * Removed hardcoded 'placeholder' fallback for NEXTAUTH_SECRET.
 * At runtime, missing secrets now throw immediately rather than silently
 * using a known string that could be used to forge JWTs.
 */

interface Config {
  database: {
    url: string;
  };
  groq: {
    apiKey: string;
    model: string;
  };
  nextAuth: {
    secret: string;
    url: string;
  };
  app: {
    pollingInterval: number;
  };
}

const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';

/**
 * Require an environment variable at runtime.
 * During build time, returns a safe non-secret placeholder so Next.js can
 * complete static analysis without real credentials.
 * At runtime, throws if the variable is absent.
 */
function requireEnv(name: string, buildTimeFallback: string): string {
  const value = process.env[name];
  if (value) return value;

  if (isBuildTime) {
    // Non-secret placeholder — only used during `next build`, never at runtime
    return buildTimeFallback;
  }

  // Hard fail at runtime — never silently use a known string for secrets
  throw new Error(
    `[config] FATAL: Required environment variable "${name}" is not set. ` +
    `Add it to your .env.local file or Vercel environment settings.`
  );
}

function loadConfig(): Config {
  return {
    database: {
      // Non-secret: safe to use a placeholder URL during build
      url: requireEnv('DATABASE_URL', 'postgresql://build-placeholder/db'),
    },
    groq: {
      // Non-secret during build — Groq is never called at build time
      apiKey: requireEnv('GROQ_API_KEY', 'build-placeholder-groq-key'),
      model: 'llama-3.3-70b-versatile',
    },
    nextAuth: {
      // MED-04 FIX: NEXTAUTH_SECRET must NEVER fall back to a known string.
      // Using a random placeholder that is clearly invalid and will cause
      // NextAuth to error loudly if it somehow reaches production.
      secret: requireEnv('NEXTAUTH_SECRET', `build-only-${Math.random()}`),
      url: requireEnv('NEXTAUTH_URL', 'http://localhost:3000'),
    },
    app: {
      pollingInterval: parseInt(process.env.POLLING_INTERVAL || '5000', 10),
    },
  };
}

export const config = loadConfig();
