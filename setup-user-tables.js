// Script to create user-related tables (favorites, downloads)
import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

async function setupUserTables() {
  try {
    console.log('🚀 Setting up user tables...');
    
    // Create favorites table
    console.log('📋 Creating favorites table...');
    await sql`
      CREATE TABLE IF NOT EXISTS favorites (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        book_id VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, book_id)
      )
    `;
    console.log('✅ Favorites table created');
    
    // Create downloads table
    console.log('📥 Creating downloads table...');
    await sql`
      CREATE TABLE IF NOT EXISTS downloads (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        book_id VARCHAR(255) NOT NULL,
        download_type VARCHAR(50) DEFAULT 'pdf',
        download_count INTEGER DEFAULT 1,
        downloaded_at TIMESTAMP DEFAULT NOW(),
        last_downloaded_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, book_id, download_type)
      )
    `;
    console.log('✅ Downloads table created');
    
    // Create indexes for better performance
    console.log('🔍 Creating indexes...');
    
    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_favorites_book_id ON favorites(book_id)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_downloads_user_id ON downloads(user_id)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_downloads_book_id ON downloads(book_id)`;
      console.log('✅ Indexes created');
    } catch (error) {
      console.log('⚠️  Some indexes may already exist:', error.message);
    }
    
    // Verify tables exist
    console.log('🔍 Verifying tables...');
    
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('favorites', 'downloads')
      ORDER BY table_name
    `;
    
    console.log('📋 Found tables:');
    tables.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });
    
    console.log('🎉 User tables setup complete!');
    
  } catch (error) {
    console.error('❌ Error setting up user tables:', error);
  }
}

setupUserTables();
