#!/usr/bin/env tsx
/**
 * Environment Variable Validation Script
 * 
 * Validates required environment variables for the secure authentication system.
 * Run this script before starting the application to ensure proper configuration.
 * 
 * Usage:
 *   npm run validate-env
 *   or
 *   npx tsx scripts/validate-env.ts
 * 
 * Requirements: 4.2, 11.1, Security NFR 2
 */

import * as fs from 'fs';
import * as path from 'path';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m',
};

interface ValidationResult {
  variable: string;
  required: boolean;
  present: boolean;
  valid: boolean;
  message?: string;
}

/**
 * Validate NEXTAUTH_SECRET format and strength
 */
function validateNextAuthSecret(value: string | undefined): ValidationResult {
  const result: ValidationResult = {
    variable: 'NEXTAUTH_SECRET',
    required: true,
    present: !!value,
    valid: false,
  };

  if (!value) {
    result.message = 'Missing NEXTAUTH_SECRET. Generate with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'base64\'))"';
    return result;
  }

  // Check minimum length (32 characters = 256 bits when base64 encoded)
  if (value.length < 32) {
    result.message = `NEXTAUTH_SECRET too short (${value.length} chars). Minimum 32 characters required for security.`;
    return result;
  }

  // Check for placeholder values
  const placeholders = ['your_nextauth_secret_here', 'changeme', 'secret', 'test'];
  if (placeholders.some(p => value.toLowerCase().includes(p))) {
    result.message = 'NEXTAUTH_SECRET appears to be a placeholder. Use a cryptographically secure random value.';
    return result;
  }

  result.valid = true;
  result.message = `Valid (${value.length} characters)`;
  return result;
}

/**
 * Validate NEXTAUTH_URL format
 */
function validateNextAuthUrl(value: string | undefined): ValidationResult {
  const result: ValidationResult = {
    variable: 'NEXTAUTH_URL',
    required: true,
    present: !!value,
    valid: false,
  };

  if (!value) {
    result.message = 'Missing NEXTAUTH_URL. Set to your application base URL (e.g., http://localhost:3000)';
    return result;
  }

  // Validate URL format
  try {
    const url = new URL(value);
    
    // Check protocol
    if (!['http:', 'https:'].includes(url.protocol)) {
      result.message = `Invalid protocol: ${url.protocol}. Must be http: or https:`;
      return result;
    }

    // Warn if using http in production
    if (url.protocol === 'http:' && !['localhost', '127.0.0.1'].includes(url.hostname)) {
      result.valid = true;
      result.message = `⚠️  WARNING: Using http:// for non-localhost. Use https:// in production.`;
      return result;
    }

    result.valid = true;
    result.message = `Valid (${url.protocol}//${url.host})`;
    return result;
  } catch (error) {
    result.message = `Invalid URL format: ${value}`;
    return result;
  }
}

/**
 * Validate DATABASE_URL format (PostgreSQL connection string)
 */
function validateDatabaseUrl(value: string | undefined): ValidationResult {
  const result: ValidationResult = {
    variable: 'DATABASE_URL',
    required: true,
    present: !!value,
    valid: false,
  };

  if (!value) {
    result.message = 'Missing DATABASE_URL. Required for user authentication and session storage.';
    return result;
  }

  // Check for placeholder
  if (value.trim() === '' || value.includes('your_database_url')) {
    result.message = 'DATABASE_URL appears to be empty or a placeholder.';
    return result;
  }

  // Validate PostgreSQL connection string format
  const postgresPattern = /^postgres(ql)?:\/\/.+/i;
  if (!postgresPattern.test(value)) {
    result.message = 'Invalid PostgreSQL connection string format. Expected: postgresql://[user]:[password]@[host]/[database]';
    return result;
  }

  // Try to parse as URL to validate structure
  try {
    const url = new URL(value);
    
    if (!url.hostname) {
      result.message = 'DATABASE_URL missing hostname';
      return result;
    }

    if (!url.pathname || url.pathname === '/') {
      result.message = 'DATABASE_URL missing database name';
      return result;
    }

    result.valid = true;
    result.message = `Valid (${url.hostname}${url.pathname})`;
    return result;
  } catch (error) {
    result.message = 'Invalid DATABASE_URL format';
    return result;
  }
}

