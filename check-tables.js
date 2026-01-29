import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

async function listTables() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not defined');
  }

  const sql = neon(connectionString);

  console.log('🔍 Checking database tables...\n');

  try {
    // List all tables
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;

    console.log('📂 Found Tables:');
    console.log('----------------');
    
    for (const table of tables) {
      console.log(`- ${table.table_name}`);
    }

    console.log('\n----------------');

    // Get count for 'user' table specifically
    try {
      const userCount = await sql`SELECT COUNT(*) FROM "user"`;
      console.log(`\n📊 Users Count: ${userCount[0].count}`);
    } catch (e) { console.log('Could not count users'); }

    // Check specific 'user' table columns to show structure
    const userColumns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'user';
    `;

    if (userColumns.length > 0) {
      console.log('\n👤 "user" table structure (Where users & admins live):');
      userColumns.forEach(col => {
        console.log(`  • ${col.column_name} (${col.data_type})`);
      });
      
      // Check for admins
      const admins = await sql`SELECT email, role FROM "user" WHERE role = 'admin'`;
      if (admins.length > 0) {
        console.log(`\n👑 Admins found: ${admins.length}`);
        admins.forEach(a => console.log(`  - ${a.email}`));
      } else {
        console.log('\n👑 No admins found yet.');
      }
    } else {
      console.log('\n❌ "user" table NOT found! (Did you mean "users"?)');
    }

  } catch (err) {
    console.error('❌ Error inspecting database:', err);
  }
}

listTables();
