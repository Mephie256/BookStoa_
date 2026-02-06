# 🎯 SEO Quick Reference Card

## 🚀 Quick Commands

```bash
# Verify SEO implementation
npm run verify-seo

# Generate sitemap with your books
npm run generate-sitemap

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📝 Important URLs

### Your Site
- **Homepage**: https://books.christfaculty.org/
- **Sitemap**: https://books.christfaculty.org/sitemap.xml
- **Robots**: https://books.christfaculty.org/robots.txt

### Submit Here (CRITICAL!)
- **Google Search Console**: https://search.google.com/search-console
- **Bing Webmaster**: https://www.bing.com/webmasters

### Test Tools
- **Rich Results**: https://search.google.com/test/rich-results
- **PageSpeed**: https://pagespeed.web.dev/
- **Mobile Test**: https://search.google.com/test/mobile-friendly
- **Facebook Debug**: https://developers.facebook.com/tools/debug/
- **Schema Validator**: https://validator.schema.org/

## ✅ SEO Checklist (Quick Version)

### Before Deployment
- [ ] Run `npm run verify-seo` (should pass 33/33)
- [ ] Run `npm run generate-sitemap`
- [ ] Run `npm run build`
- [ ] Test locally with `npm run preview`

### After Deployment
- [ ] Verify site is live
- [ ] Check sitemap: https://books.christfaculty.org/sitemap.xml
- [ ] Check robots: https://books.christfaculty.org/robots.txt
- [ ] Submit to Google Search Console
- [ ] Submit to Bing Webmaster Tools
- [ ] Request indexing for homepage

### Week 1
- [ ] Check if indexed: `site:books.christfaculty.org` in Google
- [ ] Review Search Console for errors
- [ ] Share on social media

### Monthly
- [ ] Regenerate sitemap
- [ ] Check Search Console metrics
- [ ] Add new content

## 🔍 Check Indexing Status

```
Google Search: site:books.christfaculty.org
```

## 📊 Key Metrics to Track

1. **Indexed Pages** (Search Console → Coverage)
2. **Impressions** (Search Console → Performance)
3. **Average Position** (Search Console → Performance)
4. **Click-Through Rate** (Search Console → Performance)
5. **Page Speed** (PageSpeed Insights)

## 🎯 Target Keywords

### Primary
- Christian books online
- Christian audiobooks
- Pneuma BookStore

### Secondary
- Christian literature
- Spiritual growth books
- Devotional books
- Theology books

## 🚨 Common Issues

| Issue | Quick Fix |
|-------|-----------|
| Not indexed | Submit sitemap in Search Console |
| Slow indexing | Build backlinks, share on social |
| Low rankings | Add more content, optimize titles |
| Crawl errors | Check Search Console, fix issues |

## 📞 Emergency Contacts

- **Google Search Central**: https://developers.google.com/search
- **Bing Help**: https://www.bing.com/webmasters/help

## 💡 Pro Tips

1. **Patience**: SEO takes 2-3 months
2. **Content**: Add new books weekly
3. **Links**: Share everywhere
4. **Monitor**: Check Search Console weekly
5. **Mobile**: Always test on mobile

## 📁 Important Files

```
index.html              → Main SEO meta tags
public/robots.txt       → Search engine rules
public/sitemap.xml      → Site structure
.htaccess              → Server configuration
src/components/Seo.jsx → Dynamic SEO component
```

## 🎉 Success Indicators

✅ Site appears in `site:` search
✅ Homepage indexed within 1-2 weeks
✅ Getting impressions in Search Console
✅ No critical errors
✅ Mobile-friendly test passes

---

**Need detailed help?** See:
- `SEO_IMPLEMENTATION.md` - Complete guide
- `SEO_ACTION_CHECKLIST.md` - Step-by-step actions
- `PRE_DEPLOYMENT_SEO_CHECK.md` - Pre-launch checklist
