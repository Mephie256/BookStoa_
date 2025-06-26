import { useState, useEffect } from 'react';
import { Search, Filter, Grid, List, BookOpen, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import BookCard from '../components/BookCard';
import DesktopAudioPlayer from '../components/DesktopAudioPlayer';
import { Aurora } from '../components/ui/aurora';
import { libraryApi } from '../services/newApi';
import { userDataService } from '../services/userDataService';
import { useAuth } from '../contexts/SimpleAuthContext';
import LoaderOne from '../components/ui/loader-one';
import AuthModal from '../components/AuthModal';

const Library = () => {
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('title');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_books: 0,
    currently_reading: 0,
    completed: 0,
    want_to_read: 0,
    paused: 0
  });

  const { user } = useAuth();



  // Demo library books data
  const mockBooks = [
    {
      id: '1',
      title: 'The Purpose Driven Life',
      author: 'Rick Warren',
      coverUrl: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1320532872i/4063.jpg',
      rating: 4.8,
      genre: 'Christian Living',
      publishedDate: '2024-01-15'
    },
    {
      id: '2',
      title: 'Jesus Calling',
      author: 'Sarah Young',
      coverUrl: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1320552628i/8186808.jpg',
      rating: 4.7,
      genre: 'Devotional',
      publishedDate: '2024-01-10'
    },
    {
      id: '3',
      title: 'Mere Christianity',
      author: 'C.S. Lewis',
      coverUrl: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1308068055i/801463.jpg',
      rating: 4.9,
      genre: 'Theology',
      publishedDate: '2024-01-05'
    },
    {
      id: '4',
      title: 'The Case for Christ',
      author: 'Lee Strobel',
      coverUrl: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1347765716i/32773.jpg',
      rating: 4.6,
      genre: 'Apologetics',
      publishedDate: '2024-01-20'
    },
    {
      id: '5',
      title: 'Crazy Love',
      author: 'Francis Chan',
      coverUrl: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1266815746i/6827756.jpg',
      rating: 4.8,
      genre: 'Christian Living',
      publishedDate: '2024-01-18'
    }
  ];

  useEffect(() => {
    const loadLibrary = async () => {
      if (!user) {
        setBooks([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const userId = user?.id || user?.email || user?.uid;
        console.log('📚 Loading library for user:', userId);

        // Try to load from API first, fallback to localStorage
        try {
          const [libraryData, statsData] = await Promise.all([
            libraryApi.getLibrary(userId),
            libraryApi.getStats(userId)
          ]);

          console.log('📚 Loaded library from API:', libraryData);
          console.log('📊 Loaded stats from API:', statsData);

          setBooks(libraryData || []);
          setStats(statsData || {
            total_books: 0,
            currently_reading: 0,
            completed: 0,
            want_to_read: 0,
            paused: 0
          });
        } catch (apiError) {
          console.warn('📚 API failed, falling back to localStorage:', apiError);

          // Fallback to localStorage
          // First, try to fix any missing image URLs in existing data
          userDataService.fixImageUrls(userId);

          const localLibrary = userDataService.getLibrary(userId);
          const localStats = userDataService.getStats(userId);

          console.log('📚 Loaded library from localStorage:', localLibrary);
          console.log('📊 Loaded stats from localStorage:', localStats);

          // Debug: Check image URLs in library data
          if (localLibrary && localLibrary.length > 0) {
            console.log('🖼️ Image URLs in library:', localLibrary.map(book => ({
              id: book.id,
              title: book.title,
              cover_file_url: book.cover_file_url,
              coverUrl: book.coverUrl,
              cover_url: book.cover_url,
              image_url: book.image_url
            })));
          }

          setBooks(localLibrary || []);
          setStats({
            total_books: localStats?.totalLibraryItems || 0,
            currently_reading: 0,
            completed: 0,
            want_to_read: 0,
            paused: 0
          });
        }
      } catch (error) {
        console.error('❌ Error loading library:', error);
        setBooks([]);
      } finally {
        setLoading(false);
      }
    };

    loadLibrary();
  }, [user]);

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = selectedGenre === 'all' || book.genre === selectedGenre;
    const matchesStatus = selectedStatus === 'all' || book.reading_status === selectedStatus;
    return matchesSearch && matchesGenre && matchesStatus;
  });

  const sortedBooks = [...filteredBooks].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'author':
        return a.author.localeCompare(b.author);
      case 'rating':
        return b.rating - a.rating;
      case 'newest':
        return new Date(b.published_date || b.publishedDate) - new Date(a.published_date || a.publishedDate);
      default:
        return 0;
    }
  });

  const genres = ['all', ...new Set(books.map(book => book.genre))];
  const readingStatuses = [
    { value: 'all', label: 'All Books' },
    { value: 'want_to_read', label: 'Want to Read' },
    { value: 'reading', label: 'Currently Reading' },
    { value: 'completed', label: 'Completed' },
    { value: 'paused', label: 'Paused' }
  ];

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
        <Sidebar />
        <main className="min-h-screen overflow-auto relative z-20 md:ml-60 lg:ml-80 pb-32 md:pb-24">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-10 h-10 text-green-400" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-4">Sign In Required</h1>
              <p className="text-gray-400 mb-8 leading-relaxed">
                You need to sign in to access your personal library. Create an account or sign in to start building your reading collection.
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

      <main className="min-h-screen overflow-auto relative z-20 md:ml-60 lg:ml-80 pb-32 md:pb-24">
        {/* Header */}
        <div className="sticky top-0 z-30 bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50 px-4 md:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg overflow-hidden bg-white/10 backdrop-blur-sm">
                <img
                  src="https://i.ibb.co/5W2jJ7qT/Untitled-design-10.png"
                  alt="Pneuma Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">My Personal Library</h1>
                <p className="text-gray-300">Your curated book collection - {stats.total_books} books</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* View Mode Toggle */}
              <div className="flex bg-gray-800/50 rounded-xl p-1 border border-gray-700/50">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-green-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list'
                      ? 'bg-green-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 md:px-8 py-6 space-y-8 relative z-20">
          {/* Library Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-gray-700/50">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{stats.total_books}</p>
                <p className="text-gray-400 text-sm">Total Books</p>
              </div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-gray-700/50">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-400">{stats.currently_reading}</p>
                <p className="text-gray-400 text-sm">Reading</p>
              </div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-gray-700/50">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">{stats.completed}</p>
                <p className="text-gray-400 text-sm">Completed</p>
              </div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-gray-700/50">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-400">{stats.want_to_read}</p>
                <p className="text-gray-400 text-sm">Want to Read</p>
              </div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-gray-700/50">
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-400">{stats.paused}</p>
                <p className="text-gray-400 text-sm">Paused</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-gray-700/50">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search your library..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 backdrop-blur-sm transition-all duration-200"
                  />
                </div>
              </div>

              {/* Reading Status Filter */}
              <div>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 backdrop-blur-sm transition-all duration-200"
                >
                  {readingStatuses.map(status => (
                    <option key={status.value} value={status.value} className="bg-gray-800">
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Genre Filter */}
              <div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={selectedGenre}
                    onChange={(e) => setSelectedGenre(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 backdrop-blur-sm transition-all duration-200"
                  >
                    {genres.map(genre => (
                      <option key={genre} value={genre} className="bg-gray-800">
                        {genre === 'all' ? 'All Genres' : genre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sort */}
              <div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 backdrop-blur-sm transition-all duration-200"
                >
                  <option value="title" className="bg-gray-800">Sort by Title</option>
                  <option value="author" className="bg-gray-800">Sort by Author</option>
                  <option value="rating" className="bg-gray-800">Sort by Rating</option>
                  <option value="newest" className="bg-gray-800">Sort by Added Date</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Header */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">
              {sortedBooks.length} {sortedBooks.length === 1 ? 'Book' : 'Books'} Found
            </h2>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="mb-4">
                  <LoaderOne />
                </div>
                <p className="text-gray-300">Loading your library...</p>
              </div>
            </div>
          )}

          {/* Books Display */}
          {!loading && sortedBooks.length > 0 ? (
            <div className={
              viewMode === 'grid'
                ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 justify-items-center'
                : 'space-y-4'
            }>
              {sortedBooks.map((libraryBook) => (
                <BookCard
                  key={libraryBook.book_id}
                  book={{
                    id: libraryBook.book_id,
                    title: libraryBook.title,
                    author: libraryBook.author,
                    description: libraryBook.description,
                    genre: libraryBook.genre,
                    category: libraryBook.category,
                    coverFileUrl: libraryBook.cover_file_url,
                    rating: libraryBook.rating,
                    totalRatings: libraryBook.total_ratings,
                    downloads: libraryBook.downloads,
                    pdfFileUrl: libraryBook.pdf_file_url,
                    audioLink: libraryBook.audio_link,
                    pages: libraryBook.pages,
                    language: libraryBook.language,
                    publisher: libraryBook.publisher,
                    publishedDate: libraryBook.published_date,
                    readingStatus: libraryBook.reading_status,
                    progress: libraryBook.progress,
                    addedAt: libraryBook.added_at
                  }}
                  variant={viewMode === 'list' ? 'featured' : 'default'}
                  showReadingStatus={true}
                />
              ))}
            </div>
          ) : !loading ? (
            <div className="text-center py-16">
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-12 shadow-2xl border border-gray-700/50 max-w-md mx-auto">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Books Found</h3>
                <p className="text-gray-400 mb-6">
                  {searchTerm || selectedGenre !== 'all' || selectedStatus !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Your personal library is empty. Start adding books from the home page!'
                  }
                </p>
                {(!searchTerm && selectedGenre === 'all' && selectedStatus === 'all') && (
                  <button
                    onClick={() => window.location.href = '/'}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl font-medium hover:from-green-700 hover:to-green-600 transition-all duration-200 shadow-lg"
                  >
                    Browse Books
                  </button>
                )}
              </div>
            </div>
          ) : null}
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

export default Library;
