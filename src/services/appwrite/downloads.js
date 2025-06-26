import { 
    databases, 
    DATABASE_ID, 
    DOWNLOADS_COLLECTION_ID,
    Query
} from '../../lib/appwrite';
import { ID } from 'appwrite';
import { booksService } from './books';

export class DownloadsService {
    // Record a download
    async recordDownload(userId, bookId, downloadType = 'pdf') {
        try {
            // Check if user has already downloaded this book
            const existingDownload = await this.getUserBookDownload(userId, bookId);
            
            if (existingDownload) {
                // Update existing download record
                const updatedDownload = await databases.updateDocument(
                    DATABASE_ID,
                    DOWNLOADS_COLLECTION_ID,
                    existingDownload.$id,
                    {
                        downloadCount: (existingDownload.downloadCount || 1) + 1,
                        lastDownloadedAt: new Date().toISOString(),
                        downloadType
                    }
                );

                // Increment book's download count
                await booksService.incrementDownloads(bookId);

                return updatedDownload;
            } else {
                // Create new download record
                const download = await databases.createDocument(
                    DATABASE_ID,
                    DOWNLOADS_COLLECTION_ID,
                    ID.unique(),
                    {
                        userId,
                        bookId,
                        downloadType,
                        downloadCount: 1,
                        downloadedAt: new Date().toISOString(),
                        lastDownloadedAt: new Date().toISOString()
                    }
                );

                // Increment book's download count
                await booksService.incrementDownloads(bookId);

                return download;
            }
        } catch (error) {
            console.error('Error recording download:', error);
            throw new Error('Failed to record download');
        }
    }

    // Get user's downloads
    async getUserDownloads(userId) {
        try {
            const downloads = await databases.listDocuments(
                DATABASE_ID,
                DOWNLOADS_COLLECTION_ID,
                [
                    Query.equal('userId', userId),
                    Query.orderDesc('lastDownloadedAt')
                ]
            );

            // Get book details for each download
            const downloadedBooks = await Promise.all(
                downloads.documents.map(async (download) => {
                    try {
                        const book = await booksService.getBook(download.bookId);
                        return {
                            ...book,
                            downloadId: download.$id,
                            downloadedAt: download.downloadedAt,
                            lastDownloadedAt: download.lastDownloadedAt,
                            downloadCount: download.downloadCount || 1,
                            downloadType: download.downloadType
                        };
                    } catch (error) {
                        // Book might have been deleted
                        console.warn(`Book ${download.bookId} not found, removing from downloads`);
                        await this.removeDownload(download.$id);
                        return null;
                    }
                })
            );

            // Filter out null values (deleted books)
            return downloadedBooks.filter(book => book !== null);
        } catch (error) {
            console.error('Error fetching user downloads:', error);
            throw new Error('Failed to fetch downloads');
        }
    }

    // Get specific user book download
    async getUserBookDownload(userId, bookId) {
        try {
            const downloads = await databases.listDocuments(
                DATABASE_ID,
                DOWNLOADS_COLLECTION_ID,
                [
                    Query.equal('userId', userId),
                    Query.equal('bookId', bookId)
                ]
            );

            return downloads.documents.length > 0 ? downloads.documents[0] : null;
        } catch (error) {
            console.error('Error fetching user book download:', error);
            return null;
        }
    }

    // Check if user has downloaded a book
    async hasUserDownloaded(userId, bookId) {
        try {
            const download = await this.getUserBookDownload(userId, bookId);
            return download !== null;
        } catch (error) {
            console.error('Error checking download status:', error);
            return false;
        }
    }

    // Remove download record
    async removeDownload(downloadId) {
        try {
            await databases.deleteDocument(
                DATABASE_ID,
                DOWNLOADS_COLLECTION_ID,
                downloadId
            );

            return { success: true };
        } catch (error) {
            console.error('Error removing download:', error);
            throw new Error('Failed to remove download');
        }
    }

    // Get download statistics
    async getDownloadStats() {
        try {
            const downloads = await databases.listDocuments(
                DATABASE_ID,
                DOWNLOADS_COLLECTION_ID
            );

            const stats = {
                totalDownloads: downloads.total,
                uniqueUsers: new Set(downloads.documents.map(d => d.userId)).size,
                uniqueBooks: new Set(downloads.documents.map(d => d.bookId)).size,
                downloadsByType: {},
                recentDownloads: []
            };

            // Count downloads by type
            downloads.documents.forEach(download => {
                const type = download.downloadType || 'pdf';
                stats.downloadsByType[type] = (stats.downloadsByType[type] || 0) + (download.downloadCount || 1);
            });

            // Get recent downloads (last 10)
            const recentDownloads = downloads.documents
                .sort((a, b) => new Date(b.lastDownloadedAt) - new Date(a.lastDownloadedAt))
                .slice(0, 10);

            stats.recentDownloads = await Promise.all(
                recentDownloads.map(async (download) => {
                    try {
                        const book = await booksService.getBook(download.bookId);
                        return {
                            bookTitle: book.title,
                            bookAuthor: book.author,
                            downloadedAt: download.lastDownloadedAt,
                            downloadType: download.downloadType,
                            userId: download.userId
                        };
                    } catch (error) {
                        return null;
                    }
                })
            );

            stats.recentDownloads = stats.recentDownloads.filter(d => d !== null);

            return stats;
        } catch (error) {
            console.error('Error fetching download stats:', error);
            throw new Error('Failed to fetch download statistics');
        }
    }

    // Get most downloaded books
    async getMostDownloadedBooks(limit = 10) {
        try {
            const downloads = await databases.listDocuments(
                DATABASE_ID,
                DOWNLOADS_COLLECTION_ID
            );

            // Count downloads per book
            const bookDownloads = {};
            downloads.documents.forEach(download => {
                const count = download.downloadCount || 1;
                bookDownloads[download.bookId] = (bookDownloads[download.bookId] || 0) + count;
            });

            // Sort by download count
            const sortedBooks = Object.entries(bookDownloads)
                .sort(([,a], [,b]) => b - a)
                .slice(0, limit);

            // Get book details
            const popularBooks = await Promise.all(
                sortedBooks.map(async ([bookId, downloadCount]) => {
                    try {
                        const book = await booksService.getBook(bookId);
                        return {
                            ...book,
                            totalDownloads: downloadCount
                        };
                    } catch (error) {
                        return null;
                    }
                })
            );

            return popularBooks.filter(book => book !== null);
        } catch (error) {
            console.error('Error fetching most downloaded books:', error);
            throw new Error('Failed to fetch popular downloads');
        }
    }

    // Get user download count
    async getUserDownloadCount(userId) {
        try {
            const downloads = await databases.listDocuments(
                DATABASE_ID,
                DOWNLOADS_COLLECTION_ID,
                [Query.equal('userId', userId)]
            );

            return downloads.total;
        } catch (error) {
            console.error('Error getting user download count:', error);
            return 0;
        }
    }

    // Clear user downloads
    async clearUserDownloads(userId) {
        try {
            const downloads = await databases.listDocuments(
                DATABASE_ID,
                DOWNLOADS_COLLECTION_ID,
                [Query.equal('userId', userId)]
            );

            await Promise.all(
                downloads.documents.map(download =>
                    databases.deleteDocument(
                        DATABASE_ID,
                        DOWNLOADS_COLLECTION_ID,
                        download.$id
                    )
                )
            );

            return { success: true, count: downloads.documents.length };
        } catch (error) {
            console.error('Error clearing user downloads:', error);
            throw new Error('Failed to clear downloads');
        }
    }
}

export const downloadsService = new DownloadsService();
