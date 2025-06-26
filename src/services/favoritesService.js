// Real favorites service that works with Neon database
import { neon } from '@neondatabase/serverless';

const sql = neon(import.meta.env.VITE_DATABASE_URL || process.env.DATABASE_URL);

export const favoritesService = {
  // Get user's favorites
  async getUserFavorites(userId) {
    try {
      console.log('❤️ Getting favorites for user:', userId);
      
      const favorites = await sql`
        SELECT f.id, f.created_at,
               b.id as book_id, b.title, b.author, b.description, b.genre, b.category,
               b.cover_file_url, b.rating, b.total_ratings, b.downloads,
               b.pdf_file_url, b.audio_link, b.pages, b.language, b.publisher
        FROM favorites f
        JOIN books b ON f.book_id = b.id
        WHERE f.user_id = ${userId}
        ORDER BY f.created_at DESC
      `;
      
      console.log('❤️ Found favorites:', favorites.length);
      return favorites;
    } catch (error) {
      console.error('❌ Error getting user favorites:', error);
      return [];
    }
  },

  // Add book to favorites
  async addFavorite(userId, bookId) {
    try {
      console.log('❤️ Adding favorite:', { userId, bookId });
      
      // Check if already exists
      const existing = await sql`
        SELECT id FROM favorites 
        WHERE user_id = ${userId} AND book_id = ${bookId}
      `;
      
      if (existing.length > 0) {
        return { success: false, error: 'Book already in favorites' };
      }
      
      // Add favorite
      const favoriteId = `fav_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await sql`
        INSERT INTO favorites (id, user_id, book_id, created_at)
        VALUES (${favoriteId}, ${userId}, ${bookId}, NOW())
      `;
      
      console.log('✅ Favorite added successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Error adding favorite:', error);
      return { success: false, error: error.message };
    }
  },

  // Remove book from favorites
  async removeFavorite(userId, bookId) {
    try {
      console.log('💔 Removing favorite:', { userId, bookId });
      
      const result = await sql`
        DELETE FROM favorites 
        WHERE user_id = ${userId} AND book_id = ${bookId}
        RETURNING id
      `;
      
      if (result.length > 0) {
        console.log('✅ Favorite removed successfully');
        return { success: true };
      } else {
        return { success: false, error: 'Favorite not found' };
      }
    } catch (error) {
      console.error('❌ Error removing favorite:', error);
      return { success: false, error: error.message };
    }
  },

  // Check if book is favorited by user
  async isFavorite(userId, bookId) {
    try {
      const result = await sql`
        SELECT id FROM favorites 
        WHERE user_id = ${userId} AND book_id = ${bookId}
      `;
      
      return { isFavorite: result.length > 0 };
    } catch (error) {
      console.error('❌ Error checking favorite:', error);
      return { isFavorite: false };
    }
  }
};
