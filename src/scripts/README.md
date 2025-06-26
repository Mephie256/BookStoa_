# Database Seeder for Pneuma BookStore

This directory contains scripts to seed your database with sample Christian books.

## 📚 What Gets Added

The seeder will add 10 high-quality Christian books including:

1. **The Purpose Driven Life** by Rick Warren
2. **Jesus Calling** by Sarah Young  
3. **Mere Christianity** by C.S. Lewis
4. **The Case for Christ** by Lee Strobel
5. **Crazy Love** by Francis Chan
6. **The Screwtape Letters** by C.S. Lewis
7. **Desiring God** by John Piper
8. **The Pilgrim's Progress** by John Bunyan
9. **The Cost of Discipleship** by Dietrich Bonhoeffer
10. **My Utmost for His Highest** by Oswald Chambers

Each book includes:
- ✅ Title, Author, Genre, Category
- ✅ Detailed Description
- ✅ Page Count, Rating, Total Ratings
- ✅ Publication Date, Language, ISBN
- ✅ Tags for categorization
- ✅ Cover Image URLs (real book covers)
- ✅ Sample PDF and Audio URLs

## 🚀 How to Use

### Method 1: Admin Dashboard (Recommended)
1. Navigate to `/admin/dashboard` in your app
2. Click the **"Seed Database"** button
3. Confirm the action
4. Wait for the seeding to complete

### Method 2: Standalone HTML Tool
1. Open `runSeed.html` in your browser
2. Update the `API_BASE_URL` if needed
3. Click **"Seed Database with Sample Books"**
4. Monitor the progress in the log

### Method 3: Direct Import (For Developers)
```javascript
import { seedDatabase } from './seedBooks';

// Run the seeder
const result = await seedDatabase();
console.log(`Added ${result.successCount} books`);
```

## ⚠️ Important Notes

- **Admin Access Required**: You need admin privileges to seed the database
- **Duplicate Prevention**: The seeder will attempt to add all books, but your API should handle duplicates
- **Network Dependent**: Requires active internet connection for cover images
- **Sample URLs**: PDF and audio URLs are placeholders - replace with real files as needed

## 🔧 Customization

To add your own books, edit the `sampleBooks` array in `seedBooks.js`:

```javascript
{
  title: 'Your Book Title',
  author: 'Author Name',
  genre: 'Christian Living',
  // ... other properties
}
```

## 📝 Available Genres

- Christian Living
- Devotional  
- Theology
- Apologetics
- Biblical Studies
- Prayer
- Worship
- Discipleship
- Evangelism
- Church History
- Biography
- Fiction
- Youth
- Children
- Family
- Marriage
- Leadership
- Missions

## 🎯 Success Indicators

After seeding, you should see:
- ✅ Books appear on the home page
- ✅ Categories populated in navigation
- ✅ Search functionality working
- ✅ Book detail pages accessible
- ✅ Cover images loading properly

## 🐛 Troubleshooting

**Books not appearing?**
- Check browser console for errors
- Verify API is running
- Confirm admin authentication
- Check database connection

**Cover images not loading?**
- Images are hosted externally
- Check internet connection
- URLs may change over time

**Seeding fails?**
- Verify API endpoint URLs
- Check authentication status
- Review server logs for errors

## 🔄 Re-seeding

You can run the seeder multiple times. Your API should handle:
- Duplicate book prevention
- Error handling for existing records
- Proper response formatting

Enjoy your populated bookstore! 📚✨
