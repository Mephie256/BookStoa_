// Real books service that works with Neon database
import { neon } from '@neondatabase/serverless';

const sql = neon(import.meta.env.VITE_DATABASE_URL || process.env.DATABASE_URL);

export const booksService = {
  // Get all books with optional filters
  async getAll(filters = {}) {
    try {
      console.log('📚 Getting books from database with filters:', filters);

      // Simple query to get all books first
      const books = await sql`
        SELECT id, title, author, description, full_description, genre, category, tags,
               publisher, published_date, isbn, language, pages, rating, total_ratings,
               downloads, audio_link, preview_link, pdf_file_url, pdf_file_id,
               cover_file_url, cover_file_id, featured, bestseller, new_release,
               is_free, price, created_at, updated_at
        FROM books
        ORDER BY created_at DESC
      `;

      console.log('📚 Found books in database:', books.length);

      let filteredBooks = books;

      // Apply filters in JavaScript for now
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredBooks = filteredBooks.filter(book =>
          book.title?.toLowerCase().includes(searchTerm) ||
          book.author?.toLowerCase().includes(searchTerm) ||
          book.description?.toLowerCase().includes(searchTerm)
        );
      }

      if (filters.genre) {
        filteredBooks = filteredBooks.filter(book => book.genre === filters.genre);
      }

      if (filters.category) {
        filteredBooks = filteredBooks.filter(book => book.category === filters.category);
      }

      if (filters.featured === 'true') {
        filteredBooks = filteredBooks.filter(book => book.featured === true);
      }

      if (filters.bestseller === 'true') {
        filteredBooks = filteredBooks.filter(book => book.bestseller === true);
      }

      if (filters.newRelease === 'true') {
        filteredBooks = filteredBooks.filter(book => book.new_release === true);
      }

      // Apply limit and offset
      if (filters.limit) {
        const limit = parseInt(filters.limit);
        const offset = parseInt(filters.offset) || 0;
        filteredBooks = filteredBooks.slice(offset, offset + limit);
      }

      return {
        books: filteredBooks.map(book => ({
          ...book,
          tags: book.tags ? book.tags.split(',').filter(tag => tag.trim()) : []
        })),
        total: filteredBooks.length
      };
    } catch (error) {
      console.error('❌ Error getting books from database:', error);
      // Return empty array instead of throwing
      return { books: [], total: 0 };
    }
  },

  // Get single book by ID
  async getById(id) {
    try {
      const books = await sql`
        SELECT id, title, author, description, full_description, genre, category, tags,
               publisher, published_date, isbn, language, pages, rating, total_ratings,
               downloads, audio_link, preview_link, pdf_file_url, pdf_file_id,
               cover_file_url, cover_file_id, featured, bestseller, new_release,
               is_free, price, created_at, updated_at
        FROM books
        WHERE id = ${id}
      `;

      if (books.length > 0) {
        const book = books[0];
        return {
          ...book,
          tags: book.tags ? book.tags.split(',').filter(tag => tag.trim()) : []
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting book by ID:', error);
      throw error;
    }
  },

  // Create new book
  async create(bookData) {
    try {
      const bookId = `book_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const isFree =
        typeof bookData.is_free === 'boolean'
          ? bookData.is_free
          : typeof bookData.isFree === 'boolean'
            ? bookData.isFree
            : true;

      const price = isFree ? 0 : (parseInt(bookData.price) || 0);

      const newBook = await sql`
        INSERT INTO books (
          id, title, author, description, full_description, genre, category, tags,
          publisher, published_date, isbn, language, pages, rating, total_ratings,
          downloads, audio_link, preview_link, pdf_file_url, pdf_file_id,
          cover_file_url, cover_file_id, featured, bestseller, new_release,
          is_free, price, created_at, updated_at
        ) VALUES (
          ${bookId}, ${bookData.title}, ${bookData.author}, ${bookData.description},
          ${bookData.fullDescription || bookData.full_description}, ${bookData.genre},
          ${bookData.category}, ${bookData.tags}, ${bookData.publisher},
          ${bookData.publishedDate || bookData.published_date}, ${bookData.isbn},
          ${bookData.language}, ${bookData.pages}, ${bookData.rating},
          ${bookData.totalRatings || bookData.total_ratings}, ${bookData.downloads || 0},
          ${bookData.audioLink || bookData.audio_link}, ${bookData.previewLink || bookData.preview_link},
          ${bookData.pdfFileUrl || bookData.pdf_file_url}, ${bookData.pdfFileId || bookData.pdf_file_id},
          ${bookData.coverFileUrl || bookData.cover_file_url}, ${bookData.coverFileId || bookData.cover_file_id},
          ${bookData.featured || false}, ${bookData.bestseller || false}, ${bookData.newRelease || bookData.new_release || false},
          ${isFree}, ${price},
          NOW(), NOW()
        )
        RETURNING *
      `;

      if (newBook.length > 0) {
        const book = newBook[0];
        return {
          success: true,
          book: {
            ...book,
            tags: book.tags ? book.tags.split(',').filter(tag => tag.trim()) : []
          }
        };
      } else {
        return { success: false, error: 'Failed to create book' };
      }
    } catch (error) {
      console.error('Error creating book:', error);
      return { success: false, error: error.message };
    }
  },

  // Update book
  async update(id, bookData) {
    try {
      const isFreeParam =
        typeof bookData.is_free === 'boolean'
          ? bookData.is_free
          : typeof bookData.isFree === 'boolean'
            ? bookData.isFree
            : null;

      const priceParam = Number.isFinite(Number(bookData.price)) ? parseInt(bookData.price) : null;

      const updatedBook = await sql`
        UPDATE books SET
          title = ${bookData.title},
          author = ${bookData.author},
          description = ${bookData.description},
          full_description = ${bookData.fullDescription || bookData.full_description},
          genre = ${bookData.genre},
          category = ${bookData.category},
          tags = ${bookData.tags},
          publisher = ${bookData.publisher},
          published_date = ${bookData.publishedDate || bookData.published_date},
          isbn = ${bookData.isbn},
          language = ${bookData.language},
          pages = ${bookData.pages},
          rating = ${bookData.rating},
          total_ratings = ${bookData.totalRatings || bookData.total_ratings},
          audio_link = ${bookData.audioLink || bookData.audio_link},
          preview_link = ${bookData.previewLink || bookData.preview_link},
          pdf_file_url = ${bookData.pdfFileUrl || bookData.pdf_file_url},
          pdf_file_id = ${bookData.pdfFileId || bookData.pdf_file_id},
          cover_file_url = ${bookData.coverFileUrl || bookData.cover_file_url},
          cover_file_id = ${bookData.coverFileId || bookData.cover_file_id},
          is_free = COALESCE(${isFreeParam}, is_free),
          price = COALESCE(${priceParam}, price),
          featured = ${bookData.featured},
          bestseller = ${bookData.bestseller},
          new_release = ${bookData.newRelease || bookData.new_release},
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;

      if (updatedBook.length > 0) {
        const book = updatedBook[0];
        return {
          success: true,
          book: {
            ...book,
            tags: book.tags ? book.tags.split(',').filter(tag => tag.trim()) : []
          }
        };
      } else {
        return { success: false, error: 'Book not found' };
      }
    } catch (error) {
      console.error('Error updating book:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete book
  async delete(id) {
    try {
      const deletedBook = await sql`
        DELETE FROM books WHERE id = ${id}
        RETURNING id
      `;

      if (deletedBook.length > 0) {
        return { success: true };
      } else {
        return { success: false, error: 'Book not found' };
      }
    } catch (error) {
      console.error('Error deleting book:', error);
      return { success: false, error: error.message };
    }
  },

  // Increment download count
  async incrementDownload(id) {
    try {
      await sql`
        UPDATE books
        SET downloads = downloads + 1, updated_at = NOW()
        WHERE id = ${id}
      `;

      return { success: true };
    } catch (error) {
      console.error('Error incrementing download:', error);
      return { success: false, error: error.message };
    }
  },

  // Get featured books
  async getFeatured() {
    try {
      const result = await this.getAll({ featured: 'true', limit: 10 });
      return result.books;
    } catch (error) {
      console.error('Error getting featured books:', error);
      throw error;
    }
  },

  // Get bestsellers
  async getBestsellers() {
    try {
      const result = await this.getAll({ bestseller: 'true', limit: 10 });
      return result.books;
    } catch (error) {
      console.error('Error getting bestsellers:', error);
      throw error;
    }
  },

  // Get new releases
  async getNewReleases() {
    try {
      const result = await this.getAll({ newRelease: 'true', limit: 10 });
      return result.books;
    } catch (error) {
      console.error('Error getting new releases:', error);
      throw error;
    }
  }
};
