/**
 * Database Connection Module
 * Initializes Neon serverless connection with Drizzle ORM
 */

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { config } from '@/lib/config';
import * as schema from './schema';

/**
 * Initialize database connection
 * @returns Drizzle database instance
 */
function initializeDatabase() {
  // Skip actual connection during build time
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    // Return a mock database instance for build time
    return drizzle((() => {}) as any, { schema });
  }
  
  const sql = neon(config.database.url);
  return drizzle(sql, { schema });
}

// Export database instance
export const db = initializeDatabase();
