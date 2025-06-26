import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema.js';

// Create the connection (only on server-side)
let db = null;

// Only create database connection on server-side
if (typeof window === 'undefined') {
  const sql = neon(process.env.DATABASE_URL);
  db = drizzle(sql, { schema });
}

// Export database instance
export { db };

// Export schema for use in other files
export * from './schema.js';
