import {
    databases,
    storage,
    DATABASE_ID,
    BOOKS_COLLECTION_ID,
    BOOKS_BUCKET_ID,
    COVERS_BUCKET_ID,
    Query,
    getFilePreview,
    getFileDownload
} from '../../lib/appwrite';
import { ID } from 'appwrite';
import { hybridStorage } from '../cloudflare/r2';

export class BooksService {
    // Create a new book
    async createBook(bookData, pdfFile, coverFile) {
        try {
            let pdfFileId = null;
            let pdfFileUrl = null;
            let coverFileId = null;
            let coverFileUrl = null;

            // Upload PDF file if provided using hybrid storage
            if (pdfFile) {
                const pdfUpload = await hybridStorage.uploadPDF(pdfFile);
                pdfFileId = pdfUpload.fileId;
                pdfFileUrl = pdfUpload.fileUrl;
            }

            // Upload cover image if provided using hybrid storage
            if (coverFile) {
                const coverUpload = await hybridStorage.uploadCoverImage(coverFile);
                coverFileId = coverUpload.fileId;
                coverFileUrl = coverUpload.fileUrl;
            }

            // Create book document
            const book = await databases.createDocument(
                DATABASE_ID,
                BOOKS_COLLECTION_ID,
                ID.unique(),
                {
                    ...bookData,
                    pdfFileId,
                    pdfFileUrl,
                    coverFileId,
                    coverFileUrl,
                    downloads: 0,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            );

            return this.formatBookResponse(book);
        } catch (error) {
            console.error('Error creating book:', error);
            throw new Error('Failed to create book');
        }
    }

    // Get all books with optional filters
    async getBooks(filters = {}) {
        try {
            const queries = [];

            // Add search query if provided
            if (filters.search) {
                queries.push(Query.search('title', filters.search));
            }

            // Add genre filter if provided
            if (filters.genre) {
                queries.push(Query.equal('genre', filters.genre));
            }

            // Add category filter if provided
            if (filters.category) {
                queries.push(Query.equal('category', filters.category));
            }

            // Add featured filter if provided
            if (filters.featured) {
                queries.push(Query.equal('featured', true));
            }

            // Add bestseller filter if provided
            if (filters.bestseller) {
                queries.push(Query.equal('bestseller', true));
            }

            // Add new release filter if provided
            if (filters.newRelease) {
                queries.push(Query.equal('newRelease', true));
            }

            // Add pagination
            if (filters.limit) {
                queries.push(Query.limit(filters.limit));
            }

            if (filters.offset) {
                queries.push(Query.offset(filters.offset));
            }

            // Order by creation date (newest first)
            queries.push(Query.orderDesc('createdAt'));

            const response = await databases.listDocuments(
                DATABASE_ID,
                BOOKS_COLLECTION_ID,
                queries
            );

            return {
                books: response.documents.map(book => this.formatBookResponse(book)),
                total: response.total
            };
        } catch (error) {
            console.error('Error fetching books:', error);
            throw new Error('Failed to fetch books');
        }
    }

    // Get a single book by ID
    async getBook(bookId) {
        try {
            const book = await databases.getDocument(
                DATABASE_ID,
                BOOKS_COLLECTION_ID,
                bookId
            );

            return this.formatBookResponse(book);
        } catch (error) {
            console.error('Error fetching book:', error);
            throw new Error('Book not found');
        }
    }

    // Update a book
    async updateBook(bookId, updateData, pdfFile = null, coverFile = null) {
        try {
            const updates = { ...updateData };

            // Upload new PDF file if provided using hybrid storage
            if (pdfFile) {
                const pdfUpload = await hybridStorage.uploadPDF(pdfFile);
                updates.pdfFileId = pdfUpload.fileId;
                updates.pdfFileUrl = pdfUpload.fileUrl;
            }

            // Upload new cover image if provided using hybrid storage
            if (coverFile) {
                const coverUpload = await hybridStorage.uploadCoverImage(coverFile);
                updates.coverFileId = coverUpload.fileId;
                updates.coverFileUrl = coverUpload.fileUrl;
            }

            updates.updatedAt = new Date().toISOString();

            const book = await databases.updateDocument(
                DATABASE_ID,
                BOOKS_COLLECTION_ID,
                bookId,
                updates
            );

            return this.formatBookResponse(book);
        } catch (error) {
            console.error('Error updating book:', error);
            throw new Error('Failed to update book');
        }
    }

    // Delete a book
    async deleteBook(bookId) {
        try {
            // Get book to access file IDs
            const book = await this.getBook(bookId);

            // Delete files from hybrid storage
            if (book.pdfFileId) {
                await hybridStorage.deleteFile(book.pdfFileId);
            }
            if (book.coverFileId) {
                await hybridStorage.deleteFile(book.coverFileId);
            }

            // Delete book document
            await databases.deleteDocument(
                DATABASE_ID,
                BOOKS_COLLECTION_ID,
                bookId
            );

            return { success: true };
        } catch (error) {
            console.error('Error deleting book:', error);
            throw new Error('Failed to delete book');
        }
    }

    // Increment download count
    async incrementDownloads(bookId) {
        try {
            const book = await this.getBook(bookId);
            const updatedBook = await databases.updateDocument(
                DATABASE_ID,
                BOOKS_COLLECTION_ID,
                bookId,
                {
                    downloads: (book.downloads || 0) + 1,
                    updatedAt: new Date().toISOString()
                }
            );

            return this.formatBookResponse(updatedBook);
        } catch (error) {
            console.error('Error incrementing downloads:', error);
            throw new Error('Failed to update download count');
        }
    }

    // Get featured books
    async getFeaturedBooks(limit = 6) {
        return this.getBooks({ featured: true, limit });
    }

    // Get bestsellers
    async getBestsellers(limit = 6) {
        return this.getBooks({ bestseller: true, limit });
    }

    // Get new releases
    async getNewReleases(limit = 6) {
        return this.getBooks({ newRelease: true, limit });
    }

    // Search books
    async searchBooks(searchTerm, filters = {}) {
        return this.getBooks({ ...filters, search: searchTerm });
    }

    // Format book response with file URLs
    formatBookResponse(book) {
        return {
            ...book,
            // Use stored URLs if available (from R2), otherwise generate Appwrite URLs
            coverUrl: book.coverFileUrl || (book.coverFileId ? getFilePreview(COVERS_BUCKET_ID, book.coverFileId) : null),
            pdfUrl: book.pdfFileUrl || (book.pdfFileId ? getFileDownload(BOOKS_BUCKET_ID, book.pdfFileId) : null),
            // Parse tags if they're stored as JSON string
            tags: typeof book.tags === 'string' ? JSON.parse(book.tags || '[]') : (book.tags || [])
        };
    }
}

export const booksService = new BooksService();
