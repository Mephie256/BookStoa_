// Real downloads service that works with Neon database
import { neon } from '@neondatabase/serverless';

const sql = neon(import.meta.env.VITE_DATABASE_URL || process.env.DATABASE_URL);

export const downloadsService = {
  // Get user's download history
  async getUserDownloads(userId) {
    try {
      console.log('📥 Getting downloads for user:', userId);
      
      const downloads = await sql`
        SELECT d.id, d.download_type, d.download_count, d.downloaded_at, d.last_downloaded_at,
               b.id as book_id, b.title, b.author, b.description, b.genre, b.category,
               b.cover_file_url, b.rating, b.total_ratings, b.downloads as total_downloads,
               b.pdf_file_url, b.audio_link, b.pages, b.language, b.publisher
        FROM downloads d
        JOIN books b ON d.book_id = b.id
        WHERE d.user_id = ${userId}
        ORDER BY d.last_downloaded_at DESC
      `;
      
      console.log('📥 Found downloads:', downloads.length);
      return downloads;
    } catch (error) {
      console.error('❌ Error getting user downloads:', error);
      return [];
    }
  },

  // Record a download
  async recordDownload(userId, bookId, downloadType = 'pdf') {
    try {
      console.log('📥 Recording download:', { userId, bookId, downloadType });
      
      // Check if user has downloaded this book before
      const existing = await sql`
        SELECT id, download_count FROM downloads 
        WHERE user_id = ${userId} AND book_id = ${bookId} AND download_type = ${downloadType}
      `;
      
      if (existing.length > 0) {
        // Update existing download record
        await sql`
          UPDATE downloads 
          SET download_count = download_count + 1, 
              last_downloaded_at = NOW()
          WHERE id = ${existing[0].id}
        `;
      } else {
        // Create new download record
        const downloadId = `dl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        await sql`
          INSERT INTO downloads (id, user_id, book_id, download_type, download_count, downloaded_at, last_downloaded_at)
          VALUES (${downloadId}, ${userId}, ${bookId}, ${downloadType}, 1, NOW(), NOW())
        `;
      }
      
      // Increment book's total download count
      await sql`
        UPDATE books 
        SET downloads = downloads + 1, updated_at = NOW()
        WHERE id = ${bookId}
      `;
      
      console.log('✅ Download recorded successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Error recording download:', error);
      return { success: false, error: error.message };
    }
  },

  // Get download stats for user
  async getUserStats(userId) {
    try {
      const stats = await sql`
        SELECT 
          COUNT(DISTINCT book_id) as unique_books,
          SUM(download_count) as total_downloads,
          COUNT(CASE WHEN download_type = 'pdf' THEN 1 END) as pdf_downloads,
          COUNT(CASE WHEN download_type = 'audio' THEN 1 END) as audio_downloads
        FROM downloads 
        WHERE user_id = ${userId}
      `;
      
      return stats[0] || {
        unique_books: 0,
        total_downloads: 0,
        pdf_downloads: 0,
        audio_downloads: 0
      };
    } catch (error) {
      console.error('❌ Error getting user stats:', error);
      return {
        unique_books: 0,
        total_downloads: 0,
        pdf_downloads: 0,
        audio_downloads: 0
      };
    }
  },

  // Get popular downloads (for admin)
  async getPopularDownloads(limit = 10) {
    try {
      const popular = await sql`
        SELECT b.id, b.title, b.author, b.cover_file_url, b.downloads,
               COUNT(d.id) as user_downloads
        FROM books b
        LEFT JOIN downloads d ON b.id = d.book_id
        GROUP BY b.id, b.title, b.author, b.cover_file_url, b.downloads
        ORDER BY b.downloads DESC, user_downloads DESC
        LIMIT ${limit}
      `;
      
      return popular;
    } catch (error) {
      console.error('❌ Error getting popular downloads:', error);
      return [];
    }
  }
};
