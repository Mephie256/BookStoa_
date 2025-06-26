// API service using Appwrite backend
import { booksService } from './appwrite/books';
import { authService } from './appwrite/auth';
import { favoritesService } from './appwrite/favorites';
import { downloadsService } from './appwrite/downloads';

// Demo book data with high-quality cover images
export const demoBooks = [
  {
    id: '1',
    title: 'The Purpose Driven Life',
    author: 'Rick Warren',
    description: 'The Purpose Driven Life is a book written by Christian pastor Rick Warren. The book has sold more than 30 million copies, making it one of the best-selling non-fiction books in history.',
    fullDescription: 'This groundbreaking manifesto on the meaning of life has inspired millions of readers worldwide. Rick Warren takes you on a personal journey of discovery, helping you understand God\'s incredible plan for your life both here and now, and for eternity.',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780310205715-L.jpg',
    rating: 4.8,
    totalRatings: 1247,
    pdfUrl: '/uploads/purpose-driven-life.pdf',
    audioLink: 'https://example.com/audio/purpose-driven-life.mp4',
    createdAt: '2024-01-15',
    genre: 'Christian Living',
    pages: 334,
    language: 'English',
    publisher: 'Zondervan',
    downloads: 1247,
    isbn: '9780310205715',
    featured: true
  },
  {
    id: '2',
    title: 'Jesus Calling',
    author: 'Sarah Young',
    description: 'Jesus Calling is a devotional filled with uniquely inspired treasures from heaven for every day of the year.',
    fullDescription: 'After many years of writing in her prayer journal, missionary Sarah Young decided to listen to God with pen in hand, writing down whatever she believed He was saying to her.',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9781591451884-L.jpg',
    rating: 4.9,
    totalRatings: 2156,
    pdfUrl: '/uploads/jesus-calling.pdf',
    audioLink: null,
    createdAt: '2024-01-10',
    genre: 'Devotional',
    pages: 400,
    language: 'English',
    publisher: 'Thomas Nelson',
    downloads: 892,
    isbn: '9781591451884',
    featured: true
  },
  {
    id: '3',
    title: 'Mere Christianity',
    author: 'C.S. Lewis',
    description: 'Mere Christianity is a theological book by C. S. Lewis, adapted from a series of BBC radio talks made between 1941 and 1944.',
    fullDescription: 'In the classic Mere Christianity, C.S. Lewis, the most important writer of the 20th century, explores the common ground upon which all of those of Christian faith stand together.',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780060652920-L.jpg',
    rating: 4.7,
    totalRatings: 1834,
    pdfUrl: '/uploads/mere-christianity.pdf',
    audioLink: 'https://example.com/audio/mere-christianity.mp4',
    createdAt: '2024-01-05',
    genre: 'Theology',
    pages: 227,
    language: 'English',
    publisher: 'HarperOne',
    downloads: 756,
    isbn: '9780060652920',
    featured: false
  },
  {
    id: '4',
    title: 'The Case for Christ',
    author: 'Lee Strobel',
    description: 'A journalist\'s personal investigation of the evidence for Jesus.',
    fullDescription: 'Is there credible evidence that Jesus of Nazareth really is the Son of God? Retracing his own spiritual journey from atheism to faith, Lee Strobel, former legal editor of the Chicago Tribune, cross-examines a dozen experts with doctorates.',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780310226956-L.jpg',
    rating: 4.6,
    totalRatings: 1456,
    pdfUrl: '/uploads/case-for-christ.pdf',
    audioLink: null,
    createdAt: '2024-01-20',
    genre: 'Apologetics',
    pages: 360,
    language: 'English',
    publisher: 'Zondervan',
    downloads: 623
  },
  {
    id: '5',
    title: 'Crazy Love',
    author: 'Francis Chan',
    description: 'Francis Chan asks: Have you ever wondered if we\'re missing it?',
    fullDescription: 'It is easy to get caught up in church activity and miss the radical nature of our faith. In Crazy Love, Francis Chan reminds us that God is holy, and calls us to a life that\'s anything but ordinary.',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9781434764317-L.jpg',
    rating: 4.8,
    totalRatings: 1789,
    pdfUrl: '/uploads/crazy-love.pdf',
    audioLink: 'https://example.com/audio/crazy-love.mp4',
    createdAt: '2024-01-18',
    genre: 'Christian Living',
    pages: 208,
    language: 'English',
    publisher: 'David C Cook',
    downloads: 945
  },
  {
    id: '6',
    title: 'The Screwtape Letters',
    author: 'C.S. Lewis',
    description: 'A masterpiece of satire, this classic has entertained and enlightened readers the world over with its sly and ironic portrayal of human life from the vantage point of Screwtape.',
    fullDescription: 'The Screwtape Letters by C.S. Lewis is a classic masterpiece of religious satire that entertains readers with its sly and ironic portrayal of human life and foibles from the vantage point of Screwtape, a highly placed assistant to "Our Father Below."',
    coverUrl: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1374085330i/17253.jpg',
    rating: 4.5,
    totalRatings: 1234,
    pdfUrl: '/uploads/screwtape-letters.pdf',
    audioLink: 'https://example.com/audio/screwtape-letters.mp4',
    createdAt: '2024-01-12',
    genre: 'Christian Fiction',
    pages: 175,
    language: 'English',
    publisher: 'HarperOne',
    downloads: 567
  },
  {
    id: '7',
    title: 'The Pilgrim\'s Progress',
    author: 'John Bunyan',
    description: 'The Pilgrim\'s Progress is a Christian allegory written by John Bunyan and published in February 1678.',
    fullDescription: 'This famous story of a man named Christian and his journey from his hometown, the "City of Destruction," to the "Celestial City" atop Mount Zion has become one of the most significant works of religious English literature.',
    coverUrl: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327872146i/29797.jpg',
    rating: 4.4,
    totalRatings: 987,
    pdfUrl: '/uploads/pilgrims-progress.pdf',
    audioLink: 'https://example.com/audio/pilgrims-progress.mp4',
    createdAt: '2024-01-08',
    genre: 'Christian Allegory',
    pages: 324,
    language: 'English',
    publisher: 'Various',
    downloads: 432
  },
  {
    id: '8',
    title: 'The Cost of Discipleship',
    author: 'Dietrich Bonhoeffer',
    description: 'The Cost of Discipleship is a book by the German theologian Dietrich Bonhoeffer, considered a classic of Christian thought.',
    fullDescription: 'Bonhoeffer\'s attempt to follow Christ faithfully in the midst of the turmoil of World War II led to his death at the hands of the Nazis, but not before he demonstrated the ultimate cost of discipleship.',
    coverUrl: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1348932089i/92307.jpg',
    rating: 4.6,
    totalRatings: 1123,
    pdfUrl: '/uploads/cost-of-discipleship.pdf',
    audioLink: null,
    createdAt: '2024-01-06',
    genre: 'Theology',
    pages: 352,
    language: 'English',
    publisher: 'Touchstone',
    downloads: 678
  },
  {
    id: '9',
    title: 'My Utmost for His Highest',
    author: 'Oswald Chambers',
    description: 'My Utmost for His Highest is a Christian devotional book by Oswald Chambers that compiles his teachings.',
    fullDescription: 'For over seventy years, this beautiful devotional has been a source of strength and inspiration to millions of Christians around the world. Each daily reading contains a Scripture verse, a short reading for the day, and a prayer.',
    coverUrl: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1320552628i/8186808.jpg',
    rating: 4.8,
    totalRatings: 1567,
    pdfUrl: '/uploads/my-utmost.pdf',
    audioLink: 'https://example.com/audio/my-utmost.mp4',
    createdAt: '2024-01-04',
    genre: 'Devotional',
    pages: 416,
    language: 'English',
    publisher: 'Discovery House',
    downloads: 823
  },
  {
    id: '10',
    title: 'Desiring God',
    author: 'John Piper',
    description: 'Desiring God is a book by John Piper that presents his philosophy of Christian hedonism.',
    fullDescription: 'Scripture reveals that the great business of life is to glorify God by enjoying Him forever. In this paradigm-shattering classic, John Piper reveals that the debate between duty and delight doesn\'t truly exist.',
    coverUrl: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1266815746i/6827756.jpg',
    rating: 4.7,
    totalRatings: 1345,
    pdfUrl: '/uploads/desiring-god.pdf',
    audioLink: 'https://example.com/audio/desiring-god.mp4',
    createdAt: '2024-01-02',
    genre: 'Christian Living',
    pages: 368,
    language: 'English',
    publisher: 'Multnomah',
    downloads: 756
  }
];

