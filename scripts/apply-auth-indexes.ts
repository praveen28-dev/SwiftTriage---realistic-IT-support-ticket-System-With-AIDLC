/**
 * Manual migration script to apply authentication indexes
 * Run with: npx tsx scripts/apply-auth-indexes.ts
 */

import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function applyIndexes() {
  const sql = neon(process.env.DATABASE_URL!);
  
  console.log('Applying authentication indexes...');
  
  try {
    // Create index on email for fast login lookups
    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users (email)`;
    console.log('✓ Created index: idx_users_email');
    
    // Create index on role for authorization queries
    await sql`CREATE INDEX IF NOT EXISTS idx_users_role ON users (role)`;
    console.log('✓ Created index: idx_users_role');
    
    console.log('\n✅ All indexes applied successfully!');
  } catch (error) {
    console.error('❌ Error applying indexes:', error);
    process.exit(1);
  }
}

applyIndexes();
