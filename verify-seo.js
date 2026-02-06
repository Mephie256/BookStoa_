/**
 * SEO Verification Script
 * Run this to verify your SEO implementation
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const checks = [];
let passed = 0;
let failed = 0;

function check(name, condition, fix = '') {
  const status = condition ? '✅' : '❌';
  const result = { name, passed: condition, fix };
  checks.push(result);
  
  if (condition) {
    passed++;
    console.log(`${status} ${name}`);
  } else {
    failed++;
    console.log(`${status} ${name}`);
    if (fix) console.log(`   Fix: ${fix}`);
  }
}

console.log('\n🔍 SEO Verification Report\n');
console.log('='.repeat(50));

try {
  // Check index.html
  const indexHtml = readFileSync('./index.html', 'utf-8');
  
  console.log('\n📄 HTML Meta Tags:');
  check('Title tag present', indexHtml.includes('<title>'));
  check('Meta description present', indexHtml.includes('name="description"'));
  check('Meta keywords present', indexHtml.includes('name="keywords"'));
  check('Canonical URL present', indexHtml.includes('rel="canonical"'));
  check('Open Graph tags present', indexHtml.includes('property="og:'));
  check('Twitter Card tags present', indexHtml.includes('name="twitter:'));
  check('Robots meta tag present', indexHtml.includes('name="robots"'));
  check('Theme color set', indexHtml.includes('name="theme-color"'));
  check('Viewport meta present', indexHtml.includes('name="viewport"'));
  
  console.log('\n📊 Structured Data:');
  check('JSON-LD schema present', indexHtml.includes('application/ld+json'));
  check('Organization schema', indexHtml.includes('"@type": "Organization"'));
  check('WebSite schema', indexHtml.includes('"@type": "WebSite"'));
  check('Search action defined', indexHtml.includes('"@type": "SearchAction"'));
  
  console.log('\n⚡ Performance:');
  check('Preconnect tags present', indexHtml.includes('rel="preconnect"'));
  check('DNS prefetch present', indexHtml.includes('rel="dns-prefetch"'));
  
  // Check robots.txt
  const robotsTxt = readFileSync('./public/robots.txt', 'utf-8');
  
  console.log('\n🤖 Robots.txt:');
  check('Robots.txt exists', robotsTxt.length > 0);
  check('Sitemap reference', robotsTxt.includes('Sitemap:'));
  check('User-agent defined', robotsTxt.includes('User-agent:'));
  check('Admin routes blocked', robotsTxt.includes('Disallow: /admin/'));
  
  // Check sitemap
  const sitemap = readFileSync('./public/sitemap.xml', 'utf-8');
  
  console.log('\n🗺️ Sitemap:');
  check('Sitemap.xml exists', sitemap.length > 0);
  check('Valid XML format', sitemap.includes('<?xml version'));
  check('Homepage included', sitemap.includes('books.christfaculty.org/</loc>'));
  check('Priority tags present', sitemap.includes('<priority>'));
  check('Changefreq tags present', sitemap.includes('<changefreq>'));
  
  // Check .htaccess
  const htaccess = readFileSync('./.htaccess', 'utf-8');
  
  console.log('\n🔧 .htaccess Configuration:');
  check('Compression enabled', htaccess.includes('mod_deflate'));
  check('Caching configured', htaccess.includes('mod_expires'));
  check('HTTPS redirect', htaccess.includes('RewriteCond %{HTTPS}'));
  check('Security headers', htaccess.includes('mod_headers'));
  check('SPA routing', htaccess.includes('RewriteRule . /index.html'));
  
  // Check SEO component
  const seoComponent = readFileSync('./src/components/Seo.jsx', 'utf-8');
  
  console.log('\n⚛️ React SEO Component:');
  check('SEO component exists', seoComponent.length > 0);
  check('Dynamic title updates', seoComponent.includes('document.title'));
  check('Canonical URL handling', seoComponent.includes('canonical'));
  check('JSON-LD support', seoComponent.includes('ensureJsonLd'));
  
} catch (error) {
  console.error('\n❌ Error reading files:', error.message);
}

console.log('\n' + '='.repeat(50));
console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);

if (failed === 0) {
  console.log('\n🎉 Perfect! Your SEO implementation is complete!\n');
  console.log('Next steps:');
  console.log('1. Run: npm run generate-sitemap');
  console.log('2. Build: npm run build');
  console.log('3. Deploy to production');
  console.log('4. Submit to Google Search Console');
  console.log('5. Submit to Bing Webmaster Tools\n');
} else {
  console.log('\n⚠️ Some SEO checks failed. Review the fixes above.\n');
}

console.log('📖 For detailed guide, see: SEO_IMPLEMENTATION.md\n');
