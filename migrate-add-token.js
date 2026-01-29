import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

async function runMigration() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not defined');
  }

  const sql = neon(connectionString);

  console.log('🚀 Adding token column to session table...');

  try {
    // We truncate the session table first to avoid "column contains null values" error
    // when adding a NOT NULL column. This logs out all users.
    await sql`TRUNCATE TABLE session CASCADE`;
    console.log('✅ Session table truncated');

    // Add the token column
    await sql`ALTER TABLE session ADD COLUMN token TEXT NOT NULL UNIQUE`;
    console.log('✅ Token column added successfully');

  } catch (err) {
    // Check if error is because column already exists
    if (err.message && err.message.includes('already exists')) {
      console.log('⚠️ Token column already exists, skipping...');
    } else {
      console.error('❌ Migration failed:', err);
      process.exit(1);
    }
  }

  console.log('✅ Migration complete!');
}

runMigration();
