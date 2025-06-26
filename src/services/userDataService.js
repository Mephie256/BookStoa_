// User data service for favorites and downloads
const USER_DATA_KEY = 'pneuma_user_data';

// Get user-specific data key
const getUserDataKey = (userId) => {
  return userId ? `${USER_DATA_KEY}_${userId}` : USER_DATA_KEY;
};

// Get user data from localStorage
const getUserData = (userId = null) => {
  try {
    const key = getUserDataKey(userId);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : {
      userId: userId,
      favorites: [],
      downloads: [],
      library: []
    };
  } catch (error) {
    console.error('Error reading user data:', error);
    return {
      userId: userId,
      favorites: [],
      downloads: [],
      library: []
    };
  }
};

// Save user data to localStorage
const saveUserData = (data, userId = null) => {
  try {
    const key = getUserDataKey(userId);
    const dataToSave = { ...data, userId: userId };
    localStorage.setItem(key, JSON.stringify(dataToSave));
    return true;
  } catch (error) {
    console.error('Error saving user data:', error);
    return false;
  }
};

export const userDataService = {
  // FAVORITES MANAGEMENT
  getFavorites: (userId = null) => {
    const data = getUserData(userId);
    return data.favorites || [];
  },

  addToFavorites: (book, userId = null) => {
    try {
      const data = getUserData(userId);
      const bookId = book.id || book._id;

      // Check if already in favorites
      if (!data.favorites.find(fav => fav.id === bookId)) {
        const favoriteItem = {
          id: bookId,
          title: book.title,
          author: book.author,
          cover_file_url: book.cover_file_url || book.coverUrl || book.cover_url || book.image_url || 'https://via.placeholder.com/300x400/11b53f/ffffff?text=📖',
          coverUrl: book.cover_file_url || book.coverUrl || book.cover_url || book.image_url || 'https://via.placeholder.com/300x400/11b53f/ffffff?text=📖',
          genre: book.genre,
          rating: book.rating,
          addedAt: new Date().toISOString(),
          bookData: book // Store full book data
        };

        data.favorites.unshift(favoriteItem); // Add to beginning
        saveUserData(data, userId);
        console.log('✅ Added to favorites:', book.title, 'for user:', userId);
        return true;
      }
      return false; // Already in favorites
    } catch (error) {
      console.error('Error adding to favorites:', error);
      return false;
    }
  },

  removeFromFavorites: (bookId, userId = null) => {
    try {
      const data = getUserData(userId);
      data.favorites = data.favorites.filter(fav => fav.id !== bookId);
      saveUserData(data, userId);
      console.log('✅ Removed from favorites:', bookId, 'for user:', userId);
      return true;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      return false;
    }
  },

  isFavorite: (bookId, userId = null) => {
    const data = getUserData(userId);
    return data.favorites.some(fav => fav.id === bookId);
  },

  // DOWNLOADS MANAGEMENT
  getDownloads: (userId = null) => {
    const data = getUserData(userId);
    return data.downloads || [];
  },

  addToDownloads: (book, userId = null) => {
    try {
      const data = getUserData(userId);
      const bookId = book.id || book._id;

      // Check if already in downloads
      const existingDownload = data.downloads.find(dl => dl.id === bookId);

      if (existingDownload) {
        // Update download count and last downloaded
        existingDownload.downloadCount = (existingDownload.downloadCount || 1) + 1;
        existingDownload.lastDownloaded = new Date().toISOString();
        console.log('✅ Updated download count for:', book.title, 'user:', userId, 'count:', existingDownload.downloadCount);
      } else {
        // Add new download
        const downloadItem = {
          id: bookId,
          title: book.title,
          author: book.author,
          cover_file_url: book.cover_file_url || book.coverUrl || book.cover_url || book.image_url || 'https://via.placeholder.com/300x400/11b53f/ffffff?text=📖',
          coverUrl: book.cover_file_url || book.coverUrl || book.cover_url || book.image_url || 'https://via.placeholder.com/300x400/11b53f/ffffff?text=📖',
          pdf_file_url: book.pdf_file_url || book.pdfFileUrl || book.pdfUrl,
          genre: book.genre,
          rating: book.rating,
          downloadCount: 1,
          firstDownloaded: new Date().toISOString(),
          lastDownloaded: new Date().toISOString(),
          bookData: book // Store full book data
        };

        data.downloads.unshift(downloadItem); // Add to beginning
        console.log('✅ Added new download:', book.title, 'for user:', userId);
      }

      saveUserData(data, userId);
      return true;
    } catch (error) {
      console.error('Error adding to downloads:', error);
      return false;
    }
  },

  removeFromDownloads: (bookId, userId = null) => {
    try {
      const data = getUserData(userId);
      data.downloads = data.downloads.filter(dl => dl.id !== bookId);
      saveUserData(data, userId);
      console.log('✅ Removed from downloads:', bookId, 'for user:', userId);
      return true;
    } catch (error) {
      console.error('Error removing from downloads:', error);
      return false;
    }
  },

  isDownloaded: (bookId, userId = null) => {
    const data = getUserData(userId);
    return data.downloads.some(dl => dl.id === bookId);
  },

  // LIBRARY MANAGEMENT (combination of favorites and downloads)
  getLibrary: (userId = null) => {
    const data = getUserData(userId);
    const favorites = data.favorites || [];
    const downloads = data.downloads || [];

    // Combine and deduplicate
    const libraryMap = new Map();

    // Add favorites
    favorites.forEach(fav => {
      const bookData = fav.bookData || fav;
      libraryMap.set(fav.id, {
        ...bookData, // Use full book data
        ...fav, // Override with favorite-specific data
        isFavorite: true,
        isDownloaded: false,
        // Ensure image URL is available
        cover_file_url: fav.cover_file_url || bookData.cover_file_url || bookData.coverUrl || bookData.cover_url || bookData.image_url || 'https://via.placeholder.com/300x400/11b53f/ffffff?text=📖',
        coverUrl: fav.cover_file_url || bookData.cover_file_url || bookData.coverUrl || bookData.cover_url || bookData.image_url || 'https://via.placeholder.com/300x400/11b53f/ffffff?text=📖'
      });
    });

    // Add downloads
    downloads.forEach(dl => {
      const bookData = dl.bookData || dl;
      if (libraryMap.has(dl.id)) {
        const existing = libraryMap.get(dl.id);
        libraryMap.set(dl.id, {
          ...existing,
          isDownloaded: true,
          downloadCount: dl.downloadCount,
          lastDownloaded: dl.lastDownloaded,
          // Ensure PDF URL is available
          pdf_file_url: dl.pdf_file_url || bookData.pdf_file_url || bookData.pdfFileUrl
        });
      } else {
        libraryMap.set(dl.id, {
          ...bookData, // Use full book data
          ...dl, // Override with download-specific data
          isFavorite: false,
          isDownloaded: true,
          // Ensure image URL is available
          cover_file_url: dl.cover_file_url || bookData.cover_file_url || bookData.coverUrl || bookData.cover_url || bookData.image_url || 'https://via.placeholder.com/300x400/11b53f/ffffff?text=📖',
          coverUrl: dl.cover_file_url || bookData.cover_file_url || bookData.coverUrl || bookData.cover_url || bookData.image_url || 'https://via.placeholder.com/300x400/11b53f/ffffff?text=📖'
        });
      }
    });

    return Array.from(libraryMap.values());
  },

  // Get user statistics
  getStats: (userId = null) => {
    const data = getUserData(userId);
    const favorites = data.favorites || [];
    const downloads = data.downloads || [];

    const totalDownloadCount = downloads.reduce((sum, dl) => sum + (dl.downloadCount || 1), 0);

    return {
      totalFavorites: favorites.length,
      totalDownloads: downloads.length,
      totalDownloadCount: totalDownloadCount,
      totalLibraryItems: new Set([...favorites.map(f => f.id), ...downloads.map(d => d.id)]).size
    };
  },

  // UTILITY FUNCTIONS
  clearAllData: (userId = null) => {
    try {
      const key = getUserDataKey(userId);
      localStorage.removeItem(key);
      console.log('✅ Cleared user data for:', userId || 'anonymous');
      return true;
    } catch (error) {
      console.error('Error clearing user data:', error);
      return false;
    }
  },

  clearAllUsers: () => {
    try {
      // Clear all user data keys
      const keys = Object.keys(localStorage).filter(key => key.startsWith(USER_DATA_KEY));
      keys.forEach(key => localStorage.removeItem(key));
      console.log('✅ Cleared all user data');
      return true;
    } catch (error) {
      console.error('Error clearing all user data:', error);
      return false;
    }
  },

  exportData: (userId = null) => {
    const data = getUserData(userId);
    return JSON.stringify(data, null, 2);
  },

  importData: (jsonData, userId = null) => {
    try {
      const data = JSON.parse(jsonData);
      saveUserData(data, userId);
      console.log('✅ Imported user data for:', userId || 'anonymous');
      return true;
    } catch (error) {
      console.error('Error importing user data:', error);
      return false;
    }
  },

  // Utility function to fix missing image URLs in existing data
  fixImageUrls: (userId = null) => {
    try {
      const data = getUserData(userId);
      let hasChanges = false;

      // Fix favorites
      if (data.favorites) {
        data.favorites.forEach(fav => {
          if (!fav.cover_file_url && !fav.coverUrl) {
            const bookData = fav.bookData || fav;
            fav.cover_file_url = bookData.cover_file_url || bookData.coverUrl || bookData.cover_url || bookData.image_url || 'https://via.placeholder.com/300x400/11b53f/ffffff?text=📖';
            fav.coverUrl = fav.cover_file_url;
            hasChanges = true;
          }
        });
      }

      // Fix downloads
      if (data.downloads) {
        data.downloads.forEach(dl => {
          if (!dl.cover_file_url && !dl.coverUrl) {
            const bookData = dl.bookData || dl;
            dl.cover_file_url = bookData.cover_file_url || bookData.coverUrl || bookData.cover_url || bookData.image_url || 'https://via.placeholder.com/300x400/11b53f/ffffff?text=📖';
            dl.coverUrl = dl.cover_file_url;
            hasChanges = true;
          }
        });
      }

      if (hasChanges) {
        saveUserData(data, userId);
        console.log('✅ Fixed image URLs for user:', userId);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error fixing image URLs:', error);
      return false;
    }
  }
};