// Demo data service for testing the new stack
// This will be replaced with real API calls once backend is set up

export const demoBooks = [
  {
    id: '1',
    title: 'The Purpose Driven Life',
    author: 'Rick Warren',
    description: 'The Purpose Driven Life is a book written by Christian pastor Rick Warren. The book has sold more than 30 million copies, making it one of the best-selling non-fiction books in history.',
    fullDescription: 'This groundbreaking manifesto on the meaning of life has inspired millions of readers worldwide. Rick Warren takes you on a personal journey of discovery, helping you understand God\'s incredible plan for your life both here and now, and for eternity.',
    coverFileUrl: 'https://covers.openlibrary.org/b/isbn/9780310205715-L.jpg',
    rating: 4.8,
    totalRatings: 1247,
    pdfFileUrl: '/uploads/purpose-driven-life.pdf',
    audioLink: 'https://example.com/audio/purpose-driven-life.mp4',
    createdAt: '2024-01-15',
    genre: 'Christian Living',
    category: 'Spiritual Growth',
    pages: 334,
    language: 'English',
    publisher: 'Zondervan',
    downloads: 1247,
    isbn: '9780310205715',
    featured: true,
    bestseller: true,
    newRelease: false
  },
  {
    id: '2',
    title: 'Jesus Calling',
    author: 'Sarah Young',
    description: 'Jesus Calling is a devotional filled with uniquely inspired treasures from heaven for every day of the year.',
    fullDescription: 'After many years of writing in her prayer journal, missionary Sarah Young decided to listen to God with pen in hand, writing down whatever she believed He was saying to her.',
    coverFileUrl: 'https://covers.openlibrary.org/b/isbn/9781591451884-L.jpg',
    rating: 4.9,
    totalRatings: 2156,
    pdfFileUrl: '/uploads/jesus-calling.pdf',
    audioLink: null,
    createdAt: '2024-01-10',
    genre: 'Devotional',
    category: 'Daily Reading',
    pages: 400,
    language: 'English',
    publisher: 'Thomas Nelson',
    downloads: 892,
    isbn: '9781591451884',
    featured: true,
    bestseller: false,
    newRelease: true
  },
  {
    id: '3',
    title: 'Mere Christianity',
    author: 'C.S. Lewis',
    description: 'Mere Christianity is a theological book by C. S. Lewis, adapted from a series of BBC radio talks made between 1941 and 1944.',
    fullDescription: 'In the classic Mere Christianity, C.S. Lewis, the most important writer of the 20th century, explores the common ground upon which all of those of Christian faith stand together.',
    coverFileUrl: 'https://covers.openlibrary.org/b/isbn/9780060652920-L.jpg',
    rating: 4.7,
    totalRatings: 1834,
    pdfFileUrl: '/uploads/mere-christianity.pdf',
    audioLink: 'https://example.com/audio/mere-christianity.mp4',
    createdAt: '2024-01-05',
    genre: 'Theology',
    category: 'Apologetics',
    pages: 227,
    language: 'English',
    publisher: 'HarperOne',
    downloads: 756,
    isbn: '9780060652920',
    featured: false,
    bestseller: true,
    newRelease: false
  },
  {
    id: '4',
    title: 'The Case for Christ',
    author: 'Lee Strobel',
    description: 'A journalist\'s personal investigation of the evidence for Jesus.',
    fullDescription: 'Is there credible evidence that Jesus of Nazareth really is the Son of God? Retracing his own spiritual journey from atheism to faith, Lee Strobel, former legal editor of the Chicago Tribune, cross-examines a dozen experts with doctorates.',
    coverFileUrl: 'https://covers.openlibrary.org/b/isbn/9780310226956-L.jpg',
    rating: 4.6,
    totalRatings: 1456,
    pdfFileUrl: '/uploads/case-for-christ.pdf',
    audioLink: null,
    createdAt: '2024-01-20',
    genre: 'Apologetics',
    category: 'Evidence',
    pages: 360,
    language: 'English',
    publisher: 'Zondervan',
    downloads: 623,
    featured: false,
    bestseller: false,
    newRelease: true
  }
];

// Demo API functions
export const demoApi = {
  // Books
  books: {
    getAll: async (filters = {}) => {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      let books = [...demoBooks];
      
      if (filters.search) {
        const search = filters.search.toLowerCase();
        books = books.filter(book => 
          book.title.toLowerCase().includes(search) ||
          book.author.toLowerCase().includes(search) ||
          book.description.toLowerCase().includes(search)
        );
      }
      
      if (filters.genre) {
        books = books.filter(book => book.genre === filters.genre);
      }
      
      if (filters.featured === 'true') {
        books = books.filter(book => book.featured);
      }
      
      if (filters.bestseller === 'true') {
        books = books.filter(book => book.bestseller);
      }
      
      if (filters.newRelease === 'true') {
        books = books.filter(book => book.newRelease);
      }
      
      return { books, total: books.length };
    },
    
    getById: async (id) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return demoBooks.find(book => book.id === id);
    },
    
    getFeatured: async () => {
      await new Promise(resolve => setTimeout(resolve, 400));
      return demoBooks.filter(book => book.featured);
    },
    
    getBestsellers: async () => {
      await new Promise(resolve => setTimeout(resolve, 400));
      return demoBooks.filter(book => book.bestseller);
    },
    
    getNewReleases: async () => {
      await new Promise(resolve => setTimeout(resolve, 400));
      return demoBooks.filter(book => book.newRelease);
    },
    
    search: async (query, filters = {}) => {
      return demoApi.books.getAll({ search: query, ...filters });
    }
  },
  
  // Favorites (using localStorage for demo)
  favorites: {
    getAll: async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      return favorites.map(fav => demoBooks.find(book => book.id === fav.bookId)).filter(Boolean);
    },
    
    add: async (bookId) => {
      await new Promise(resolve => setTimeout(resolve, 200));
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      if (!favorites.find(fav => fav.bookId === bookId)) {
        favorites.push({ bookId, createdAt: new Date().toISOString() });
        localStorage.setItem('favorites', JSON.stringify(favorites));
      }
      return { success: true };
    },
    
    remove: async (bookId) => {
      await new Promise(resolve => setTimeout(resolve, 200));
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      const filtered = favorites.filter(fav => fav.bookId !== bookId);
      localStorage.setItem('favorites', JSON.stringify(filtered));
      return { success: true };
    },
    
    check: async (bookId) => {
      await new Promise(resolve => setTimeout(resolve, 100));
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      return { isFavorite: favorites.some(fav => fav.bookId === bookId) };
    }
  },
  
  // Downloads (using localStorage for demo)
  downloads: {
    record: async (bookId, downloadType = 'pdf') => {
      await new Promise(resolve => setTimeout(resolve, 200));
      const downloads = JSON.parse(localStorage.getItem('downloads') || '[]');
      downloads.push({
        bookId,
        downloadType,
        downloadedAt: new Date().toISOString()
      });
      localStorage.setItem('downloads', JSON.stringify(downloads));
      return { success: true };
    },
    
    getHistory: async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const downloads = JSON.parse(localStorage.getItem('downloads') || '[]');
      return downloads.map(download => ({
        ...download,
        book: demoBooks.find(book => book.id === download.bookId)
      })).filter(download => download.book);
    }
  }
};

export default demoApi;
