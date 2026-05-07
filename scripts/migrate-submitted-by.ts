/**
 * One-time migration: add submitted_by column to tickets table
 * and add users table if it doesn't exist.
 *
 * Run with: npx tsx scripts/migrate-submitted-by.ts
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';

async function migrate() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set in .env.local');
  }

  const sql = neon(databaseUrl);

  console.log('Running migrations...\n');

  // 1. Add submitted_by column to tickets (safe — uses IF NOT EXISTS equivalent)
  try {
    await sql`
      ALTER TABLE tickets
      ADD COLUMN IF NOT EXISTS submitted_by VARCHAR(255) NOT NULL DEFAULT 'anonymous'
    `;
    console.log('✓ tickets.submitted_by column added (or already exists)');
  } catch (err: any) {
    console.error('✗ tickets.submitted_by:', err.message);
  }

  // 2. Create users table if it doesn't exist (for CRIT-01 auth fix)
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username    VARCHAR(100) NOT NULL UNIQUE,
        email       VARCHAR(255) NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role        VARCHAR(20) NOT NULL DEFAULT 'end_user',
        is_active   BOOLEAN NOT NULL DEFAULT true,
        created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;
    console.log('✓ users table created (or already exists)');
  } catch (err: any) {
    console.error('✗ users table:', err.message);
  }

  console.log('\nMigration complete.');
  process.exit(0);
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
