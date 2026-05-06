/**
 * Centralized configuration module
 * Loads and validates environment variables
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

/**
 * Validate required environment variables exist
 * @throws Error if any required variable is missing
 */
function validateEnv(): void {
  // Skip validation during build time (Next.js static analysis)
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return;
  }

  const requiredVars = [
    'DATABASE_URL',
    'GROQ_API_KEY',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
  ];

  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }
}

/**
 * Load and validate configuration from environment variables
 * @returns Typed configuration object
 * @throws Error if required variables are missing at runtime
 */
function loadConfig(): Config {
  validateEnv();

  // Provide placeholder values during build time
  const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';

  return {
    database: {
      url: process.env.DATABASE_URL || (isBuildTime ? 'postgresql://placeholder' : ''),
    },
    groq: {
      apiKey: process.env.GROQ_API_KEY || (isBuildTime ? 'placeholder' : ''),
      model: 'llama-3.3-70b-versatile',
    },
    nextAuth: {
      secret: process.env.NEXTAUTH_SECRET || (isBuildTime ? 'placeholder' : ''),
      url: process.env.NEXTAUTH_URL || (isBuildTime ? 'http://localhost:3000' : ''),
    },
    app: {
      pollingInterval: parseInt(process.env.POLLING_INTERVAL || '5000', 10),
    },
  };
}

export const config = loadConfig();
