// Real library service that works with Neon database
import { neon } from '@neondatabase/serverless';

const sql = neon(import.meta.env.VITE_DATABASE_URL || process.env.DATABASE_URL);

export const libraryService = {
  // Get user's personal library
  async getUserLibrary(userId) {
    try {
      console.log('📚 Getting library for user:', userId);

      const library = await sql`
        SELECT l.id, l.added_at, l.reading_status, l.progress, l.notes,
               b.id as book_id, b.title, b.author, b.description, b.genre, b.category,
               b.cover_file_url, b.rating, b.total_ratings, b.downloads,
               b.pdf_file_url, b.audio_link, b.pages, b.language, b.publisher,
               b.published_date
        FROM library l
        JOIN books b ON l.book_id = b.id
        WHERE l.user_id = ${userId}
        ORDER BY l.added_at DESC
      `;

      console.log('📚 Found library books:', library.length);
      return library;
    } catch (error) {
      console.error('❌ Error getting user library:', error);
      return [];
    }
  },

  // Add book to user's library
  async addToLibrary(userId, bookId, readingStatus = 'want_to_read') {
    try {
      console.log('📚 Adding to library:', { userId, bookId, readingStatus });

      // Check if already exists
      const existing = await sql`
        SELECT id, reading_status FROM library
        WHERE user_id = ${userId} AND book_id = ${bookId}
      `;

      if (existing.length > 0) {
        // If book exists and new status is 'visited', only update if current status is also 'visited'
        // This prevents overriding intentional statuses like 'reading', 'completed', etc.
        if (readingStatus === 'visited' && existing[0].reading_status !== 'visited') {
          console.log('📚 Book already in library with status:', existing[0].reading_status);
          return { success: true, message: 'Book already in library with higher priority status' };
        }

        // If it's the same status or we're updating to a non-visited status, update it
        if (readingStatus !== 'visited' || existing[0].reading_status === 'visited') {
          await sql`
            UPDATE library
            SET reading_status = ${readingStatus}, added_at = NOW()
            WHERE user_id = ${userId} AND book_id = ${bookId}
          `;
          console.log('✅ Library entry updated successfully');
          return { success: true, message: 'Library entry updated' };
        }

        return { success: true, message: 'Book already in library' };
      }

      // Add to library
      const libraryId = `lib_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      await sql`
        INSERT INTO library (id, user_id, book_id, reading_status, progress, added_at)
        VALUES (${libraryId}, ${userId}, ${bookId}, ${readingStatus}, 0, NOW())
      `;

      console.log('✅ Book added to library successfully');
      return { success: true, message: 'Book added to library' };
    } catch (error) {
      console.error('❌ Error adding to library:', error);
      return { success: false, error: error.message };
    }
  },

  // Remove book from library
  async removeFromLibrary(userId, bookId) {
    try {
      console.log('🗑️ Removing from library:', { userId, bookId });

      const result = await sql`
        DELETE FROM library
        WHERE user_id = ${userId} AND book_id = ${bookId}
        RETURNING id
      `;

      if (result.length > 0) {
        console.log('✅ Book removed from library successfully');
        return { success: true };
      } else {
        return { success: false, error: 'Book not found in library' };
      }
    } catch (error) {
      console.error('❌ Error removing from library:', error);
      return { success: false, error: error.message };
    }
  },

  // Update reading status
  async updateReadingStatus(userId, bookId, readingStatus, progress = 0) {
    try {
      console.log('📖 Updating reading status:', { userId, bookId, readingStatus, progress });

      const result = await sql`
        UPDATE library
        SET reading_status = ${readingStatus},
            progress = ${progress},
            updated_at = NOW()
        WHERE user_id = ${userId} AND book_id = ${bookId}
        RETURNING id
      `;

      if (result.length > 0) {
        console.log('✅ Reading status updated successfully');
        return { success: true };
      } else {
        return { success: false, error: 'Book not found in library' };
      }
    } catch (error) {
      console.error('❌ Error updating reading status:', error);
      return { success: false, error: error.message };
    }
  },

  // Check if book is in user's library
  async isInLibrary(userId, bookId) {
    try {
      const result = await sql`
        SELECT id, reading_status FROM library
        WHERE user_id = ${userId} AND book_id = ${bookId}
      `;

      return {
        inLibrary: result.length > 0,
        readingStatus: result.length > 0 ? result[0].reading_status : null
      };
    } catch (error) {
      console.error('❌ Error checking library:', error);
      return { inLibrary: false, readingStatus: null };
    }
  },

  // Get library stats
  async getLibraryStats(userId) {
    try {
      const stats = await sql`
        SELECT
          COUNT(*) as total_books,
          COUNT(CASE WHEN reading_status = 'reading' THEN 1 END) as currently_reading,
          COUNT(CASE WHEN reading_status = 'completed' THEN 1 END) as completed,
          COUNT(CASE WHEN reading_status = 'want_to_read' THEN 1 END) as want_to_read,
          COUNT(CASE WHEN reading_status = 'paused' THEN 1 END) as paused
        FROM library
        WHERE user_id = ${userId}
      `;

      return stats[0] || {
        total_books: 0,
        currently_reading: 0,
        completed: 0,
        want_to_read: 0,
        paused: 0
      };
    } catch (error) {
      console.error('❌ Error getting library stats:', error);
      return {
        total_books: 0,
        currently_reading: 0,
        completed: 0,
        want_to_read: 0,
        paused: 0
      };
    }
  },

  // Get books by reading status
  async getBooksByStatus(userId, readingStatus) {
    try {
      const books = await sql`
        SELECT l.id, l.added_at, l.reading_status, l.progress, l.notes,
               b.id as book_id, b.title, b.author, b.description, b.genre, b.category,
               b.cover_file_url, b.rating, b.total_ratings, b.downloads,
               b.pdf_file_url, b.audio_link, b.pages, b.language, b.publisher
        FROM library l
        JOIN books b ON l.book_id = b.id
        WHERE l.user_id = ${userId} AND l.reading_status = ${readingStatus}
        ORDER BY l.added_at DESC
      `;

      return books;
    } catch (error) {
      console.error('❌ Error getting books by status:', error);
      return [];
    }
  }
};
