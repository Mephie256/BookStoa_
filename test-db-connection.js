import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

async function testConnection() {
  try {
    console.log('Testing database connection...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    
    const sql = neon(process.env.DATABASE_URL);
    const result = await sql`SELECT version()`;
    
    console.log('✅ Database connection successful!');
    console.log('PostgreSQL version:', result[0].version);
    
    // Test creating a simple table
    await sql`CREATE TABLE IF NOT EXISTS test_table (id SERIAL PRIMARY KEY, name TEXT)`;
    console.log('✅ Table creation test successful!');
    
    // Clean up
    await sql`DROP TABLE IF EXISTS test_table`;
    console.log('✅ Database test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Full error:', error);
  }
}

testConnection();
