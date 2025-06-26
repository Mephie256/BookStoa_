import { Star, Headphones, Play, BookOpen, FileText, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAudio } from '../contexts/AudioContext';
import { useAuth } from '../contexts/SimpleAuthContext';
import AuthModal from './AuthModal';

const MobileBookCard = ({ book }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { playTrack } = useAudio();
  const { user } = useAuth();
  const isAuthenticated = !!user;

  const handleImageLoad = () => setImageLoaded(true);
  const handleImageError = () => setImageError(true);

  const coverUrl = book.cover_file_url || book.coverUrl || book.cover_url ||
    'https://via.placeholder.com/300x400/11b53f/ffffff?text=📖';

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
        audioLink: book.audioLink || book.audio_link,
        audio_link: book.audioLink || book.audio_link
      };

      console.log('🎵 Playing audio:', audioTrack);
      playTrack(audioTrack);
    } else {
      console.log('🎵 No audio available for this book');
    }
  };

  return (
    <>
      <div className="relative group h-full">
      <Link to={`/book/${book.id}`} className="block h-full">
        <div className="bg-gray-800/95 backdrop-blur-xl rounded-2xl overflow-hidden shadow-xl border border-gray-700/30 transition-all duration-500 hover:shadow-2xl hover:shadow-green-500/20 hover:border-green-500/50 hover:scale-[1.02] h-full flex flex-col min-h-[420px] group-hover:bg-gray-800/98">

          {/* Cover Image Section */}
          <div className="relative aspect-[3/4] overflow-hidden">
            {!imageError ? (
              <img
                src={coverUrl}
                alt={book.title}
                className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
                <div className="text-center text-gray-400">
                  <BookOpen className="w-16 h-16 mx-auto mb-2" />
                  <div className="text-sm font-medium">No Cover</div>
                </div>
              </div>
            )}

            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            {/* Dark Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent group-hover:from-black/95 transition-all duration-500"></div>

            {/* Top Right Badges */}
            <div className="absolute top-3 right-3 flex flex-col gap-2">
              {(book.audioLink || book.audio_link) && (
                <div className="w-8 h-8 bg-green-600/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-green-500/90 transition-all duration-300 hover:scale-110">
                  <Headphones className="w-4 h-4 text-white" />
                </div>
              )}

              {(book.pdf_file_url || book.pdfFileUrl || book.pdf_url) && (
                <div className="w-8 h-8 bg-blue-600/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-blue-500/90 transition-all duration-300 hover:scale-110">
                  <FileText className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            {/* Center Play Button (only show if audio available) */}
            {(book.audioLink || book.audio_link) && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 bg-black/50 backdrop-blur-sm">
                {isAuthenticated ? (
                  <button
                    onClick={handlePlay}
                    className="w-20 h-20 bg-gradient-to-br from-green-600 to-green-500 backdrop-blur-sm rounded-full flex items-center justify-center hover:from-green-500 hover:to-green-400 transition-all duration-300 shadow-2xl hover:shadow-green-500/50 hover:scale-110 border-2 border-white/20"
                    title="Play Audio"
                  >
                    <Play className="w-10 h-10 text-white ml-1 drop-shadow-lg" />
                  </button>
                ) : (
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="w-20 h-20 bg-gradient-to-br from-gray-600 to-gray-500 backdrop-blur-sm rounded-full flex items-center justify-center hover:from-gray-500 hover:to-gray-400 transition-all duration-300 shadow-2xl hover:scale-110 border-2 border-white/20"
                    title="Sign in to listen"
                  >
                    <Lock className="w-10 h-10 text-white drop-shadow-lg" />
                  </button>
                )}
              </div>
            )}

            {/* Top Left Featured Badge */}
            {book.featured && (
              <div className="absolute top-3 left-3 px-3 py-1 bg-gradient-to-r from-orange-500 to-orange-400 text-white text-xs font-bold rounded-full shadow-lg">
                Featured
              </div>
            )}


          </div>

          {/* Content Section - flex-1 to fill remaining space */}
          <div className="p-5 flex-1 flex flex-col justify-between bg-gradient-to-t from-gray-900/50 to-transparent">
            {/* Title and Author */}
            <div className="mb-4">
              <h3 className="font-bold text-white text-lg line-clamp-2 leading-tight mb-2 group-hover:text-green-400 transition-all duration-300 drop-shadow-sm">
                {book.title}
              </h3>
              <p className="text-gray-300 text-sm font-medium line-clamp-1 group-hover:text-gray-200 transition-colors">
                by {book.author}
              </p>
            </div>

            {/* Rating and Genre Row - pushed to bottom */}
            <div className="flex items-center justify-between mt-auto">
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 drop-shadow-sm" />
                <span className="text-sm font-bold text-gray-100">{book.rating || 0}</span>
                <span className="text-xs text-gray-400">({book.total_ratings || book.totalRatings || 0})</span>
              </div>

              <span className="px-3 py-1.5 bg-gradient-to-r from-green-600 to-green-500 text-white text-xs font-bold rounded-full shadow-lg hover:shadow-green-500/30 transition-all duration-300 border border-green-400/20">
                {book.genre}
              </span>
            </div>
          </div>
        </div>
      </Link>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultMode="login"
      />
    </>
  );
};

export default MobileBookCard;
