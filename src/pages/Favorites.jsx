import { useState, useEffect } from 'react';
import { Heart, Grid, List, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import BookCard from '../components/BookCard';
import { Aurora } from '../components/ui/aurora';
import { useAuth } from '../contexts/BetterAuthContext';
import { useModal } from '../contexts/ModalContext';
import { userDataService } from '../services/userDataService';
import LoaderOne from '../components/ui/loader-one';
import AuthModal from '../components/AuthModal';

const Favorites = () => {
  const [favoriteBooks, setFavoriteBooks] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const { user } = useAuth();
  const { showError } = useModal();



  // Load favorites from localStorage
  useEffect(() => {
    const loadFavorites = () => {
      try {
        setLoading(true);

        if (!user) {
          setFavoriteBooks([]);
          setLoading(false);
          return;
        }

        const userId = user?.id || user?.email || user?.uid;
        if (userId) {
          // First, try to fix any missing image URLs in existing data
          userDataService.fixImageUrls(userId);

          const favorites = userDataService.getFavorites(userId);
          console.log('📚 Loaded favorites for user:', userId, favorites);
          setFavoriteBooks(favorites);
        } else {
          console.warn('No valid user ID found');
          setFavoriteBooks([]);
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
        setFavoriteBooks([]);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();

    // Listen for storage changes (when favorites are updated in other tabs)
    const handleStorageChange = (e) => {
      if (e.key && e.key.startsWith('pneuma_user_data')) {
        loadFavorites();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user]);

  const filteredBooks = favoriteBooks;

  // Remove favorite function
  const removeFavorite = (bookId) => {
    try {
      console.log('💔 Removing favorite:', bookId);
      const userId = user?.id || user?.email || user?.uid;
      const success = userDataService.removeFromFavorites(bookId, userId);

      if (success) {
        setFavoriteBooks(favoriteBooks.filter(book => book.id !== bookId));
        console.log('✅ Favorite removed successfully');
      } else {
        console.error('❌ Failed to remove favorite');
        showError('Failed to remove from favorites. Please try again.', 'Error');
      }
    } catch (error) {
      console.error('❌ Error removing favorite:', error);
      showError('Failed to remove from favorites. Please try again.', 'Error');
    }
  };

  // Show login message if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 relative overflow-hidden">
        <div className="fixed inset-0 w-full h-full opacity-50 z-0">
          <Aurora
            colorStops={["#0d8a2f", "#1f2937", "#11b53f"]}
            blend={0.4}
            amplitude={0.6}
            speed={0.12}
            className="w-full h-full"
          />
        </div>
        <div className="fixed inset-0 w-full h-full bg-gray-900/30 z-0"></div>
        <main className="min-h-screen overflow-auto relative z-20 md:ml-60 lg:ml-80 pb-32 md:pb-24">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-10 h-10 text-red-400" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-4">Sign In Required</h1>
              <p className="text-gray-400 mb-8 leading-relaxed">
                You need to sign in to view your favorite books. Create an account or sign in to start building your favorites collection.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="block w-full px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl hover:from-green-700 hover:to-green-600 transition-all duration-200 font-semibold shadow-lg"
                >
                  Sign In / Sign Up
                </button>
                <Link
                  to="/"
                  className="block w-full px-6 py-3 bg-gray-800/50 backdrop-blur-sm text-white rounded-xl hover:bg-gray-700/50 transition-all duration-200 border border-gray-600/50"
                >
                  Browse Books
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 relative overflow-hidden">
        <div className="fixed inset-0 w-full h-full opacity-50 z-0">
          <Aurora
            colorStops={["#0d8a2f", "#1f2937", "#11b53f"]}
            blend={0.4}
            amplitude={0.6}
            speed={0.12}
            className="w-full h-full"
          />
        </div>
        <div className="fixed inset-0 w-full h-full bg-gray-900/30 z-0"></div>
        <main className="min-h-screen overflow-auto relative z-20 md:ml-60 lg:ml-80 pb-32 md:pb-24">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="mb-4">
                <LoaderOne />
              </div>
              <p className="text-gray-300">Loading your favorites...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Dark Aurora Background - Full Coverage */}
      <div className="fixed inset-0 w-full h-full opacity-50 z-0">
        <Aurora
          colorStops={["#0d8a2f", "#1f2937", "#11b53f"]}
          blend={0.4}
          amplitude={0.6}
          speed={0.12}
          className="w-full h-full"
        />
      </div>

      {/* Dark overlay for better readability */}
      <div className="fixed inset-0 w-full h-full bg-gray-900/30 z-0"></div>

      <main className="min-h-screen overflow-auto relative z-20 md:ml-60 lg:ml-80 pb-32 md:pb-24">
        <div className="px-4 md:px-8 pt-24 md:pt-6 pb-6 space-y-8 relative z-20">

          {/* Stats */}


          {/* Books Display */}
          {filteredBooks.length > 0 ? (
            <div>
              <h2 className="text-xl font-semibold text-white mb-6">
                {filteredBooks.length} {filteredBooks.length === 1 ? 'Book' : 'Books'}
              </h2>
              <div className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 min-[420px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 justify-items-stretch'
                  : 'space-y-4'
              }>
                {filteredBooks.map((favorite) => (
                  <div key={favorite.book_id || favorite.id} className="relative group">
                    <BookCard
                      book={{
                        id: favorite.book_id || favorite.id,
                        title: favorite.title,
                        author: favorite.author,
                        description: favorite.description,
                        genre: favorite.genre,
                        category: favorite.category,
                        cover_file_url: favorite.cover_file_url || favorite.coverUrl || favorite.coverFileUrl,
                        rating: favorite.rating,
                        totalRatings: favorite.total_ratings,
                        downloads: favorite.downloads,
                        pdf_file_url: favorite.pdf_file_url,
                        audioLink: favorite.audio_link,
                        pages: favorite.pages,
                        language: favorite.language,
                        publisher: favorite.publisher
                      }}
                      variant={viewMode === 'list' ? 'featured' : 'default'}
                    />
                    {/* Remove from favorites button */}
                    <button
                      onClick={() => removeFavorite(favorite.book_id || favorite.id)}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-600/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-500 shadow-lg"
                    >
                      <Heart className="w-4 h-4 text-white fill-current" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-12 shadow-2xl border border-gray-700/50 max-w-md mx-auto">
                <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  {favoriteBooks.length === 0 ? 'No Favorites Yet' : 'No Books Found'}
                </h3>
                <p className="text-gray-400 mb-6">
                  {favoriteBooks.length === 0
                    ? 'Start adding books to your favorites by clicking the heart icon on any book.'
                    : 'Try checking another book in your favorites.'
                  }
                </p>
                {favoriteBooks.length === 0 && (
                  <button
                    onClick={() => window.location.href = '/'}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl font-medium hover:from-green-700 hover:to-green-600 transition-all duration-200 shadow-lg"
                  >
                    Browse Books
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultMode="login"
      />
    </div>
  );
};

export default Favorites;
