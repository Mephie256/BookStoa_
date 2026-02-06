import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { writeFileSync } from 'fs';

config();

const sql = neon(process.env.DATABASE_URL);

async function generateSitemap() {
  try {
    console.log('🗺️ Generating dynamic sitemap...');

    // Fetch all books from database
    const books = await sql`SELECT id, updated_at FROM books ORDER BY updated_at DESC`;

    const currentDate = new Date().toISOString().split('T')[0];

    // Build sitemap XML
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <!-- Homepage -->
  <url>
    <loc>https://books.christfaculty.org/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- All Books Page -->
  <url>
    <loc>https://books.christfaculty.org/books</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  
  <!-- Search Page -->
  <url>
    <loc>https://books.christfaculty.org/search</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <!-- Library Page -->
  <url>
    <loc>https://books.christfaculty.org/library</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>
  
  <!-- Favorites Page -->
  <url>
    <loc>https://books.christfaculty.org/favorites</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>
  
  <!-- Downloads Page -->
  <url>
    <loc>https://books.christfaculty.org/downloads</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>
`;

    // Add individual book pages
    books.forEach((book) => {
      const lastmod = book.updated_at 
        ? new Date(book.updated_at).toISOString().split('T')[0]
        : currentDate;
      
      sitemap += `  
  <!-- Book: ${book.id} -->
  <url>
    <loc>https://books.christfaculty.org/book/${book.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`;
    });

    sitemap += `</urlset>`;

    // Write to public/sitemap.xml
    writeFileSync('./public/sitemap.xml', sitemap);
    console.log(`✅ Sitemap generated with ${books.length} books!`);
    console.log('📍 Location: public/sitemap.xml');
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    process.exit(1);
  }
}

generateSitemap();
