import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const sql = neon(process.env.VITE_DATABASE_URL);

async function runMigration() {
  try {
    console.log('🔄 Running payment fields migration...');

    // Add is_free column
    console.log('📝 Adding is_free column...');
    await sql`
      ALTER TABLE books 
      ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT true NOT NULL
    `;

    // Add price column
    console.log('📝 Adding price column...');
    await sql`
      ALTER TABLE books 
      ADD COLUMN IF NOT EXISTS price INTEGER DEFAULT 0
    `;

    // Update existing books to be free by default
    console.log('📝 Updating existing books...');
    await sql`
      UPDATE books 
      SET is_free = true, price = 0 
      WHERE is_free IS NULL
    `;

    console.log('✅ Payment fields migration completed successfully!');
    console.log('📊 Added columns: is_free (BOOLEAN), price (INTEGER)');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
