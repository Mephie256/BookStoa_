import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, Filter, Grid, List, X, Sparkles } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import BookCard from '../components/BookCard';
import LoaderOne from '../components/ui/loader-one';
import GoogleStyleSearch from '../components/GoogleStyleSearch';
import { Aurora } from '../components/ui/aurora';
import { booksApi } from '../services/newApi';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('relevance');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Perform search
  const performSearch = async (query = searchTerm) => {
    if (!query.trim()) {
      setBooks([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      console.log('🔍 Searching for:', query);

      const response = await booksApi.search(query, {
        genre: selectedGenre !== 'all' ? selectedGenre : undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined
      });

      const searchResults = response.books || response || [];
      console.log('🔍 Search results:', searchResults);

      setBooks(searchResults);

      // Update URL
      if (query) {
        setSearchParams({ q: query });
      } else {
        setSearchParams({});
      }
    } catch (error) {
      console.error('❌ Search error:', error);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle search input
  const handleSearch = (e) => {
    e.preventDefault();
    performSearch();
  };

  // Handle filter changes
  useEffect(() => {
    if (hasSearched) {
      performSearch();
    }
  }, [selectedGenre, selectedCategory]);

  // Initial search from URL params
  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchTerm(query);
      performSearch(query);
    }
  }, []);

  // Filter and sort results
  const filteredBooks = books.filter(book => {
    const matchesGenre = selectedGenre === 'all' || book.genre === selectedGenre;
    const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory;
    return matchesGenre && matchesCategory;
  });

  const sortedBooks = [...filteredBooks].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'author':
        return a.author.localeCompare(b.author);
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'newest':
        return new Date(b.published_date || b.publishedDate) - new Date(a.published_date || a.publishedDate);
      case 'downloads':
        return (b.downloads || 0) - (a.downloads || 0);
      default: // relevance
        return 0;
    }
  });

  const genres = ['all', ...new Set(books.map(book => book.genre).filter(Boolean))];
  const categories = ['all', ...new Set(books.map(book => book.category).filter(Boolean))];

  const clearSearch = () => {
    setSearchTerm('');
    setBooks([]);
    setHasSearched(false);
    setSearchParams({});
  };

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
              <SearchIcon className="w-8 h-8 text-green-400" />
              <h1 className="text-4xl font-bold text-white">Search</h1>
            </div>
            <p className="text-gray-300 text-lg">Discover your next great read with intelligent search</p>
          </div>

          {/* Google-Style Search */}
          <div className="mb-8">
            <GoogleStyleSearch
              placeholder="Search books, authors, genres..."
              initialValue={searchTerm}
              onSearch={(query) => {
                setSearchTerm(query);
                performSearch(query);
              }}
              variant="desktop"
              className="mb-6"
            />
          </div>

          {/* Advanced Filters */}
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-gray-700/50 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-semibold text-white">Advanced Filters</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Genre Filter */}
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
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
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
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
                <option value="relevance" className="bg-gray-800">Most Relevant</option>
                <option value="title" className="bg-gray-800">Title A-Z</option>
                <option value="author" className="bg-gray-800">Author A-Z</option>
                <option value="rating" className="bg-gray-800">Highest Rated</option>
                <option value="downloads" className="bg-gray-800">Most Downloaded</option>
                <option value="newest" className="bg-gray-800">Newest First</option>
              </select>
            </div>
          </div>

          {/* Results */}
          {hasSearched && (
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-gray-700/50">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">
                  {loading ? 'Searching...' : `${sortedBooks.length} Results for "${searchTerm}"`}
                </h2>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'grid' ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'list' ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <div className="mb-4">
                      <LoaderOne />
                    </div>
                    <p className="text-gray-300">Searching books...</p>
                  </div>
                </div>
              ) : sortedBooks.length > 0 ? (
                <div className={`grid gap-6 ${
                  viewMode === 'grid'
                    ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 justify-items-center'
                    : 'grid-cols-1'
                }`}>
                  {sortedBooks.map((book) => (
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
                  <SearchIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No books found</h3>
                  <p className="text-gray-400 mb-6">
                    Try adjusting your search terms or filters
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Search Tips */}
          {!hasSearched && (
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">Search Tips</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
                <div>
                  <h4 className="font-medium text-white mb-2">What you can search for:</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Book titles</li>
                    <li>• Author names</li>
                    <li>• Book descriptions</li>
                    <li>• Keywords and topics</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-white mb-2">Filter options:</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Filter by genre</li>
                    <li>• Filter by category</li>
                    <li>• Sort by relevance, rating, or date</li>
                    <li>• Switch between grid and list view</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>


    </div>
  );
};

export default Search;
