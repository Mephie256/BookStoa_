import React, { useState, useEffect } from 'react';
import { Star, Download, Heart, Play, BookOpen, Headphones, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import DownloadButton from './DownloadButton';
import FavoriteButton from './FavoriteButton';
import { useAudio } from '../contexts/AudioContext';
import { useAuth } from '../contexts/SimpleAuthContext';
import AuthModal from './AuthModal';

const BookCard = ({ book, variant = 'default' }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { playTrack } = useAudio();
  const { user } = useAuth();
  const isAuthenticated = !!user;

  const handleImageLoad = () => setImageLoaded(true);
  const handleImageError = () => setImageError(true);

  // Get cover image URL from multiple possible field names
  const getCoverUrl = () => {
    return book.cover_file_url ||
           book.coverUrl ||
           book.cover_url ||
           book.image_url ||
           book.thumbnail ||
           'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop&crop=center';
  };

  const coverUrl = getCoverUrl();

  // Handle play button click
  const handlePlay = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      // Don't show alert, just do nothing - user will see the sign-in button instead
      return;
    }

    if (book.audioLink || book.audio_link) {
      const audioTrack = {
        id: book.id,
        title: book.title,
        author: book.author,
        cover_file_url: book.cover_file_url || book.coverUrl || book.cover_url,
        audioLink: book.audioLink || book.audio_link,
        audio_link: book.audioLink || book.audio_link
      };

      console.log('🎵 Playing audio:', audioTrack);
      playTrack(audioTrack);
    } else {
      console.log('🎵 No audio available for this book');
    }
  };

  // Use the same modern design for all screen sizes
  // Removed mobile-specific card to maintain consistency

  // New modern card design
  if (variant === 'modern') {
    return (
      <>
        <style>
          {`
            .hover-scale {
              transition: transform 700ms ease-out;
            }

            .hover-scale:hover {
              transform: scale(1.02);
            }

            .image-scale {
              transition: transform 700ms ease-out;
            }

            .image-container:hover .image-scale {
              transform: scale(1.03);
            }

            .hover-translate {
              transition: transform 500ms ease-out;
            }

            .hover-translate:hover {
              transform: translateX(4px);
            }

            .hover-scale-sm {
              transition: transform 500ms ease-out;
            }

            .hover-scale-sm:hover {
              transform: scale(1.1);
            }
          `}
        </style>

        <Link to={`/book/${book.id}`} className="block w-full max-w-sm mx-auto">
          <div className="bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl shadow-black/50 border border-gray-700/30 overflow-hidden hover-scale">
            <div className="relative overflow-hidden image-container">
              <img
                src={coverUrl}
                alt={book.title}
                className="w-full aspect-[3/4] object-cover image-scale"
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/70 to-transparent pointer-events-none"></div>

              {/* Book Title Overlay */}
              <div className="absolute top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-4">
                <h3 className="text-base sm:text-lg font-semibold text-white drop-shadow-lg line-clamp-2">
                  {book.title}
                </h3>
              </div>

              {/* Rating Badge */}
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                <div className="flex items-center gap-1 bg-black/30 backdrop-blur-sm rounded-full px-2 py-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-medium text-white">{book.rating || '4.5'}</span>
                </div>
              </div>

              {/* Audio Play Button */}
              {(book.audioLink || book.audio_link) && (
                isAuthenticated ? (
                  <button
                    onClick={handlePlay}
                    className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 w-9 h-9 sm:w-10 sm:h-10 bg-green-600/90 backdrop-blur-sm rounded-full flex items-center justify-center hover-scale-sm"
                    title="Play Audio"
                  >
                    <Play className="w-4 h-4 sm:w-5 sm:h-5 text-white ml-0.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 w-9 h-9 sm:w-10 sm:h-10 bg-gray-600/90 backdrop-blur-sm rounded-full flex items-center justify-center hover-scale-sm"
                    title="Sign in to listen"
                  >
                    <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </button>
                )
              )}
            </div>

            <div className="p-3 sm:p-4">
              <div className="flex items-start justify-between mb-2 sm:mb-3">
                <div className="flex-1 min-w-0 hover-translate">
                  <p className="text-sm font-medium text-white truncate">
                    {book.author}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {book.genre || book.category}
                  </p>
                </div>

                <div className="flex items-center gap-1 ml-2">
                  <BookOpen className="w-3 h-3 text-gray-500" />
                  <span className="text-xs text-gray-400">
                    {book.pages || 'PDF'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2" onClick={(e) => e.preventDefault()}>
                <DownloadButton book={book} variant="compact" showPreview={false} />
                <FavoriteButton book={book} variant="compact" showText={false} />
              </div>
            </div>
          </div>
        </Link>
      </>
    );
  }

  if (variant === 'featured') {
    return (
      <Link to={`/book/${book.id}`} className="block group">
        <div className="book-card bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-gray-700/50 hover-lift">
          <div className="flex gap-6">
            <div className="relative flex-shrink-0">
              <div className="w-24 h-36 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl overflow-hidden shadow-md">
                {!imageError ? (
                  <img
                    src={coverUrl}
                    alt={book.title}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${
                      imageLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-gray-500" />
                  </div>
                )}
                {!imageLoaded && !imageError && (
                  <div className="absolute inset-0 animate-pulse bg-gray-700 rounded-xl" />
                )}
              </div>
              {book.audioLink && (
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                  <Headphones className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:transition-colors"
                  onMouseEnter={(e) => e.target.style.color = '#11b53f'}
                  onMouseLeave={(e) => e.target.style.color = '#ffffff'}>
                {book.title}
              </h3>

              <p className="text-gray-300 mb-3 font-medium">
                by {book.author}
              </p>

              <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                {book.description}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(book.rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-gray-200">{book.rating}</span>
                  <span className="text-sm text-gray-400">({book.totalRatings})</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 text-xs font-medium rounded-full text-white" style={{backgroundColor: '#11b53f'}}>
                    {book.genre}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Default variant now uses modern design with responsive layout
  return (
    <>
      <style>
        {`
          .hover-scale {
            transition: transform 700ms ease-out;
          }

          .hover-scale:hover {
            transform: scale(1.02);
          }

          .image-scale {
            transition: transform 700ms ease-out;
          }

          .image-container:hover .image-scale {
            transform: scale(1.03);
          }

          .hover-translate {
            transition: transform 500ms ease-out;
          }

          .hover-translate:hover {
            transform: translateX(4px);
          }

          .hover-scale-sm {
            transition: transform 500ms ease-out;
          }

          .hover-scale-sm:hover {
            transform: scale(1.1);
          }
        `}
      </style>

      <Link to={`/book/${book.id}`} className="block w-full max-w-sm mx-auto">
        <div className="bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl shadow-black/50 border border-gray-700/30 overflow-hidden hover-scale">
          <div className="relative overflow-hidden image-container">
            <img
              src={coverUrl}
              alt={book.title}
              className="w-full aspect-[3/4] object-cover image-scale"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/70 to-transparent pointer-events-none"></div>

            {/* Book Title Overlay */}
            <div className="absolute top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-4">
              <h3 className="text-base sm:text-lg font-semibold text-white drop-shadow-lg line-clamp-2">
                {book.title}
              </h3>
            </div>

            {/* Rating Badge */}
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
              <div className="flex items-center gap-1 bg-black/30 backdrop-blur-sm rounded-full px-2 py-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-medium text-white">{book.rating || '4.5'}</span>
              </div>
            </div>

            {/* Audio Play Button */}
            {(book.audioLink || book.audio_link) && (
              isAuthenticated ? (
                <button
                  onClick={handlePlay}
                  className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 w-9 h-9 sm:w-10 sm:h-10 bg-green-600/90 backdrop-blur-sm rounded-full flex items-center justify-center hover-scale-sm"
                  title="Play Audio"
                >
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 text-white ml-0.5" />
                </button>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 w-9 h-9 sm:w-10 sm:h-10 bg-gray-600/90 backdrop-blur-sm rounded-full flex items-center justify-center hover-scale-sm"
                  title="Sign in to listen"
                >
                  <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </button>
              )
            )}
          </div>

          <div className="p-3 sm:p-4">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="flex-1 min-w-0 hover-translate">
                <p className="text-sm font-medium text-white truncate">
                  {book.author}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {book.genre || book.category}
                </p>
              </div>

              <div className="flex items-center gap-1 ml-2">
                <BookOpen className="w-3 h-3 text-gray-500" />
                <span className="text-xs text-gray-400">
                  {book.pages || 'PDF'}
                </span>
              </div>
            </div>

            {/* Action Buttons - Only show if user is authenticated */}
            <div className="space-y-2" onClick={(e) => e.preventDefault()}>
              <DownloadButton book={book} variant="compact" showPreview={false} />
              <FavoriteButton book={book} variant="compact" showText={false} />
            </div>
          </div>
        </div>
      </Link>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultMode="login"
      />
    </>
  );
};

export default BookCard;
