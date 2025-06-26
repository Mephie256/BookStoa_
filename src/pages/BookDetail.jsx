import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, Play, Download, Heart, Share, Headphones, BookOpen } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import LoaderOne from '../components/ui/loader-one';
import DownloadButton from '../components/DownloadButton';
import FavoriteButton from '../components/FavoriteButton';
import PDFViewer from '../components/PDFViewer';
import AuthModal from '../components/AuthModal';

import { booksApi, libraryApi } from '../services/newApi';
import { useAuth } from '../contexts/SimpleAuthContext';
import { useAudio } from '../contexts/AudioContext';
import { Aurora } from '../components/ui/aurora';

const BookDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { playTrack } = useAudio();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addedToLibrary, setAddedToLibrary] = useState(false);
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
        setAddedToLibrary(true);
        // Hide notification after 3 seconds
        setTimeout(() => setAddedToLibrary(false), 3000);
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

        <Sidebar />
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

        <Sidebar />
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

      <Sidebar />

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

          {/* Auto-added to Library Notification */}
          {addedToLibrary && (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-600/90 backdrop-blur-xl text-white text-sm font-medium rounded-xl border border-green-500/50 shadow-lg animate-fade-in">
              <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
              Added to your library
            </div>
          )}
        </div>

        {/* Book Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Book Cover and Actions */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-gray-700/50">
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

                <DownloadButton book={book} variant="full" showPreview={true} />

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
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-gray-700/50">
              <h1 className="text-3xl font-bold text-white mb-2">{book.title}</h1>
              <p className="text-lg text-gray-300 mb-4">by {book.author}</p>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-6">
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
                <span className="text-sm font-medium text-gray-200">{book.rating || 0}</span>
                <span className="text-sm text-gray-400">({book.total_ratings || book.totalRatings || 0} ratings)</span>
              </div>

              {/* Book Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-700/30 backdrop-blur-sm rounded-xl p-3 border border-gray-600/30">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Genre</p>
                  <p className="text-sm font-medium text-white">{book.genre}</p>
                </div>
                <div className="bg-gray-700/30 backdrop-blur-sm rounded-xl p-3 border border-gray-600/30">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Pages</p>
                  <p className="text-sm font-medium text-white">{book.pages}</p>
                </div>
                <div className="bg-gray-700/30 backdrop-blur-sm rounded-xl p-3 border border-gray-600/30">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Language</p>
                  <p className="text-sm font-medium text-white">{book.language}</p>
                </div>
                <div className="bg-gray-700/30 backdrop-blur-sm rounded-xl p-3 border border-gray-600/30">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Publisher</p>
                  <p className="text-sm font-medium text-white">{book.publisher}</p>
                </div>
              </div>

              {/* Tags */}
              {book.tags && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-white mb-3">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {(typeof book.tags === 'string' ? book.tags.split(',') : book.tags)
                      .filter(tag => tag.trim())
                      .slice(0, 6)
                      .map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-green-600/20 text-green-400 rounded-md text-xs font-medium border border-green-500/30"
                        >
                          {tag.trim()}
                        </span>
                      ))}
                    {(typeof book.tags === 'string' ? book.tags.split(',') : book.tags).length > 6 && (
                      <span className="px-2 py-1 bg-gray-600/20 text-gray-400 rounded-md text-xs font-medium">
                        +{(typeof book.tags === 'string' ? book.tags.split(',') : book.tags).length - 6} more
                      </span>
                    )}
                  </div>
                </div>
              )}

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
