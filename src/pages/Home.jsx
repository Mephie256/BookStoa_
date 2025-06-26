import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, Star, Play } from 'lucide-react';
import BookCard from '../components/BookCard';
import Sidebar from '../components/Sidebar';
import MobileHeader from '../components/MobileHeader';
import GoogleStyleSearch from '../components/GoogleStyleSearch';
import LoaderOne from '../components/ui/loader-one';
import { booksApi } from '../services/newApi';
import { useAudio } from '../contexts/AudioContext';
import { Aurora } from '../components/ui/aurora';

const Home = () => {
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  // Removed mock books - now using only API data

  // Removed exclusive book - now using only API data

  useEffect(() => {
    const loadBooks = async () => {
      setIsLoading(true);
      try {
        console.log('📚 Loading books from API...');
        const response = await booksApi.getAll();
        const apiBooks = response.books || response || [];
        console.log('📚 API returned:', apiBooks.length, 'books');

        // Use API books (even if empty)
        setBooks(apiBooks);
        console.log('📚 Loaded', apiBooks.length, 'books from API');
      } catch (error) {
        console.error('❌ Error loading books:', error);
        console.log('📚 Error loading from API, showing empty state');
        setBooks([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadBooks();
  }, []);

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

      {/* Mobile Header */}
      <MobileHeader
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onSearch={(query) => {
          console.log('🔍 Home mobile search:', query);
          navigate(`/search?q=${encodeURIComponent(query)}`);
        }}
      />

      <main className="min-h-screen overflow-auto relative z-20 md:ml-60 lg:ml-80 pb-32 md:pb-24">

        {/* Desktop Header */}
        <div className="hidden md:block sticky top-0 z-30 bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50 px-8 py-6">
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
                <h1 className="text-3xl font-bold text-white mb-1">Discover Amazing Books</h1>
                <p className="text-gray-300">Explore our curated collection of Christian literature</p>
              </div>
            </div>

            <GoogleStyleSearch
              placeholder="Search books, authors, genres..."
              variant="header"
              className="w-96"
            />
          </div>
        </div>

        <div className="px-4 md:px-8 py-6 space-y-12 relative z-20">

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="mb-4">
                  <LoaderOne />
                </div>
                <p className="text-gray-300">Loading amazing books...</p>
              </div>
            </div>
          )}

          {/* Main Content - Only show when not loading */}
          {!isLoading && (
            <>
              {/* Hero Section with Aurora Background */}
              <div className="relative overflow-hidden rounded-3xl p-8 text-white min-h-[400px]">
            {/* Dark Aurora Background */}
            <div className="absolute inset-0">
              <Aurora
                colorStops={["#0d8a2f", "#11b53f", "#16c946"]}
                blend={0.7}
                amplitude={1.2}
                speed={0.25}
                className="w-full h-full"
              />
            </div>
            {/* Dark overlay for better text readability */}
            <div className="absolute inset-0 bg-black/30"></div>
            <div className="relative z-10 flex items-center justify-between h-full">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold">
                    ✨ Featured Collection
                  </span>
                </div>
                <h2 className="text-4xl font-bold mb-4">Discover Life-Changing Books</h2>
                <p className="text-xl text-white/90 mb-6 max-w-2xl">
                  Explore our curated collection of Christian literature that will inspire, challenge, and transform your faith journey.
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => navigate('/books')}
                    className="px-6 py-3 bg-white text-gray-900 rounded-xl font-semibold hover:bg-white/90 transition-colors shadow-lg"
                  >
                    Browse Collection
                  </button>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="grid grid-cols-2 gap-4">
                  {filteredBooks.slice(0, 4).map((book, index) => (
                    <div key={book.id} className="relative group">
                      <img
                        src={book.cover_file_url || book.coverUrl || book.cover_url || book.image_url || book.thumbnail || 'https://via.placeholder.com/96x128/11b53f/ffffff?text=📖'}
                        alt={book.title}
                        className="w-24 h-32 object-cover rounded-xl shadow-lg transform rotate-3 group-hover:rotate-0 transition-transform duration-300"
                        style={{
                          transform: `rotate(${index % 2 === 0 ? '3deg' : '-3deg'})`,
                          zIndex: index
                        }}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/96x128/11b53f/ffffff?text=📖';
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Featured Book or Empty State */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Featured This Week</h2>
              <div className="flex gap-2">
                <button className="w-10 h-10 bg-gray-800/50 border border-gray-600 rounded-full flex items-center justify-center hover:bg-gray-700/50 transition-colors shadow-sm">
                  <ChevronLeft className="w-5 h-5 text-gray-300" />
                </button>
                <button className="w-10 h-10 bg-gray-800/50 border border-gray-600 rounded-full flex items-center justify-center hover:bg-gray-700/50 transition-colors shadow-sm">
                  <ChevronRight className="w-5 h-5 text-gray-300" />
                </button>
              </div>
            </div>

            {filteredBooks.length > 0 ? (
              <BookCard book={filteredBooks[0]} variant="featured" />
            ) : (
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 text-center border border-gray-700/50">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No Books Available</h3>
                <p className="text-gray-400 mb-6">The library is currently empty. Check back later for new additions!</p>
                <button
                  onClick={() => navigate('/admin/upload')}
                  className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
                >
                  Add First Book
                </button>
              </div>
            )}
          </div>

          {/* Popular Books */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Popular This Month</h2>
                <p className="text-gray-300">Most loved books by our community</p>
              </div>
              <div className="flex gap-2">
                <button className="w-10 h-10 bg-gray-800/50 border border-gray-600 rounded-full flex items-center justify-center hover:bg-gray-700/50 transition-colors shadow-sm">
                  <ChevronLeft className="w-5 h-5 text-gray-300" />
                </button>
                <button className="w-10 h-10 bg-gray-800/50 border border-gray-600 rounded-full flex items-center justify-center hover:bg-gray-700/50 transition-colors shadow-sm">
                  <ChevronRight className="w-5 h-5 text-gray-300" />
                </button>
              </div>
            </div>

            {/* Responsive grid: 2 columns mobile, 3 tablet, 4 desktop */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 justify-items-center">
              {filteredBooks.length > 1 ? (
                filteredBooks.slice(1, 6).map((book) => (
                  <BookCard key={book.id} book={book} />
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-400">No additional books to display</p>
                </div>
              )}
            </div>
          </div>

          {/* Recently Added */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Recently Added</h2>
                <p className="text-gray-300">Fresh additions to our library</p>
              </div>
              <button
                onClick={() => navigate('/books')}
                className="font-semibold transition-colors hover:opacity-80"
                style={{color: '#11b53f'}}
              >
                View All →
              </button>
            </div>

            {/* Show recent books - if we have enough, show slice, otherwise show all */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 justify-items-center">
              {filteredBooks.length > 6 ? (
                // If we have more than 6 books, show the last 5 (most recent)
                filteredBooks.slice(-5).reverse().map((book) => (
                  <BookCard key={`recent-${book.id}`} book={book} />
                ))
              ) : (
                // If we have 6 or fewer books, show all except the first one (featured)
                filteredBooks.slice(1).map((book) => (
                  <BookCard key={`recent-${book.id}`} book={book} />
                ))
              )}
            </div>

            {/* Show message if no books */}
            {filteredBooks.length <= 1 && (
              <div className="text-center py-8">
                <p className="text-gray-400">No recent books available</p>
              </div>
            )}
          </div>

          {/* Categories */}
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Browse by Category</h2>
              <p className="text-gray-300">Discover books by your favorite genres</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {['Christian Living', 'Devotional', 'Theology', 'Apologetics'].map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    console.log('🏷️ Category clicked:', category);
                    navigate(`/search?q=${encodeURIComponent(category)}`);
                  }}
                  className="group cursor-pointer text-left"
                >
                  <div className="rounded-xl md:rounded-2xl p-4 md:p-6 text-white hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl border border-gray-700/30 hover:border-green-500/50 hover:shadow-green-500/10">
                    <h3 className="font-bold text-sm md:text-lg mb-1 md:mb-2 text-green-400 leading-tight">{category}</h3>
                    <p className="text-gray-400 text-xs md:text-sm font-medium">
                      {filteredBooks.filter(book =>
                        book.genre === category ||
                        book.category === category ||
                        book.tags?.includes(category)
                      ).length} books
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
          </>
          )}
        </div>
      </main>


    </div>
  );
};

export default Home;
