import React, { useState } from 'react';
import { Star, Download, Heart, Play, BookOpen, Headphones, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import DownloadButton from '../DownloadButton';
import FavoriteButton from '../FavoriteButton';
import { useAudio } from '../../contexts/AudioContext';
import { useAuth } from '../../contexts/BetterAuthContext';
import AuthModal from '../AuthModal';

export const BookCard = ({ book, variant = 'default' }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { playTrack } = useAudio();
  const { user } = useAuth();
  const isAuthenticated = !!user;

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
      return;
    }

    if (book.audioLink || book.audio_link) {
      const audioTrack = {
        id: book.id,
        title: book.title,
        author: book.author,
        cover_file_url: book.cover_file_url || book.coverUrl || book.cover_url,
        audioLink: book.audioLink || book.audio_link
      };
      playTrack(audioTrack);
    }
  };

  const handleImageLoad = () => setImageLoaded(true);
  const handleImageError = () => setImageError(true);

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

      <Link to={`/book/${book.id}`} className="block w-full max-w-sm">
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
            <div className="absolute top-4 left-4 right-4">
              <h3 className="text-lg font-semibold text-white drop-shadow-lg line-clamp-2">
                {book.title}
              </h3>
            </div>

            {/* Rating Badge */}
            <div className="absolute top-4 right-4">
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
                  className="absolute bottom-4 right-4 w-10 h-10 bg-green-600/90 backdrop-blur-sm rounded-full flex items-center justify-center hover-scale-sm"
                  title="Play Audio"
                >
                  <Play className="w-5 h-5 text-white ml-0.5" />
                </button>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="absolute bottom-4 right-4 w-10 h-10 bg-gray-600/90 backdrop-blur-sm rounded-full flex items-center justify-center hover-scale-sm"
                  title="Sign in to listen"
                >
                  <Lock className="w-5 h-5 text-white" />
                </button>
              )
            )}
          </div>

          <div className="p-4">
            <div className="flex items-start justify-between mb-3">
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