// Demo users
export const demoUsers = [
  {
    id: '1',
    email: 'john.doe@example.com',
    createdAt: '2024-01-20'
  },
  {
    id: '2',
    email: 'jane.smith@example.com',
    createdAt: '2024-01-18'
  },
  {
    id: '3',
    email: 'mike.johnson@example.com',
    createdAt: '2024-01-15'
  },
  {
    id: '4',
    email: 'sarah.wilson@example.com',
    createdAt: '2024-01-12'
  },
  {
    id: '5',
    email: 'david.brown@example.com',
    createdAt: '2024-01-10'
  }
];

// Main API functions using Appwrite services
export const api = {
  // Authentication
  auth: {
    login: authService.login.bind(authService),
    logout: authService.logout.bind(authService),
    register: authService.createAccount.bind(authService),
    getCurrentUser: authService.getCurrentUser.bind(authService),
    isAdmin: authService.isAdmin.bind(authService),
    resetPassword: authService.resetPassword.bind(authService),
    completePasswordReset: authService.completePasswordReset.bind(authService)
  },

  // Books
  getBooks: async (filters = {}) => {
    try {
      const result = await booksService.getBooks(filters);
      return result.books;
    } catch (error) {
      console.warn('Appwrite error, falling back to demo data:', error);
      return demoBooks;
    }
  },

  getBook: async (id) => {
    try {
      return await booksService.getBook(id);
    } catch (error) {
      console.warn('Appwrite error, falling back to demo data:', error);
      return demoBooks.find(book => book.id === id);
    }
  },

  searchBooks: async (query, filters = {}) => {
    try {
      const result = await booksService.searchBooks(query, filters);
      return result.books;
    } catch (error) {
      console.warn('Appwrite error, falling back to demo search:', error);
      return demoBooks.filter(book =>
        book.title.toLowerCase().includes(query.toLowerCase()) ||
        book.author.toLowerCase().includes(query.toLowerCase()) ||
        book.description.toLowerCase().includes(query.toLowerCase())
      );
    }
  },

  getFeaturedBooks: async (limit = 6) => {
    try {
      const result = await booksService.getFeaturedBooks(limit);
      return result.books;
    } catch (error) {
      console.warn('Appwrite error, falling back to demo data:', error);
      return demoBooks.filter(book => book.featured).slice(0, limit);
    }
  },

  getBestsellers: async (limit = 6) => {
    try {
      const result = await booksService.getBestsellers(limit);
      return result.books;
    } catch (error) {
      console.warn('Appwrite error, falling back to demo data:', error);
      return demoBooks.slice(0, limit);
    }
  },

  getNewReleases: async (limit = 6) => {
    try {
      const result = await booksService.getNewReleases(limit);
      return result.books;
    } catch (error) {
      console.warn('Appwrite error, falling back to demo data:', error);
      return demoBooks.slice(0, limit);
    }
  },

  // Admin functions
  uploadBook: async (bookData, pdfFile, coverFile) => {
    try {
      return await booksService.createBook(bookData, pdfFile, coverFile);
    } catch (error) {
      console.error('Error uploading book:', error);
      throw error;
    }
  },

  updateBook: async (bookId, updateData, pdfFile = null, coverFile = null) => {
    try {
      return await booksService.updateBook(bookId, updateData, pdfFile, coverFile);
    } catch (error) {
      console.error('Error updating book:', error);
      throw error;
    }
  },

  deleteBook: async (id) => {
    try {
      await booksService.deleteBook(id);
      return true;
    } catch (error) {
      console.error('Error deleting book:', error);
      throw error;
    }
  },

  getUsers: async () => {
    try {
      return await authService.getAllUsers();
    } catch (error) {
      console.warn('Appwrite error, falling back to demo data:', error);
      return demoUsers;
    }
  },

  getStats: async () => {
    try {
      const downloadStats = await downloadsService.getDownloadStats();
      const users = await authService.getAllUsers();
      const booksResult = await booksService.getBooks();

      return {
        totalBooks: booksResult.total,
        totalUsers: users.length,
        totalDownloads: downloadStats.totalDownloads,
        monthlyGrowth: 12.5 // This would need to be calculated based on actual data
      };
    } catch (error) {
      console.warn('Appwrite error, falling back to demo stats:', error);
      return {
        totalBooks: demoBooks.length,
        totalUsers: demoUsers.length,
        totalDownloads: demoBooks.reduce((sum, book) => sum + book.downloads, 0),
        monthlyGrowth: 12.5
      };
    }
  },

  // Favorites
  favorites: {
    add: favoritesService.addToFavorites.bind(favoritesService),
    remove: favoritesService.removeFromFavorites.bind(favoritesService),
    getUserFavorites: favoritesService.getUserFavorites.bind(favoritesService),
    toggle: favoritesService.toggleFavorite.bind(favoritesService),
    checkIfFavorite: favoritesService.checkIfFavorite.bind(favoritesService)
  },

  // Downloads
  downloads: {
    record: downloadsService.recordDownload.bind(downloadsService),
    getUserDownloads: downloadsService.getUserDownloads.bind(downloadsService),
    hasUserDownloaded: downloadsService.hasUserDownloaded.bind(downloadsService),
    getStats: downloadsService.getDownloadStats.bind(downloadsService),
    getMostDownloaded: downloadsService.getMostDownloadedBooks.bind(downloadsService)
  }
};

