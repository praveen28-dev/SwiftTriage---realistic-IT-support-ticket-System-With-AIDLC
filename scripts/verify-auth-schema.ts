/**
 * Verification script to check authentication schema
 * Run with: npx tsx scripts/verify-auth-schema.ts
 */

import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function verifySchema() {
  const sql = neon(process.env.DATABASE_URL!);
  
  console.log('Verifying authentication schema...\n');
  
  try {
    // Check users table structure
    const columns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `;
    
    console.log('Users table columns:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
    // Check indexes
    const indexes = await sql`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'users'
      ORDER BY indexname
    `;
    
    console.log('\nUsers table indexes:');
    indexes.forEach(idx => {
      console.log(`  - ${idx.indexname}`);
    });
    
    // Verify required fields exist
    const requiredFields = ['passwordHash', 'isActive', 'createdAt', 'updatedAt', 'email', 'username'];
    const columnNames = columns.map(c => c.column_name);
    
    console.log('\nRequired authentication fields:');
    requiredFields.forEach(field => {
      const snakeCase = field.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      const exists = columnNames.includes(snakeCase);
      console.log(`  ${exists ? '✓' : '✗'} ${field} (${snakeCase})`);
    });
    
    // Verify indexes exist
    const requiredIndexes = ['idx_users_email', 'idx_users_role'];
    const indexNames = indexes.map(i => i.indexname);
    
    console.log('\nRequired indexes:');
    requiredIndexes.forEach(idx => {
      const exists = indexNames.includes(idx);
      console.log(`  ${exists ? '✓' : '✗'} ${idx}`);
    });
    
    console.log('\n✅ Schema verification complete!');
  } catch (error) {
    console.error('❌ Error verifying schema:', error);
    process.exit(1);
  }
}

verifySchema();
