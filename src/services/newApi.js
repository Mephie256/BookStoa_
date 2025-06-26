// New API service for Neon + Clerk + Cloudinary stack
// Now using real database services

import { demoApi } from './demoData.js';
import { booksService } from './booksService.js';
import { uploadService } from './uploadService.js';
import { favoritesService } from './favoritesService.js';
import { downloadsService } from './downloadsService.js';
import { libraryService } from './libraryService.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const USE_DEMO_DATA = false; // ALWAYS use real database - NO MORE DEMO SHIT

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
};

// Books API
export const booksApi = {
  getAll: (filters = {}) => {
    if (USE_DEMO_DATA) return demoApi.books.getAll(filters);
    return booksService.getAll(filters);
  },
  getById: (id) => {
    if (USE_DEMO_DATA) return demoApi.books.getById(id);
    return booksService.getById(id);
  },
  create: (bookData) => {
    if (USE_DEMO_DATA) return Promise.resolve({ success: true, book: bookData });
    return booksService.create(bookData);
  },
  update: (id, bookData) => {
    if (USE_DEMO_DATA) return Promise.resolve({ success: true, book: bookData });
    return booksService.update(id, bookData);
  },
  delete: (id) => {
    if (USE_DEMO_DATA) return Promise.resolve({ success: true });
    return booksService.delete(id);
  },
  search: (query, filters = {}) => {
    if (USE_DEMO_DATA) return demoApi.books.search(query, filters);
    return booksService.getAll({ search: query, ...filters });
  },
  incrementDownloads: (id) => {
    if (USE_DEMO_DATA) return Promise.resolve({ success: true });
    return booksService.incrementDownload(id);
  },
  // Get search suggestions (instant search)
  getSuggestions: async (query) => {
    try {
      if (!query || query.length < 2) return { success: true, suggestions: [] };

      console.log('💡 Getting suggestions for:', query);

      // For now, use local suggestions - can be enhanced with API later
      const allBooks = await booksService.getAll();
      const books = allBooks.books || allBooks || [];

      const suggestions = [];

      // Add book title suggestions
      books.forEach(book => {
        if (book.title && book.title.toLowerCase().includes(query.toLowerCase())) {
          suggestions.push({
            text: book.title,
            type: 'book',
            id: book.id,
            author: book.author,
            cover: book.cover_file_url || book.coverUrl
          });
        }
      });

      // Add author suggestions
      const authors = [...new Set(books.map(book => book.author).filter(Boolean))];
      authors.forEach(author => {
        if (author.toLowerCase().includes(query.toLowerCase())) {
          suggestions.push({
            text: author,
            type: 'author'
          });
        }
      });

      // Add genre suggestions
      const genres = [...new Set(books.map(book => book.genre).filter(Boolean))];
      genres.forEach(genre => {
        if (genre.toLowerCase().includes(query.toLowerCase())) {
          suggestions.push({
            text: genre,
            type: 'genre'
          });
        }
      });

      // Add common search terms
      const commonTerms = [
        'Christian Living', 'Devotional', 'Theology', 'Apologetics', 'Prayer', 'Faith',
        'Bible Study', 'Spiritual Growth', 'Leadership', 'Marriage', 'Family'
      ];

      commonTerms.forEach(term => {
        if (term.toLowerCase().includes(query.toLowerCase())) {
          suggestions.push({
            text: term,
            type: 'suggestion'
          });
        }
      });

      // Remove duplicates and limit results
      const uniqueSuggestions = suggestions
        .filter((suggestion, index, self) =>
          index === self.findIndex(s => s.text === suggestion.text)
        )
        .slice(0, 8);

      return {
        success: true,
        suggestions: uniqueSuggestions
      };
    } catch (error) {
      console.error('❌ Suggestions error:', error);
      return {
        success: true,
        suggestions: []
      };
    }
  },
  // Get trending searches
  getTrendingSearches: () => {
    return Promise.resolve({
      success: true,
      trending: [
        'Purpose Driven Life',
        'Jesus Calling',
        'Mere Christianity',
        'The Case for Christ',
        'Crazy Love',
        'Christian Living',
        'Prayer',
        'Faith'
      ]
    });
  },
  getFeatured: () => {
    if (USE_DEMO_DATA) return demoApi.books.getFeatured();
    return booksService.getFeatured();
  },
  getBestsellers: () => {
    if (USE_DEMO_DATA) return demoApi.books.getBestsellers();
    return booksService.getBestsellers();
  },
  getNewReleases: () => {
    if (USE_DEMO_DATA) return demoApi.books.getNewReleases();
    return booksService.getNewReleases();
  },
  getByCategory: (category) => {
    if (USE_DEMO_DATA) return demoApi.books.getAll({ category });
    return booksService.getAll({ category });
  },
  getByGenre: (genre) => {
    if (USE_DEMO_DATA) return demoApi.books.getAll({ genre });
    return booksService.getAll({ genre });
  },
  incrementDownload: (id) => {
    if (USE_DEMO_DATA) return Promise.resolve({ success: true });
    return booksService.incrementDownload(id);
  },
};

