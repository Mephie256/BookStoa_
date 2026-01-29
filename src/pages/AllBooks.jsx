import { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';
import BookCard from '../components/BookCard';
import PageSearchBar from '../components/PageSearchBar';
import LoaderOne from '../components/ui/loader-one';
import { Aurora } from '../components/ui/aurora';
import { booksApi } from '../services/newApi';

const AllBooks = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
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

    filtered = [...filtered];

    setFilteredBooks(filtered);
  }, [books, searchTerm]);

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

      <main className="min-h-screen overflow-auto relative z-20 md:ml-60 lg:ml-80 pb-32 md:pb-24">
        <div className="max-w-7xl mx-auto p-4 pt-24 md:p-6 md:pt-6 space-y-6">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <BookOpen className="w-8 h-8 text-green-400" />
              <h1 className="text-4xl font-bold text-white">All Books</h1>
            </div>
            <p className="text-gray-300 text-lg">Explore our complete collection of Christian literature</p>
          </div>

          <div className="w-full">
            <PageSearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              onSearch={(q) => setSearchTerm(q)}
              placeholder="Search books, authors, descriptions..."
              buttonText="Search"
            />
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
            <div className="grid gap-6 grid-cols-1 min-[420px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 justify-items-stretch">
              {filteredBooks.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  variant="default"
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No books found</h3>
              <p className="text-gray-400 mb-6">
                {searchTerm
                  ? 'Try adjusting your search terms'
                  : 'No books available in the collection'
                }
              </p>
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                  }}
                  className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
                >
                  Clear Search
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
