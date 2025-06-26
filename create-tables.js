import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

async function createTables() {
  try {
    console.log('🚀 Creating database tables...');
    
    const sql = neon(process.env.DATABASE_URL);
    
    // Create users table
    console.log('📊 Creating users table...');
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        clerk_id TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        role TEXT DEFAULT 'user' NOT NULL,
        is_active BOOLEAN DEFAULT true NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;
    
    // Create books table
    console.log('📚 Creating books table...');
    await sql`
      CREATE TABLE IF NOT EXISTS books (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        description TEXT NOT NULL,
        full_description TEXT,
        genre TEXT NOT NULL,
        category TEXT,
        tags TEXT,
        publisher TEXT,
        published_date TEXT,
        isbn TEXT,
        language TEXT DEFAULT 'English' NOT NULL,
        pages INTEGER,
        rating DECIMAL(3,2) DEFAULT 0,
        total_ratings INTEGER DEFAULT 0,
        downloads INTEGER DEFAULT 0,
        audio_link TEXT,
        preview_link TEXT,
        pdf_file_url TEXT,
        pdf_file_id TEXT,
        cover_file_url TEXT,
        cover_file_id TEXT,
        featured BOOLEAN DEFAULT false,
        bestseller BOOLEAN DEFAULT false,
        new_release BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;
    
    // Create favorites table
    console.log('❤️ Creating favorites table...');
    await sql`
      CREATE TABLE IF NOT EXISTS favorites (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;
    
    // Create downloads table
    console.log('📥 Creating downloads table...');
    await sql`
      CREATE TABLE IF NOT EXISTS downloads (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
        download_type TEXT DEFAULT 'pdf' NOT NULL,
        download_count INTEGER DEFAULT 1 NOT NULL,
        downloaded_at TIMESTAMP DEFAULT NOW() NOT NULL,
        last_downloaded_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;
    
    // Create book_ratings table
    console.log('⭐ Creating book_ratings table...');
    await sql`
      CREATE TABLE IF NOT EXISTS book_ratings (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
        rating INTEGER NOT NULL,
        review TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;
    
    // Create reading_progress table
    console.log('📖 Creating reading_progress table...');
    await sql`
      CREATE TABLE IF NOT EXISTS reading_progress (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
        current_page INTEGER DEFAULT 0,
        total_pages INTEGER,
        progress_percentage DECIMAL(5,2) DEFAULT 0,
        last_read_at TIMESTAMP DEFAULT NOW() NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;
    
    console.log('✅ All tables created successfully!');
    
    // Verify tables were created
    const result = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    
    console.log('📋 Tables in database:');
    result.forEach(table => {
      console.log(`  ✅ ${table.table_name}`);
    });
    
    console.log('\n🎉 Database setup complete! You can now start your app with: npm run dev');
    
  } catch (error) {
    console.error('❌ Table creation failed:', error.message);
    console.error('Full error:', error);
  }
}

createTables();
