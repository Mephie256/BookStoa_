import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, Play, Download, Heart, Share, Headphones, BookOpen } from 'lucide-react';
import LoaderOne from '../components/ui/loader-one';
import DownloadButton from '../components/DownloadButton';
import FavoriteButton from '../components/FavoriteButton';
import PDFViewer from '../components/PDFViewer';
import AuthModal from '../components/AuthModal';

import { booksApi, libraryApi } from '../services/newApi';
import { useAuth } from '../contexts/BetterAuthContext';
import { useAudio } from '../contexts/AudioContext';
import { useToast } from '../contexts/ToastContext';
import { Aurora } from '../components/ui/aurora';

const BookDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { playTrack } = useAudio();
  const toast = useToast();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPDFViewerOpen, setIsPDFViewerOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Handle audio play
  const handlePlayAudio = () => {
    if (!user) {
      // Show auth modal if not signed in
      setShowAuthModal(true);
      return;
    }

    if (book && (book.audioLink || book.audio_link)) {
      const audioTrack = {
        id: book.id,
        title: book.title,
        author: book.author,
        cover_file_url: book.cover_file_url || book.coverUrl || book.cover_url,
        audioLink: book.audioLink || book.audio_link,
        audio_link: book.audioLink || book.audio_link
      };

      console.log('🎵 Playing audio from BookDetail:', audioTrack);
      playTrack(audioTrack);
    }
  };

  // Handle start reading
  const handleStartReading = () => {
    if (book && (book.pdf_file_url || book.pdfFileUrl || book.pdf_url)) {
      console.log('📖 Opening PDF viewer for:', book.title);
      setIsPDFViewerOpen(true);
    } else {
      console.log('📖 No PDF available for this book');
      alert('PDF file is not available for this book.');
    }
  };

  // Automatically add book to library when visited
  const addToLibraryAutomatically = async (bookData) => {
    if (!user || !bookData) return;

    try {
      console.log('📚 Auto-adding book to library:', bookData.title);
      const result = await libraryApi.addToLibrary(user.id, bookData.id, 'visited');

      if (result.success) {
        console.log('✅ Book automatically added to library:', result.message);
        toast.success(result.message || 'Added to your library', 'Added to Library', { duration: 2500 });
      } else {
        console.log('📚 Library status:', result.message || result.error);
      }
    } catch (error) {
      console.error('❌ Error auto-adding to library:', error);
    }
  };

  // Fetch book data from API
  useEffect(() => {
    const fetchBook = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        console.log('📚 Fetching book with ID:', id);
        const response = await booksApi.getById(id);

        if (response && response.success !== false) {
          const bookData = response.book || response;
          console.log('✅ Book fetched successfully:', bookData);
          setBook(bookData);

          // Automatically add to library when book is viewed
          await addToLibraryAutomatically(bookData);
        } else {
          throw new Error('Book not found');
        }
      } catch (error) {
        console.error('❌ Error fetching book:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id, user]);

  // Loading state
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

        <main className="min-h-screen p-8 flex items-center justify-center relative z-20 md:ml-60 lg:ml-80 pb-32 md:pb-24">
          <div className="text-center">
            <div className="mb-4">
              <LoaderOne />
            </div>
            <p className="text-gray-300">Loading book details...</p>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error || !book) {
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

        <main className="min-h-screen p-8 flex items-center justify-center relative z-20 md:ml-60 lg:ml-80 pb-32 md:pb-24">
          <div className="text-center">
            <div className="text-red-400 text-6xl mb-4">📚</div>
            <h1 className="text-2xl font-bold text-white mb-2">Book Not Found</h1>
            <p className="text-gray-300 mb-6">{error || 'The book you\'re looking for doesn\'t exist.'}</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
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



      <main className="min-h-screen p-4 md:p-8 relative z-20 md:ml-60 lg:ml-80 pb-32 md:pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/"
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors backdrop-blur-xl bg-gray-800/50 px-4 py-2 rounded-xl border border-gray-700/50 shadow-lg"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back to Library</span>
          </Link>
        </div>

        {/* Book Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Book Cover and Actions */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-md p-6 shadow-2xl border border-gray-700/30">
              <div className="relative mb-6">
                <img
                  src={book.cover_file_url || book.coverUrl || book.cover_url || book.image_url || 'https://via.placeholder.com/300x400/11b53f/ffffff?text=📖'}
                  alt={book.title}
                  className="w-full max-w-xs mx-auto rounded-xl shadow-2xl"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x400/11b53f/ffffff?text=📖';
                  }}
                />
                {(book.audio_link || book.audioLink) && (
                  <div className="absolute top-4 right-4 w-8 h-8 bg-green-600/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                    <Headphones className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleStartReading}
                  disabled={!book || !(book.pdf_file_url || book.pdfFileUrl || book.pdf_url)}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-500 text-white py-3 px-4 rounded-xl font-medium hover:from-green-700 hover:to-green-600 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <BookOpen className="w-4 h-4" />
                  {(book?.pdf_file_url || book?.pdfFileUrl || book?.pdf_url) ? 'Start Reading' : 'PDF Not Available'}
                </button>

                {(book.audio_link || book.audioLink) && (
                  <button
                    onClick={handlePlayAudio}
                    className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all duration-200 shadow-lg ${
                      user
                        ? 'bg-gradient-to-r from-green-600 to-green-500 text-white hover:from-green-700 hover:to-green-600'
                        : 'bg-gradient-to-r from-gray-600 to-gray-500 text-white hover:from-gray-700 hover:to-gray-600'
                    }`}
                  >
                    <Headphones className="w-4 h-4" />
                    {user ? 'Listen to Audiobook' : 'Sign In to Listen'}
                  </button>
                )}

                <DownloadButton book={book} variant="full" showPreview={false} />

                <FavoriteButton book={book} variant="full" />

                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-2 border border-gray-600/50 text-gray-300 py-3 px-4 rounded-xl font-medium hover:bg-gray-700/30 hover:text-white transition-colors backdrop-blur-sm">
                    <Share className="w-4 h-4" />
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Book Information */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-md p-6 shadow-2xl border border-gray-700/30">
              <h1 className="text-3xl font-bold text-white mb-2">{book.title}</h1>
              <p className="text-lg text-gray-300 mb-4">by {book.author}</p>

              {/* Rating - Matching Card Style with Green Stars */}
              <div className="flex items-center gap-2 mb-6">
                <div className="flex items-center gap-0.5">
                  {Array(5).fill('').map((_, i) => {
                    const rating = book.rating || 4;
                    return rating > i ? (
                      <svg key={i} width="18" height="17" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8.049.927c.3-.921 1.603-.921 1.902 0l1.294 3.983a1 1 0 0 0 .951.69h4.188c.969 0 1.371 1.24.588 1.81l-3.388 2.46a1 1 0 0 0-.364 1.118l1.295 3.983c.299.921-.756 1.688-1.54 1.118L9.589 13.63a1 1 0 0 0-1.176 0l-3.389 2.46c-.783.57-1.838-.197-1.539-1.118L4.78 10.99a1 1 0 0 0-.363-1.118L1.028 7.41c-.783-.57-.38-1.81.588-1.81h4.188a1 1 0 0 0 .95-.69z" fill="#22c55e" />
                      </svg>
                    ) : (
                      <svg key={i} width="18" height="17" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8.04894 0.927049C8.3483 0.00573802 9.6517 0.00574017 9.95106 0.927051L11.2451 4.90983C11.379 5.32185 11.763 5.60081 12.1962 5.60081H16.3839C17.3527 5.60081 17.7554 6.84043 16.9717 7.40983L13.5838 9.87132C13.2333 10.126 13.0866 10.5773 13.2205 10.9894L14.5146 14.9721C14.8139 15.8934 13.7595 16.6596 12.9757 16.0902L9.58778 13.6287C9.2373 13.374 8.7627 13.374 8.41221 13.6287L5.02426 16.0902C4.24054 16.6596 3.18607 15.8934 3.48542 14.9721L4.7795 10.9894C4.91338 10.5773 4.76672 10.126 4.41623 9.87132L1.02827 7.40983C0.244561 6.84043 0.647338 5.60081 1.61606 5.60081H5.8038C6.23703 5.60081 6.62099 5.32185 6.75486 4.90983L8.04894 0.927049Z" fill="#22c55e" fillOpacity="0.35" />
                      </svg>
                    );
                  })}
                </div>
                <span className="text-sm font-medium text-gray-200">({book.rating || 4})</span>
                <span className="text-sm text-gray-400">({book.total_ratings || book.totalRatings || 0} ratings)</span>
              </div>

              {/* Book Details - Card Style, Only Show if Data Exists */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {book.genre && (
                  <div className="bg-gray-800/40 backdrop-blur-md rounded-xl p-3 border border-gray-700/50">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Genre</p>
                    <p className="text-sm font-medium text-white">{book.genre}</p>
                  </div>
                )}
                {book.pages && (
                  <div className="bg-gray-800/40 backdrop-blur-md rounded-xl p-3 border border-gray-700/50">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Pages</p>
                    <p className="text-sm font-medium text-white">{book.pages}</p>
                  </div>
                )}
                {book.language && (
                  <div className="bg-gray-800/40 backdrop-blur-md rounded-xl p-3 border border-gray-700/50">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Language</p>
                    <p className="text-sm font-medium text-white">{book.language}</p>
                  </div>
                )}
                {book.publisher && (
                  <div className="bg-gray-800/40 backdrop-blur-md rounded-xl p-3 border border-gray-700/50">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Publisher</p>
                    <p className="text-sm font-medium text-white">{book.publisher}</p>
                  </div>
                )}
              </div>

              {/* Tags - Fixed for PostgreSQL Array Format */}
              {book.tags && (() => {
                const parseTags = (tags) => {
                  if (!tags) return [];
                  
                  // If it's already an array, return it
                  if (Array.isArray(tags)) return tags;
                  
                  // If it's a string, parse it
                  if (typeof tags === 'string') {
                    const trimmed = tags.trim();
                    
                    // Handle PostgreSQL array format: {"Purpose", "Life", "Spiritual Growth"}
                    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
                      return trimmed
                        .slice(1, -1) // Remove { and }
                        .split(',') // Split by comma
                        .map(tag => tag.trim().replace(/^"|"$/g, '')) // Remove quotes
                        .filter(Boolean);
                    }
                    
                    // Handle JSON array format: ["Purpose", "Life"]
                    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
                      try {
                        const parsed = JSON.parse(trimmed);
                        return Array.isArray(parsed) ? parsed : [];
                      } catch (e) {
                        console.error('Failed to parse tags JSON:', e);
                      }
                    }
                    
                    // Otherwise split by comma
                    return trimmed.split(',').map(t => t.trim()).filter(Boolean);
                  }
                  
                  return [];
                };
                
                const tagArray = parseTags(book.tags);
                return tagArray.length > 0 ? (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-white mb-3">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {tagArray.slice(0, 6).map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-green-600/20 text-green-400 rounded-full text-xs font-medium border border-green-500/30"
                        >
                          {String(tag).trim()}
                        </span>
                      ))}
                      {tagArray.length > 6 && (
                        <span className="px-3 py-1 bg-gray-600/20 text-gray-400 rounded-full text-xs font-medium">
                          +{tagArray.length - 6} more
                        </span>
                      )}
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">About this book</h3>
                <p className="text-gray-300 leading-relaxed mb-4">{book.description}</p>
                {(book.full_description || book.fullDescription) && (
                  <p className="text-gray-400 leading-relaxed">{book.full_description || book.fullDescription}</p>
                )}
              </div>
            </div>
          </div>


        </div>
      </main>

      {/* PDF Viewer Modal */}
      <PDFViewer
        book={book}
        isOpen={isPDFViewerOpen}
        onClose={() => setIsPDFViewerOpen(false)}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultMode="login"
      />
    </div>
  );
};

export default BookDetail;
