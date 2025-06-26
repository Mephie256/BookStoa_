// Script to create library table
import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

async function setupLibraryTable() {
  try {
    console.log('🚀 Setting up library table...');
    
    // Create library table
    console.log('📚 Creating library table...');
    await sql`
      CREATE TABLE IF NOT EXISTS library (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        book_id VARCHAR(255) NOT NULL,
        reading_status VARCHAR(50) DEFAULT 'want_to_read',
        progress INTEGER DEFAULT 0,
        notes TEXT,
        added_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, book_id)
      )
    `;
    console.log('✅ Library table created');
    
    // Create indexes for better performance
    console.log('🔍 Creating indexes...');
    
    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_library_user_id ON library(user_id)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_library_book_id ON library(book_id)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_library_reading_status ON library(reading_status)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_library_added_at ON library(added_at)`;
      console.log('✅ Indexes created');
    } catch (error) {
      console.log('⚠️  Some indexes may already exist:', error.message);
    }
    
    // Verify table exists
    console.log('🔍 Verifying library table...');
    
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'library'
    `;
    
    if (tables.length > 0) {
      console.log('✅ Library table verified');
      
      // Show table structure
      const columns = await sql`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'library'
        ORDER BY ordinal_position
      `;
      
      console.log('📋 Library table structure:');
      columns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
      });
    } else {
      console.error('❌ Library table not found');
    }
    
    console.log('🎉 Library table setup complete!');
    
  } catch (error) {
    console.error('❌ Error setting up library table:', error);
  }
}

setupLibraryTable();