// Users API
export const usersApi = {
  getProfile: () => apiRequest('/users/profile'),
  updateProfile: (userData) => apiRequest('/users/profile', {
    method: 'PUT',
    body: JSON.stringify(userData),
  }),
  sync: (userData) => apiRequest('/users/sync', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  getAll: () => apiRequest('/users'),
  updateRole: (userId, role) => apiRequest(`/users/${userId}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role }),
  }),
  delete: (userId) => apiRequest(`/users/${userId}`, { method: 'DELETE' }),
};

// Favorites API - REAL DATABASE ONLY
export const favoritesApi = {
  getAll: (userId) => {
    if (!userId) return Promise.resolve([]);
    return favoritesService.getUserFavorites(userId);
  },
  add: (userId, bookId) => {
    if (!userId || !bookId) return Promise.resolve({ success: false, error: 'Missing user or book ID' });
    return favoritesService.addFavorite(userId, bookId);
  },
  remove: (userId, bookId) => {
    if (!userId || !bookId) return Promise.resolve({ success: false, error: 'Missing user or book ID' });
    return favoritesService.removeFavorite(userId, bookId);
  },
  check: (userId, bookId) => {
    if (!userId || !bookId) return Promise.resolve({ isFavorite: false });
    return favoritesService.isFavorite(userId, bookId);
  },
};

// Downloads API - REAL DATABASE ONLY
export const downloadsApi = {
  getHistory: (userId) => {
    if (!userId) return Promise.resolve([]);
    return downloadsService.getUserDownloads(userId);
  },
  record: (userId, bookId, downloadType = 'pdf') => {
    if (!userId || !bookId) return Promise.resolve({ success: false, error: 'Missing user or book ID' });
    return downloadsService.recordDownload(userId, bookId, downloadType);
  },
  getStats: (userId) => {
    if (!userId) return Promise.resolve({ unique_books: 0, total_downloads: 0, pdf_downloads: 0, audio_downloads: 0 });
    return downloadsService.getUserStats(userId);
  },
  getPopular: (limit = 10) => {
    return downloadsService.getPopularDownloads(limit);
  },
};

// Library API - REAL DATABASE ONLY
export const libraryApi = {
  getLibrary: (userId) => {
    if (!userId) return Promise.resolve([]);
    return libraryService.getUserLibrary(userId);
  },
  addToLibrary: (userId, bookId, readingStatus = 'want_to_read') => {
    if (!userId || !bookId) return Promise.resolve({ success: false, error: 'Missing user or book ID' });
    return libraryService.addToLibrary(userId, bookId, readingStatus);
  },
  removeFromLibrary: (userId, bookId) => {
    if (!userId || !bookId) return Promise.resolve({ success: false, error: 'Missing user or book ID' });
    return libraryService.removeFromLibrary(userId, bookId);
  },
  updateReadingStatus: (userId, bookId, readingStatus, progress = 0) => {
    if (!userId || !bookId) return Promise.resolve({ success: false, error: 'Missing user or book ID' });
    return libraryService.updateReadingStatus(userId, bookId, readingStatus, progress);
  },
  isInLibrary: (userId, bookId) => {
    if (!userId || !bookId) return Promise.resolve({ inLibrary: false, readingStatus: null });
    return libraryService.isInLibrary(userId, bookId);
  },
  getStats: (userId) => {
    if (!userId) return Promise.resolve({ total_books: 0, currently_reading: 0, completed: 0, want_to_read: 0, paused: 0 });
    return libraryService.getLibraryStats(userId);
  },
  getBooksByStatus: (userId, readingStatus) => {
    if (!userId || !readingStatus) return Promise.resolve([]);
    return libraryService.getBooksByStatus(userId, readingStatus);
  },
};

// Upload API
export const uploadApi = {
  uploadCover: (file) => {
    if (USE_DEMO_DATA) return uploadService.uploadCover(file);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'cover');

    return fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    }).then(res => res.json());
  },
  uploadPdf: (file) => {
    if (USE_DEMO_DATA) return uploadService.uploadPdf(file);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'pdf');

    return fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    }).then(res => res.json());
  },
  deleteFile: (publicId, resourceType = 'image') => {
    if (USE_DEMO_DATA) return uploadService.deleteFile(publicId, resourceType);

    return apiRequest('/upload/delete', {
      method: 'POST',
      body: JSON.stringify({ publicId, resourceType }),
    });
  },
};

// Analytics API
export const analyticsApi = {
  getDashboardStats: () => apiRequest('/analytics/dashboard'),
  getUserActivity: () => apiRequest('/analytics/users'),
  getBookPerformance: () => apiRequest('/analytics/books'),
  getDownloadTrends: () => apiRequest('/analytics/downloads'),
};
