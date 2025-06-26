import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Grid, List, Filter, SortAsc, BookOpen, Search } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import BookCard from '../components/BookCard';
import LoaderOne from '../components/ui/loader-one';
import { Aurora } from '../components/ui/aurora';
import { booksApi } from '../services/newApi';

const AllBooks = () => {
  const [searchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('title');
  const [filterGenre, setFilterGenre] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Load all books
  useEffect(() => {
    const loadAllBooks = async () => {
      setLoading(true);
      try {
        console.log('📚 Loading all books...');
        const response = await booksApi.getAll();
        const allBooks = response.books || response || [];
        console.log('📚 Loaded', allBooks.length, 'books');
        setBooks(allBooks);
      } catch (error) {
        console.error('❌ Error loading books:', error);
        setBooks([]);
      } finally {
        setLoading(false);
      }
    };

    loadAllBooks();
  }, []);

  // Filter and search books
  useEffect(() => {
    let filtered = books;

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(book =>
        book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply genre filter
    if (filterGenre !== 'all') {
      filtered = filtered.filter(book => book.genre === filterGenre);
    }

    // Apply category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(book => book.category === filterCategory);
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title?.localeCompare(b.title) || 0;
        case 'author':
          return a.author?.localeCompare(b.author) || 0;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'newest':
          return new Date(b.published_date || b.publishedDate || 0) - new Date(a.published_date || a.publishedDate || 0);
        case 'downloads':
          return (b.downloads || 0) - (a.downloads || 0);
        default:
          return 0;
      }
    });

    setFilteredBooks(filtered);
  }, [books, searchTerm, filterGenre, filterCategory, sortBy]);

  // Get unique genres and categories
  const genres = ['all', ...new Set(books.map(book => book.genre).filter(Boolean))];
  const categories = ['all', ...new Set(books.map(book => book.category).filter(Boolean))];

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Aurora Background */}
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
        <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <BookOpen className="w-8 h-8 text-green-400" />
              <h1 className="text-4xl font-bold text-white">All Books</h1>
            </div>
            <p className="text-gray-300 text-lg">Explore our complete collection of Christian literature</p>
          </div>

          {/* Search and Filters */}
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-gray-700/50">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search books, authors, descriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 backdrop-blur-sm transition-all duration-200"
                />
              </div>

              {/* Filters and Sort */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Genre Filter */}
                <select
                  value={filterGenre}
                  onChange={(e) => setFilterGenre(e.target.value)}
                  className="px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 backdrop-blur-sm transition-all duration-200"
                >
                  {genres.map(genre => (
                    <option key={genre} value={genre} className="bg-gray-800">
                      {genre === 'all' ? 'All Genres' : genre}
                    </option>
                  ))}
                </select>

                {/* Category Filter */}
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 backdrop-blur-sm transition-all duration-200"
                >
                  {categories.map(category => (
                    <option key={category} value={category} className="bg-gray-800">
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 backdrop-blur-sm transition-all duration-200"
                >
                  <option value="title" className="bg-gray-800">Title A-Z</option>
                  <option value="author" className="bg-gray-800">Author A-Z</option>
                  <option value="rating" className="bg-gray-800">Highest Rated</option>
                  <option value="downloads" className="bg-gray-800">Most Downloaded</option>
                  <option value="newest" className="bg-gray-800">Newest First</option>
                </select>

                {/* View Mode */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`flex-1 p-3 rounded-xl transition-colors flex items-center justify-center gap-2 ${
                      viewMode === 'grid'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-600/50'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                    <span className="hidden sm:inline">Grid</span>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`flex-1 p-3 rounded-xl transition-colors flex items-center justify-center gap-2 ${
                      viewMode === 'list'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-600/50'
                    }`}
                  >
                    <List className="w-4 h-4" />
                    <span className="hidden sm:inline">List</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Results Header */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">
              {loading ? 'Loading...' : `${filteredBooks.length} Books Found`}
            </h2>
            <div className="flex items-center gap-2 text-gray-400">
              <SortAsc className="w-4 h-4" />
              <span className="text-sm">
                Sorted by {sortBy === 'title' ? 'Title' : sortBy === 'author' ? 'Author' : sortBy === 'rating' ? 'Rating' : sortBy === 'downloads' ? 'Downloads' : 'Date'}
              </span>
            </div>
          </div>

          {/* Books Grid/List */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="mb-4">
                  <LoaderOne />
                </div>
                <p className="text-gray-300">Loading all books...</p>
              </div>
            </div>
          ) : filteredBooks.length > 0 ? (
            <div className={`grid gap-6 ${
              viewMode === 'grid'
                ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 justify-items-center'
                : 'grid-cols-1'
            }`}>
              {filteredBooks.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  variant={viewMode === 'list' ? 'featured' : 'default'}
                  onPlay={(track) => {
                    setCurrentTrack(track);
                    setIsPlaying(true);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No books found</h3>
              <p className="text-gray-400 mb-6">
                {searchTerm || filterGenre !== 'all' || filterCategory !== 'all'
                  ? 'Try adjusting your search terms or filters'
                  : 'No books available in the collection'
                }
              </p>
              {(searchTerm || filterGenre !== 'all' || filterCategory !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterGenre('all');
                    setFilterCategory('all');
                  }}
                  className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      </main>


    </div>
  );
};

export default AllBooks;
