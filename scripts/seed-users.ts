/**
 * User Seed Script
 *
 * Creates the initial IT staff accounts in the users table.
 * Run once after applying the schema migration:
 *
 *   npx tsx scripts/seed-users.ts
 *
 * IMPORTANT: Change the passwords below before running in production.
 * Generate a strong password and store it in a password manager.
 */

import bcrypt from 'bcryptjs';
import { db } from '../lib/db/connection';
import { users } from '../lib/db/schema';

const BCRYPT_ROUNDS = 12; // OWASP recommended minimum

const SEED_USERS = [
  {
    username: 'it_admin',
    email: 'it_admin@swifttriage.internal',
    password: 'ChangeMe!Admin2025',   // ← CHANGE BEFORE PRODUCTION
    role: 'ADMIN' as const,
  },
  {
    username: 'it_staff1',
    email: 'it_staff1@swifttriage.internal',
    password: 'ChangeMe!Staff2025',   // ← CHANGE BEFORE PRODUCTION
    role: 'it_staff' as const,
  },
  {
    username: 'it_staff2',
    email: 'it_staff2@swifttriage.internal',
    password: 'ChangeMe!Staff2025',   // ← CHANGE BEFORE PRODUCTION
    role: 'it_staff' as const,
  },
];

async function seedUsers() {
  console.log('Seeding users table...');

  for (const u of SEED_USERS) {
    const passwordHash = await bcrypt.hash(u.password, BCRYPT_ROUNDS);

    await db
      .insert(users)
      .values({
        username: u.username,
        email: u.email,
        passwordHash,
        role: u.role,
        isActive: true,
      })
      .onConflictDoNothing(); // safe to re-run

    console.log(`  ✓ ${u.username} (${u.role})`);
  }

  console.log('Done. Remember to change the default passwords!');
  process.exit(0);
}

seedUsers().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
