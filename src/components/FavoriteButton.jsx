import { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';
import { CiBookmark } from 'react-icons/ci';
import { userDataService } from '../services/userDataService';
import { useAuth } from '../contexts/BetterAuthContext';
import { useModal } from '../contexts/ModalContext';
import AuthModal from './AuthModal';

const FavoriteButton = ({ book, variant = 'default', showText = true }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const { user } = useAuth();
  const { showError } = useModal();
  const isAuthenticated = !!user;

  // Check if book is already in favorites
  useEffect(() => {
    if (book?.id && user) {
      const userId = user?.id || user?.email || user?.uid;
      setIsFavorite(userDataService.isFavorite(book.id, userId));
    }
  }, [book?.id, user]);

  const handleToggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      alert('Please sign in to add books to favorites');
      return;
    }

    if (!book?.id) return;

    setIsAnimating(true);

    try {
      const userId = user?.id || user?.email || user?.uid;

      if (isFavorite) {
        // Remove from favorites
        const success = userDataService.removeFromFavorites(book.id, userId);
        if (success) {
          setIsFavorite(false);
          console.log('💔 Removed from favorites:', book.title);
        }
      } else {
        // Add to favorites
        const success = userDataService.addToFavorites(book, userId);
        if (success) {
          setIsFavorite(true);
          console.log('❤️ Added to favorites:', book.title, 'for user:', userId);
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  // Compact variant (for cards) - Hide when not authenticated
  if (variant === 'compact') {
    if (!isAuthenticated) {
      return null; // Don't show favorite button on cards when not authenticated
    }

    return (
      <button
        onClick={handleToggleFavorite}
        className={`flex items-center gap-1 px-2 py-1.5 text-sm rounded-lg transition-all duration-200 ${
          isFavorite
            ? 'bg-red-600 text-white hover:bg-red-700'
            : 'bg-gray-600 text-gray-300 hover:bg-gray-500 hover:text-white'
        } ${isAnimating ? 'scale-110' : ''}`}
        title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        <CiBookmark
          className={`w-4 h-4 transition-all duration-200 ${
            isFavorite ? 'fill-current' : ''
          } ${isAnimating ? 'animate-pulse' : ''}`}
        />
        {showText && (
          <span className="hidden sm:inline">
            {isFavorite ? 'Favorited' : 'Favorite'}
          </span>
        )}
      </button>
    );
  }

  // Icon only variant - Hide when not authenticated
  if (variant === 'icon') {
    if (!isAuthenticated) {
      return null; // Don't show favorite button when not authenticated
    }

    return (
      <button
        onClick={handleToggleFavorite}
        className={`p-2.5 rounded-full transition-all duration-300 shadow-lg ${
          isFavorite
            ? 'bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-700 hover:to-red-600 shadow-red-500/20'
            : 'bg-gray-800/90 backdrop-blur-sm text-gray-300 hover:bg-gray-700/90 hover:text-white border border-gray-600/50 hover:border-gray-500/50'
        } ${isAnimating ? 'scale-110' : ''}`}
        title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        <CiBookmark
          className={`w-6 h-6 transition-all duration-200 ${
            isFavorite ? 'fill-current' : ''
          } ${isAnimating ? 'animate-pulse' : ''}`}
        />
      </button>
    );
  }

  // Full variant (for detail pages)
  if (variant === 'full') {
    if (!isAuthenticated) {
      return (
        <>
          <button
            onClick={() => setShowAuthModal(true)}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 font-semibold rounded-xl transition-all duration-200 shadow-lg bg-gradient-to-r from-green-600 to-green-500 text-white hover:from-green-700 hover:to-green-600"
          >
            <Lock className="w-5 h-5" />
            Sign In to Add to Favorites
          </button>

          {/* Auth Modal */}
          <AuthModal
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
            defaultMode="login"
          />
        </>
      );
    }

    return (
      <button
        onClick={handleToggleFavorite}
        className={`w-full flex items-center justify-center gap-3 px-6 py-4 font-semibold rounded-xl transition-all duration-200 shadow-lg ${
          isFavorite
            ? 'bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-700 hover:to-red-600'
            : 'bg-gradient-to-r from-gray-700 to-gray-600 text-white hover:from-gray-600 hover:to-gray-500'
        } ${isAnimating ? 'scale-105' : ''}`}
      >
        <CiBookmark
          className={`w-5 h-5 transition-all duration-200 ${
            isFavorite ? 'fill-current' : ''
          } ${isAnimating ? 'animate-pulse' : ''}`}
        />
        {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
      </button>
    );
  }

  // Default variant
  if (!isAuthenticated) {
    return (
      <>
        <button
          onClick={() => setShowAuthModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 bg-green-600 text-white hover:bg-green-700"
        >
          <Lock className="w-4 h-4" />
          Sign In to Favorite
        </button>

        {/* Auth Modal */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          defaultMode="login"
        />
      </>
    );
  }

  return (
    <button
      onClick={handleToggleFavorite}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
        isFavorite
          ? 'bg-red-600 text-white hover:bg-red-700'
          : 'bg-gray-600 text-gray-300 hover:bg-gray-500 hover:text-white'
      } ${isAnimating ? 'scale-105' : ''}`}
    >
      <CiBookmark
        className={`w-5 h-5 transition-all duration-200 ${
          isFavorite ? 'fill-current' : ''
        } ${isAnimating ? 'animate-pulse' : ''}`}
      />
      {isFavorite ? 'Favorited' : 'Add to Favorites'}
    </button>
  );
};

export default FavoriteButton;
