import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Users,
  Download,
  TrendingUp,
  Edit,
  Trash2,
  Eye,
  Database
} from 'lucide-react';
import { FaBook } from 'react-icons/fa';
import { Aurora } from '../../components/ui/aurora';
import { useAuth } from '../../contexts/BetterAuthContext';
import { useModal } from '../../contexts/ModalContext';
import { booksApi } from '../../services/newApi';
import { authService } from '../../services/authService';
import LoaderOne from '../../components/ui/loader-one';
import { seedDatabase } from '../../scripts/seedBooks';

const AdminDashboard = () => {
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalUsers: 0,
    totalDownloads: 0,
    monthlyGrowth: 0
  });
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);

  const { user, isAdmin } = useAuth();
  const { showConfirm, showError, showSuccess } = useModal();

  // Load real data from database
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);

        // Load books from database
        const booksResponse = await booksApi.getAll();
        const booksData = booksResponse?.books || [];
        setBooks(booksData);

        // Load users (if available)
        let usersData = [];
        try {
          usersData = await authService.getAllUsers();
          setUsers(usersData || []);
        } catch (error) {
          console.log('Users data not available:', error);
          setUsers([]);
        }

        // Calculate real stats
        const totalDownloads = booksData.reduce((sum, book) => sum + (book.downloads || 0), 0);

        // Calculate monthly growth based on recent books (simple approximation)
        const currentDate = new Date();
        const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, currentDate.getDate());
        const recentBooks = booksData.filter(book => {
          const bookDate = new Date(book.created_at || book.createdAt);
          return bookDate >= lastMonth;
        });
        const monthlyGrowth = booksData.length > 0 ? Math.round((recentBooks.length / booksData.length) * 100) : 0;

        setStats({
          totalBooks: booksData.length,
          totalUsers: usersData.length || 0,
          totalDownloads: totalDownloads,
          monthlyGrowth: monthlyGrowth
        });

      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin) {
      loadDashboardData();
    }
  }, [isAdmin]);

  // Handle book deletion
  const handleDeleteBook = async (bookId) => {
    const confirmed = await showConfirm(
      'Are you sure you want to delete this book?',
      'Delete Book'
    );

    if (!confirmed) return;

    try {
      await booksApi.delete(bookId);
      setBooks(books.filter(book => book.id !== bookId));

      // Update stats
      const updatedBooks = books.filter(book => book.id !== bookId);
      const totalDownloads = updatedBooks.reduce((sum, book) => sum + (book.downloads || 0), 0);
      setStats(prev => ({
        ...prev,
        totalBooks: updatedBooks.length,
        totalDownloads
      }));

      showSuccess('Book deleted successfully!', 'Success');
    } catch (error) {
      console.error('Error deleting book:', error);
      showError('Failed to delete book. Please try again.', 'Error');
    }
  };

  // Handle database seeding
  const handleSeedDatabase = async () => {
    const confirmed = await showConfirm(
      'This will add 10 sample Christian books to the database. Continue?',
      'Seed Database'
    );

    if (!confirmed) return;

    setIsSeeding(true);
    try {
      const result = await seedDatabase();

      if (result.successCount > 0) {
        showSuccess(
          `Successfully added ${result.successCount} books to the database!`,
          'Database Seeded'
        );

        // Reload dashboard data
        window.location.reload();
      } else {
        showError('No books were added to the database.', 'Seeding Failed');
      }
    } catch (error) {
      console.error('Error seeding database:', error);
      showError('Failed to seed database. Please try again.', 'Error');
    } finally {
      setIsSeeding(false);
    }
  };

  // Redirect if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <LoaderOne />
          </div>
          <p className="text-gray-300">Loading dashboard...</p>
        </div>
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

      <main className="min-h-screen relative z-20 md:ml-60 lg:ml-80 p-4 md:p-8 pb-32 md:pb-24">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-gray-300 mt-1">Manage your bookstore content and users</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSeedDatabase}
              disabled={isSeeding}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-md font-medium hover:from-blue-700 hover:to-blue-600 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Database className="w-4 h-4" />
              {isSeeding ? 'Seeding...' : 'Seed Database'}
            </button>
            <Link
              to="/admin/upload"
              className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-500 text-white px-4 py-2 rounded-md font-medium hover:from-green-700 hover:to-green-600 transition-all duration-200 shadow-lg"
            >
              <Plus className="w-4 h-4" />
              Upload New Book
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-md p-6 shadow-2xl border border-gray-700/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Books</p>
                <p className="text-2xl font-bold text-white">{stats.totalBooks}</p>
              </div>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-green-600/20">
                <FaBook className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-xl rounded-md p-6 shadow-2xl border border-gray-700/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
              </div>
              <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-xl rounded-md p-6 shadow-2xl border border-gray-700/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Downloads</p>
                <p className="text-2xl font-bold text-white">{stats.totalDownloads.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center">
                <Download className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-xl rounded-md p-6 shadow-2xl border border-gray-700/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Monthly Growth</p>
                <p className="text-2xl font-bold text-white">+{stats.monthlyGrowth}%</p>
              </div>
              <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Books Management */}
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-md p-6 shadow-2xl border border-gray-700/30">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">Recent Books</h2>
              <Link
                to="/admin/books"
                className="text-green-400 hover:text-green-300 text-sm font-medium"
              >
                View All
              </Link>
            </div>

            <div className="space-y-4">
              {books.length > 0 ? books.slice(0, 5).map((book) => (
                <div key={book.id} className="flex items-center gap-4 p-4 border border-gray-600/30 rounded-md bg-gray-700/20 backdrop-blur-sm">
                  <img
                    src={book.cover_file_url || book.coverUrl || '/placeholder-book.jpg'}
                    alt={book.title}
                    className="w-12 h-16 rounded-md object-cover"
                    onError={(e) => {
                      e.target.src = '/placeholder-book.jpg';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white truncate">{book.title}</h3>
                    <p className="text-sm text-gray-300">by {book.author}</p>
                    <p className="text-xs text-gray-400">{book.downloads || 0} downloads</p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to={`/book/${book.id}`}
                      className="p-2 text-gray-400 hover:text-green-400 transition-colors"
                      title="View Book"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link
                      to="/admin/books"
                      state={{ editBookId: book.id }}
                      className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                      title="Edit Book"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDeleteBook(book.id)}
                      className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                      title="Delete Book"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8">
                  <p className="text-gray-400">No books found. Upload your first book!</p>
                  <Link
                    to="/admin/upload"
                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Upload Book
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Users Management */}
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-md p-6 shadow-2xl border border-gray-700/30">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">Recent Users</h2>
              <Link
                to="/admin/users"
                className="text-green-400 hover:text-green-300 text-sm font-medium"
              >
                View All
              </Link>
            </div>

            <div className="space-y-4">
              {users.length > 0 ? users.slice(0, 5).map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border border-gray-600/30 rounded-xl bg-gray-700/20 backdrop-blur-sm">
                  <div>
                    <p className="font-medium text-white">{user.email}</p>
                    <p className="text-sm text-gray-300">
                      Joined {new Date(user.created_at || user.createdAt).toLocaleDateString()}
                    </p>
                    {user.role === 'admin' && (
                      <span className="inline-block px-2 py-1 bg-green-600/20 text-green-400 rounded text-xs font-medium mt-1">
                        Admin
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to="/admin/users"
                      className="p-2 text-gray-400 hover:text-green-400 transition-colors"
                      title="View User"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8">
                  <p className="text-gray-400">No users found.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/admin/upload"
              className="bg-gray-800/50 backdrop-blur-xl rounded-md p-6 shadow-2xl border border-gray-700/30 hover:bg-gray-700/50 transition-all duration-200"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center">
                  <Plus className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="font-medium text-white">Upload Book</h3>
                  <p className="text-sm text-gray-300">Add a new book to the library</p>
                </div>
              </div>
            </Link>

            <Link
              to="/admin/books"
              className="bg-gray-800/50 backdrop-blur-xl rounded-md p-6 shadow-2xl border border-gray-700/30 hover:bg-gray-700/50 transition-all duration-200"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center">
                  <FaBook className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="font-medium text-white">Manage Books</h3>
                  <p className="text-sm text-gray-300">Edit or remove existing books</p>
                </div>
              </div>
            </Link>

            <Link
              to="/admin/users"
              className="bg-gray-800/50 backdrop-blur-xl rounded-md p-6 shadow-2xl border border-gray-700/30 hover:bg-gray-700/50 transition-all duration-200"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="font-medium text-white">Manage Users</h3>
                  <p className="text-sm text-gray-300">View and manage user accounts</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;

