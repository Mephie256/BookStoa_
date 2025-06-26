import { 
    databases, 
    DATABASE_ID, 
    FAVORITES_COLLECTION_ID,
    Query
} from '../../lib/appwrite';
import { ID } from 'appwrite';
import { booksService } from './books';

export class FavoritesService {
    // Add book to favorites
    async addToFavorites(userId, bookId) {
        try {
            // Check if already in favorites
            const existing = await this.checkIfFavorite(userId, bookId);
            if (existing) {
                throw new Error('Book is already in favorites');
            }

            const favorite = await databases.createDocument(
                DATABASE_ID,
                FAVORITES_COLLECTION_ID,
                ID.unique(),
                {
                    userId,
                    bookId,
                    createdAt: new Date().toISOString()
                }
            );

            return favorite;
        } catch (error) {
            console.error('Error adding to favorites:', error);
            throw new Error(error.message || 'Failed to add to favorites');
        }
    }

    // Remove book from favorites
    async removeFromFavorites(userId, bookId) {
        try {
            const favorites = await databases.listDocuments(
                DATABASE_ID,
                FAVORITES_COLLECTION_ID,
                [
                    Query.equal('userId', userId),
                    Query.equal('bookId', bookId)
                ]
            );

            if (favorites.documents.length === 0) {
                throw new Error('Book not found in favorites');
            }

            await databases.deleteDocument(
                DATABASE_ID,
                FAVORITES_COLLECTION_ID,
                favorites.documents[0].$id
            );

            return { success: true };
        } catch (error) {
            console.error('Error removing from favorites:', error);
            throw new Error(error.message || 'Failed to remove from favorites');
        }
    }

    // Get user's favorite books
    async getUserFavorites(userId) {
        try {
            const favorites = await databases.listDocuments(
                DATABASE_ID,
                FAVORITES_COLLECTION_ID,
                [
                    Query.equal('userId', userId),
                    Query.orderDesc('createdAt')
                ]
            );

            // Get book details for each favorite
            const favoriteBooks = await Promise.all(
                favorites.documents.map(async (favorite) => {
                    try {
                        const book = await booksService.getBook(favorite.bookId);
                        return {
                            ...book,
                            favoriteId: favorite.$id,
                            favoritedAt: favorite.createdAt
                        };
                    } catch (error) {
                        // Book might have been deleted
                        console.warn(`Book ${favorite.bookId} not found, removing from favorites`);
                        await this.removeFromFavorites(userId, favorite.bookId);
                        return null;
                    }
                })
            );

            // Filter out null values (deleted books)
            return favoriteBooks.filter(book => book !== null);
        } catch (error) {
            console.error('Error fetching user favorites:', error);
            throw new Error('Failed to fetch favorites');
        }
    }

    // Check if book is in user's favorites
    async checkIfFavorite(userId, bookId) {
        try {
            const favorites = await databases.listDocuments(
                DATABASE_ID,
                FAVORITES_COLLECTION_ID,
                [
                    Query.equal('userId', userId),
                    Query.equal('bookId', bookId)
                ]
            );

            return favorites.documents.length > 0;
        } catch (error) {
            console.error('Error checking favorite status:', error);
            return false;
        }
    }

    // Toggle favorite status
    async toggleFavorite(userId, bookId) {
        try {
            const isFavorite = await this.checkIfFavorite(userId, bookId);
            
            if (isFavorite) {
                await this.removeFromFavorites(userId, bookId);
                return { isFavorite: false, message: 'Removed from favorites' };
            } else {
                await this.addToFavorites(userId, bookId);
                return { isFavorite: true, message: 'Added to favorites' };
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            throw new Error(error.message || 'Failed to toggle favorite');
        }
    }

    // Get favorite books count for a user
    async getFavoritesCount(userId) {
        try {
            const favorites = await databases.listDocuments(
                DATABASE_ID,
                FAVORITES_COLLECTION_ID,
                [Query.equal('userId', userId)]
            );

            return favorites.total;
        } catch (error) {
            console.error('Error getting favorites count:', error);
            return 0;
        }
    }

    // Get most favorited books (popular books)
    async getMostFavoritedBooks(limit = 10) {
        try {
            const favorites = await databases.listDocuments(
                DATABASE_ID,
                FAVORITES_COLLECTION_ID
            );

            // Count favorites per book
            const bookCounts = {};
            favorites.documents.forEach(favorite => {
                bookCounts[favorite.bookId] = (bookCounts[favorite.bookId] || 0) + 1;
            });

            // Sort by count and get top books
            const sortedBooks = Object.entries(bookCounts)
                .sort(([,a], [,b]) => b - a)
                .slice(0, limit);

            // Get book details
            const popularBooks = await Promise.all(
                sortedBooks.map(async ([bookId, count]) => {
                    try {
                        const book = await booksService.getBook(bookId);
                        return {
                            ...book,
                            favoritesCount: count
                        };
                    } catch (error) {
                        return null;
                    }
                })
            );

            return popularBooks.filter(book => book !== null);
        } catch (error) {
            console.error('Error fetching most favorited books:', error);
            throw new Error('Failed to fetch popular books');
        }
    }

    // Clear all favorites for a user
    async clearUserFavorites(userId) {
        try {
            const favorites = await databases.listDocuments(
                DATABASE_ID,
                FAVORITES_COLLECTION_ID,
                [Query.equal('userId', userId)]
            );

            await Promise.all(
                favorites.documents.map(favorite =>
                    databases.deleteDocument(
                        DATABASE_ID,
                        FAVORITES_COLLECTION_ID,
                        favorite.$id
                    )
                )
            );

            return { success: true, count: favorites.documents.length };
        } catch (error) {
            console.error('Error clearing user favorites:', error);
            throw new Error('Failed to clear favorites');
        }
    }
}

export const favoritesService = new FavoritesService();
