# 🚀 Pre-Deployment SEO Checklist

Run through this checklist BEFORE deploying to production!

## ✅ Files to Check

### 1. index.html
- [ ] Title includes keywords: "Pneuma BookStore | Christian Books & Audiobooks Online"
- [ ] Meta description is compelling and under 160 characters
- [ ] Keywords meta tag present
- [ ] Canonical URL: `https://books.christfaculty.org/`
- [ ] Open Graph tags complete
- [ ] Twitter Card tags complete
- [ ] JSON-LD structured data present
- [ ] Theme color set to brand color (#11b53f)

### 2. public/robots.txt
- [ ] Allows all search engines
- [ ] Blocks /admin/ and /api/
- [ ] References sitemap.xml
- [ ] No syntax errors

### 3. public/sitemap.xml
- [ ] Contains homepage
- [ ] Contains all main pages
- [ ] Contains book pages (if static)
- [ ] Valid XML format
- [ ] Correct domain: books.christfaculty.org

### 4. .htaccess
- [ ] HTTPS redirect enabled
- [ ] WWW removal configured
- [ ] Compression enabled
- [ ] Caching configured
- [ ] Security headers present
- [ ] SPA routing works

### 5. SEO Component (src/components/Seo.jsx)
- [ ] Dynamically updates page title
- [ ] Updates meta description
- [ ] Updates canonical URL
- [ ] Updates Open Graph tags
- [ ] Supports JSON-LD injection

## 🔧 Commands to Run

### 1. Verify SEO Implementation
```bash
npm run verify-seo
```
**Expected**: All checks should pass (33/33)

### 2. Generate Fresh Sitemap
```bash
npm run generate-sitemap
```
**Expected**: Sitemap created with all books from database

### 3. Build Production Bundle
```bash
npm run build
```
**Expected**: No errors, dist folder created

### 4. Test Production Build Locally
```bash
npm run preview
```
**Expected**: Site works correctly on localhost

## 🌐 Domain & Hosting Checks

### SSL Certificate
- [ ] HTTPS is enabled
- [ ] Certificate is valid
- [ ] No mixed content warnings
- [ ] HTTP redirects to HTTPS

### DNS Configuration
- [ ] Domain points to correct server
- [ ] No WWW subdomain (or redirects to non-WWW)
- [ ] DNS propagation complete

### Server Configuration
- [ ] .htaccess rules are active
- [ ] Compression is working
- [ ] Caching headers are set
- [ ] Security headers are present

## 📱 Mobile & Performance

### Mobile Responsiveness
- [ ] Site works on mobile devices
- [ ] Viewport meta tag present
- [ ] Touch targets are adequate
- [ ] Text is readable without zooming

### Performance
- [ ] Images are optimized
- [ ] CSS/JS are minified
- [ ] Lazy loading implemented
- [ ] PWA features working

## 🔍 Test URLs

After deployment, test these URLs:

### Core Pages
- [ ] https://books.christfaculty.org/
- [ ] https://books.christfaculty.org/books
- [ ] https://books.christfaculty.org/search
- [ ] https://books.christfaculty.org/library
- [ ] https://books.christfaculty.org/book/[any-book-id]

### SEO Files
- [ ] https://books.christfaculty.org/robots.txt
- [ ] https://books.christfaculty.org/sitemap.xml
- [ ] https://books.christfaculty.org/icon.png

### Redirects
- [ ] http://books.christfaculty.org/ → https://books.christfaculty.org/
- [ ] https://www.books.christfaculty.org/ → https://books.christfaculty.org/

## 🧪 Post-Deployment Tests

### 1. View Page Source
```
Right-click → View Page Source
```
Check for:
- [ ] Meta tags are present
- [ ] JSON-LD is present
- [ ] No errors in HTML

### 2. Google Rich Results Test
```
https://search.google.com/test/rich-results
```
- [ ] No errors
- [ ] Structured data detected
- [ ] Preview looks good

### 3. Facebook Debugger
```
https://developers.facebook.com/tools/debug/
```
- [ ] Image displays correctly
- [ ] Title and description correct
- [ ] No warnings

### 4. PageSpeed Insights
```
https://pagespeed.web.dev/
```
- [ ] Mobile score: 80+
- [ ] Desktop score: 90+
- [ ] Core Web Vitals: Good

### 5. Mobile-Friendly Test
```
https://search.google.com/test/mobile-friendly
```
- [ ] Page is mobile-friendly
- [ ] No usability issues

## 📊 Analytics Setup (Optional but Recommended)

### Google Analytics 4
- [ ] GA4 property created
- [ ] Tracking code added
- [ ] Events configured
- [ ] Conversions defined

### Google Tag Manager (Optional)
- [ ] Container created
- [ ] Tags configured
- [ ] Triggers set up

## 🔐 Security Checks

### Headers
- [ ] X-Content-Type-Options: nosniff
- [ ] X-Frame-Options: SAMEORIGIN
- [ ] X-XSS-Protection: 1; mode=block
- [ ] Referrer-Policy set

### Content
- [ ] No sensitive data exposed
- [ ] API keys not in client code
- [ ] Admin routes protected

## 📝 Content Quality

### Homepage
- [ ] Compelling headline
- [ ] Clear value proposition
- [ ] Call-to-action buttons
- [ ] Featured books displayed

### Book Pages
- [ ] Unique titles
- [ ] Detailed descriptions
- [ ] High-quality images
- [ ] Proper metadata

### General
- [ ] No duplicate content
- [ ] No broken links
- [ ] Proper grammar and spelling
- [ ] Consistent branding

## 🎯 Final Checklist

Before going live:
- [ ] All SEO checks passed
- [ ] Sitemap generated with real data
- [ ] Production build tested
- [ ] Domain and SSL working
- [ ] Mobile responsive
- [ ] Performance optimized
- [ ] Security headers set
- [ ] Content reviewed
- [ ] Backup created

## 🚀 Deployment Steps

1. **Generate Sitemap**
   ```bash
   npm run generate-sitemap
   ```

2. **Build Production**
   ```bash
   npm run build
   ```

3. **Upload to Server**
   - Upload `dist` folder contents
   - Upload `.htaccess` file
   - Verify file permissions

4. **Test Live Site**
   - Visit all main pages
   - Check console for errors
   - Test on mobile device

5. **Submit to Search Engines**
   - Google Search Console
   - Bing Webmaster Tools

## ✅ Post-Deployment

After deployment:
- [ ] Site is live and accessible
- [ ] All pages load correctly
- [ ] No console errors
- [ ] Sitemap accessible
- [ ] Robots.txt accessible
- [ ] HTTPS working
- [ ] Submitted to Google Search Console
- [ ] Submitted to Bing Webmaster Tools

## 📞 If Something Goes Wrong

### Site Not Loading
1. Check DNS settings
2. Verify server is running
3. Check file permissions
4. Review server logs

### SEO Files Not Found
1. Verify files are in correct location
2. Check .htaccess rules
3. Clear browser cache
4. Check server configuration

### Slow Performance
1. Enable compression
2. Enable caching
3. Optimize images
4. Minify CSS/JS

---

## 🎉 Ready to Deploy?

If all checks pass, you're ready to go live!

**Remember**: 
- SEO takes time (2-3 months for results)
- Monitor Search Console weekly
- Update content regularly
- Build quality backlinks

**Good luck! 🚀**