// External book APIs (for future integration)
export const externalBookAPIs = {
  // Google Books API
  searchGoogleBooks: async (query) => {
    try {
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10`);
      const data = await response.json();
      return data.items?.map(item => ({
        id: item.id,
        title: item.volumeInfo.title,
        author: item.volumeInfo.authors?.join(', ') || 'Unknown',
        description: item.volumeInfo.description || 'No description available',
        coverUrl: item.volumeInfo.imageLinks?.thumbnail || '',
        publisher: item.volumeInfo.publisher || 'Unknown',
        publishedDate: item.volumeInfo.publishedDate || '',
        pageCount: item.volumeInfo.pageCount || 0,
        categories: item.volumeInfo.categories || [],
        language: item.volumeInfo.language || 'en'
      })) || [];
    } catch (error) {
      console.error('Error fetching from Google Books API:', error);
      return [];
    }
  },

  // Open Library API
  searchOpenLibrary: async (query) => {
    try {
      const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=10`);
      const data = await response.json();
      return data.docs?.map(doc => ({
        id: doc.key,
        title: doc.title,
        author: doc.author_name?.join(', ') || 'Unknown',
        coverUrl: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : '',
        publishedDate: doc.first_publish_year || '',
        publisher: doc.publisher?.[0] || 'Unknown',
        isbn: doc.isbn?.[0] || ''
      })) || [];
    } catch (error) {
      console.error('Error fetching from Open Library API:', error);
      return [];
    }
  }
};

export default api;