/**
 * Validate BCRYPT_SALT_ROUNDS (optional, with range validation)
 */
function validateBcryptSaltRounds(value: string | undefined): ValidationResult {
  const result: ValidationResult = {
    variable: 'BCRYPT_SALT_ROUNDS',
    required: false,
    present: !!value,
    valid: true, // Optional, so valid if not present
  };

  if (!value) {
    result.message = 'Not set (will use default: 12)';
    return result;
  }

  const saltRounds = parseInt(value, 10);

  if (isNaN(saltRounds)) {
    result.valid = false;
    result.message = `Invalid value: "${value}". Must be a number between 12 and 15.`;
    return result;
  }

  if (saltRounds < 12) {
    result.valid = false;
    result.message = `Value too low: ${saltRounds}. Minimum 12 required for security.`;
    return result;
  }

  if (saltRounds > 15) {
    result.valid = false;
    result.message = `Value too high: ${saltRounds}. Maximum 15 (performance constraint).`;
    return result;
  }

  result.valid = true;
  result.message = `Valid (${saltRounds} rounds)`;
  return result;
}

/**
 * Check if .env.local file exists
 */
function checkEnvFileExists(): boolean {
  const envPath = path.join(process.cwd(), '.env.local');
  return fs.existsSync(envPath);
}

/**
 * Main validation function
 */
function validateEnvironment(): void {
  console.log(`${colors.bold}${colors.blue}🔒 Environment Variable Validation${colors.reset}\n`);

  // Check if .env.local exists
  if (!checkEnvFileExists()) {
    console.log(`${colors.yellow}⚠️  Warning: .env.local file not found${colors.reset}`);
    console.log(`   Copy .env.local.example to .env.local and configure your environment variables.\n`);
  }

  // Validate each required variable
  const results: ValidationResult[] = [
    validateNextAuthSecret(process.env.NEXTAUTH_SECRET),
    validateNextAuthUrl(process.env.NEXTAUTH_URL),
    validateDatabaseUrl(process.env.DATABASE_URL),
    validateBcryptSaltRounds(process.env.BCRYPT_SALT_ROUNDS),
  ];

  // Display results
  let hasErrors = false;
  let hasWarnings = false;

  results.forEach(result => {
    const status = result.valid 
      ? `${colors.green}✓${colors.reset}` 
      : `${colors.red}✗${colors.reset}`;
    
    const requiredLabel = result.required ? 'REQUIRED' : 'OPTIONAL';
    const requiredColor = result.required ? colors.red : colors.yellow;
    
    console.log(`${status} ${colors.bold}${result.variable}${colors.reset} (${requiredColor}${requiredLabel}${colors.reset})`);
    
    if (result.message) {
      const messageColor = result.valid ? colors.green : colors.red;
      console.log(`  ${messageColor}${result.message}${colors.reset}`);
    }
    
    console.log('');

    if (!result.valid && result.required) {
      hasErrors = true;
    }
    
    if (result.message?.includes('WARNING')) {
      hasWarnings = true;
    }
  });

  // Summary
  console.log(`${colors.bold}Summary:${colors.reset}`);
  
  if (hasErrors) {
    console.log(`${colors.red}❌ Validation failed. Fix the errors above before starting the application.${colors.reset}\n`);
    process.exit(1);
  } else if (hasWarnings) {
    console.log(`${colors.yellow}⚠️  Validation passed with warnings. Review warnings before deploying to production.${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`${colors.green}✅ All environment variables are valid.${colors.reset}\n`);
    process.exit(0);
  }
}

// Run validation
validateEnvironment();
