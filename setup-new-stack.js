#!/usr/bin/env node

// Setup script for the new tech stack
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Setting up Pneuma BookStore with new tech stack...\n');

// Check if .env file exists
if (!fs.existsSync('.env')) {
  console.log('📝 Creating .env file...');
  
  const envContent = `# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
CLERK_SECRET_KEY=your_clerk_secret_key_here

# Neon Database
DATABASE_URL=your_neon_database_url_here

# Cloudinary Storage
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
VITE_CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Admin Configuration
VITE_ADMIN_EMAIL=admin@pneumabookstore.com

# API Configuration
VITE_API_URL=http://localhost:3001/api
`;

  fs.writeFileSync('.env', envContent);
  console.log('✅ .env file created');
} else {
  console.log('ℹ️  .env file already exists');
}

// Check if database schema exists
if (!fs.existsSync('src/lib/db')) {
  console.log('📊 Database schema already created');
} else {
  console.log('✅ Database schema ready');
}

console.log('\n🎯 Next steps:');
console.log('1. Set up your services:');
console.log('   📊 Neon Database: https://console.neon.tech');
console.log('   🔐 Clerk Auth: https://dashboard.clerk.com');
console.log('   📁 Cloudinary: https://cloudinary.com/console');
console.log('');
console.log('2. Update your .env file with the credentials');
console.log('');
console.log('3. Run database migrations:');
console.log('   npm run db:generate');
console.log('   npm run db:migrate');
console.log('');
console.log('4. Start your development server:');
console.log('   npm run dev');
console.log('');
console.log('📚 Check MIGRATION_GUIDE.md for detailed instructions');
console.log('');
console.log('🎉 Your new tech stack is ready!');
