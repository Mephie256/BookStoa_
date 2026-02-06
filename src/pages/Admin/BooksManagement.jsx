import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Eye, Search, Filter, Plus, BookOpen, RefreshCw } from 'lucide-react';
import { Aurora } from '../../components/ui/aurora';
import { useAuth } from '../../contexts/BetterAuthContext';
import { useModal } from '../../contexts/ModalContext';
import { booksApi } from '../../services/newApi';
import LoaderOne from '../../components/ui/loader-one';
import BookEditModal from '../../components/BookEditModal';

const BooksManagement = () => {
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGenre, setFilterGenre] = useState('all');
  const [loading, setLoading] = useState(true);
  const [editingBook, setEditingBook] = useState(null);

  const { user, isAdmin } = useAuth();
  const { showConfirm, showError, showSuccess } = useModal();
  const location = useLocation();



  useEffect(() => {
    const loadBooks = async () => {
      if (!isAdmin) return;

      setLoading(true);
      try {
        console.log('📚 Admin loading books from database...');
        const response = await booksApi.getAll();
        const booksData = response.books || response || [];
        console.log('📚 Admin loaded', booksData.length, 'books from database:', booksData);

        // Only use real database books - NO FALLBACK TO MOCK DATA
        setBooks(booksData);

        if (booksData.length === 0) {
          console.log('⚠️ No books found in database');
        }
      } catch (error) {
        console.error('❌ Error loading books from database:', error);
        // Don't fallback to mock data - show empty state instead
        setBooks([]);
      } finally {
        setLoading(false);
      }
    };

    loadBooks();
  }, [isAdmin]);

  // Handle edit from dashboard
  useEffect(() => {
    if (location.state?.editBookId && books.length > 0) {
      const bookToEdit = books.find(book => book.id === location.state.editBookId);
      if (bookToEdit) {
        setEditingBook(bookToEdit);
        // Clear the state to prevent re-opening on refresh
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state, books]);

  const handleDeleteBook = async (bookId) => {
    const confirmed = await showConfirm(
      'Are you sure you want to delete this book? This action cannot be undone.',
      'Delete Book'
    );

    if (confirmed) {
      try {
        console.log('🗑️ Starting book deletion...');
        console.log('🗑️ Book ID:', bookId);
        console.log('🗑️ Calling booksApi.delete...');

        const result = await booksApi.delete(bookId);

        console.log('🗑️ Delete API response:', result);

        if (result && result.success) {
          setBooks(books.filter(book => book.id !== bookId));
          console.log('✅ Book deleted successfully from UI');
          showSuccess('Book deleted successfully!', 'Success');
        } else {
          const errorMsg = result?.error || result?.message || 'Failed to delete book - no success response';
          console.error('❌ Delete failed:', errorMsg);
          throw new Error(errorMsg);
        }
      } catch (error) {
        console.error('❌ Error deleting book:', error);
        console.error('❌ Delete error details:', {
          message: error.message,
          stack: error.stack,
          bookId: bookId
        });
        showError('Failed to delete book: ' + error.message, 'Delete Failed');
      }
    }
  };

  const handleEditBook = (book) => {
    setEditingBook(book);
  };

  const handleSaveBook = (updatedBook) => {
    setBooks(books.map(book =>
      book.id === updatedBook.id ? updatedBook : book
    ));
    setEditingBook(null);
  };

  const handleRefreshBooks = async () => {
    setLoading(true);
    try {
      console.log('🔄 Manually refreshing books...');
      const response = await booksApi.getAll();
      const booksData = response.books || response || [];
      console.log('🔄 Refreshed books:', booksData);
      setBooks(booksData);
    } catch (error) {
      console.error('❌ Error refreshing books:', error);
      alert('Failed to refresh books: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Redirect if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400">You need admin privileges to access this page.</p>
          <Link to="/" className="mt-4 inline-block px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = filterGenre === 'all' || book.genre === filterGenre;
    return matchesSearch && matchesGenre;
  });

  const genres = ['all', ...new Set(books.map(book => book.genre).filter(Boolean))];

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

      <main className="min-h-screen relative z-20 md:ml-60 lg:ml-80 p-4 md:p-8 pb-32 md:pb-24">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link
            to="/admin"
            className="flex items-center gap-2 transition-colors mr-4 hover:opacity-80 bg-gray-800/30 px-4 py-2 rounded-xl border border-gray-700/30"
            style={{color: '#11b53f'}}
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white">Books Management</h1>
            <p className="text-gray-300 mt-1">Manage all books in your library</p>
          </div>
          <Link
            to="/admin/upload"
            className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-500 text-white px-4 py-2 rounded-md font-medium hover:from-green-700 hover:to-green-600 transition-all duration-200 shadow-lg"
          >
            <Plus className="w-4 h-4" />
            Add New Book
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-md p-6 shadow-2xl border border-gray-700/30 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search books by title or author..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200"
                />
              </div>
            </div>
            <div className="md:w-48">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={filterGenre}
                  onChange={(e) => setFilterGenre(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-md text-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200"
                >
                  {genres.map(genre => (
                    <option key={genre} value={genre} className="bg-gray-800">
                      {genre === 'all' ? 'All Genres' : genre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Books Grid */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-md p-6 shadow-2xl border border-gray-700/30">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">
              All Books ({loading ? '...' : filteredBooks.length})
            </h2>
            <button
              onClick={handleRefreshBooks}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-md font-medium hover:from-blue-700 hover:to-blue-600 transition-all duration-200 shadow-lg disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="mb-4">
                  <LoaderOne />
                </div>
                <p className="text-gray-300">Loading books...</p>
              </div>
            </div>
          ) : filteredBooks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBooks.map((book) => (
                <div key={book.id} className="bg-gray-700/30 rounded-md p-4 border border-gray-600/30 hover:bg-gray-600/30 transition-all duration-200">
                  <div className="flex gap-4">
                    <img
                      src={book.cover_file_url || book.coverUrl || book.cover_url || book.image_url || 'https://via.placeholder.com/64x80/11b53f/ffffff?text=📖'}
                      alt={book.title}
                      className="w-16 h-20 rounded-md object-cover shadow-lg"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/64x80/11b53f/ffffff?text=📖';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white truncate mb-1">{book.title}</h3>
                      <p className="text-sm text-gray-300 mb-1">by {book.author}</p>
                      <p className="text-xs text-gray-400 mb-2">{book.genre}</p>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-600/20 text-green-400">
                          Published
                        </span>
                        <span className="text-xs text-gray-400">{book.downloads || 0} downloads</span>
                      </div>
                      <div className="flex gap-1">
                        <Link
                          to={`/book/${book.id}`}
                          className="p-2 text-gray-400 hover:text-green-400 transition-colors rounded-md hover:bg-gray-600/30"
                          title="View Book"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleEditBook(book)}
                          className="p-2 text-gray-400 hover:text-blue-400 transition-colors rounded-md hover:bg-gray-600/30"
                          title="Edit Book"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBook(book.id)}
                          className="p-2 text-gray-400 hover:text-red-400 transition-colors rounded-md hover:bg-gray-600/30"
                          title="Delete Book"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                {searchTerm || filterGenre !== 'all' ? 'No books found' : 'No books in database'}
              </h3>
              <p className="text-gray-400 mb-6">
                {searchTerm || filterGenre !== 'all'
                  ? 'Try adjusting your search terms or filters'
                  : 'Start by adding your first book to the collection'
                }
              </p>
              {(!searchTerm && filterGenre === 'all') && (
                <Link
                  to="/admin/upload"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl font-medium hover:from-green-700 hover:to-green-600 transition-all duration-200 shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  Add Your First Book
                </Link>
              )}
            </div>
          )}
        </div>
        </div>
      </main>

      {/* Edit Modal */}
      <BookEditModal
        book={editingBook}
        isOpen={!!editingBook}
        onClose={() => setEditingBook(null)}
        onSave={handleSaveBook}
      />
    </div>
  );
};

export default BooksManagement;

