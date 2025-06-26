import { useState, useEffect } from 'react';
import { Search, Download, Calendar, FileText, Trash2, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Aurora } from '../components/ui/aurora';
import { useAuth } from '../contexts/SimpleAuthContext';
import { useModal } from '../contexts/ModalContext';
import { userDataService } from '../services/userDataService';
import LoaderOne from '../components/ui/loader-one';
import AuthModal from '../components/AuthModal';

const Downloads = () => {
  const [downloads, setDownloads] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [stats, setStats] = useState({
    unique_books: 0,
    total_downloads: 0,
    pdf_downloads: 0,
    audio_downloads: 0
  });

  const { user } = useAuth();
  const { showConfirm, showError, showAlert } = useModal();



  // Load downloads from localStorage
  useEffect(() => {
    const loadDownloads = () => {
      try {
        setLoading(true);

        if (!user) {
          setDownloads([]);
          setStats({
            unique_books: 0,
            total_downloads: 0,
            pdf_downloads: 0,
            audio_downloads: 0
          });
          setLoading(false);
          return;
        }

        const userId = user?.id || user?.email || user?.uid;
        if (userId) {
          // First, try to fix any missing image URLs in existing data
          userDataService.fixImageUrls(userId);

          const downloads = userDataService.getDownloads(userId);
          const stats = userDataService.getStats(userId);

          console.log('📥 Loaded downloads for user:', userId, downloads);
          console.log('📊 User stats:', stats);

          setDownloads(downloads);
          setStats({
            unique_books: stats.totalDownloads,
            total_downloads: stats.totalDownloadCount,
            pdf_downloads: stats.totalDownloadCount,
            audio_downloads: 0
          });
        } else {
          console.warn('No valid user ID found');
          setDownloads([]);
          setStats({
            unique_books: 0,
            total_downloads: 0,
            pdf_downloads: 0,
            audio_downloads: 0
          });
        }
      } catch (error) {
        console.error('Error loading downloads:', error);
        setDownloads([]);
      } finally {
        setLoading(false);
      }
    };

    loadDownloads();

    // Listen for storage changes
    const handleStorageChange = (e) => {
      if (e.key && e.key.startsWith('pneuma_user_data')) {
        loadDownloads();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user]);

  const filteredDownloads = downloads.filter(download =>
    download.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    download.author?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const removeDownload = async (bookId) => {
    const confirmed = await showConfirm(
      'Are you sure you want to remove this download?',
      'Remove Download'
    );

    if (confirmed) {
      const userId = user?.id || user?.email || user?.uid;
      const success = userDataService.removeFromDownloads(bookId, userId);
      if (success) {
        setDownloads(downloads.filter(download => download.id !== bookId));
        console.log('✅ Download removed successfully');
      } else {
        showError('Failed to remove download. Please try again.', 'Error');
      }
    }
  };

  const redownload = (download) => {
    if (download.pdf_file_url) {
      // Open the PDF in a new tab
      window.open(download.pdf_file_url, '_blank');
    } else {
      showAlert(`PDF not available for "${download.title}"`, 'PDF Not Available');
    }
  };

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
              <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Download className="w-10 h-10 text-blue-400" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-4">Sign In Required</h1>
              <p className="text-gray-400 mb-8 leading-relaxed">
                You need to sign in to view your downloads. Create an account or sign in to start downloading books.
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

  // Show loading state
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
        <main className="min-h-screen overflow-auto relative z-20 md:ml-60 lg:ml-80 pb-32 md:pb-24">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="mb-4">
                <LoaderOne />
              </div>
              <p className="text-gray-300">Loading your downloads...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
                <h1 className="text-3xl font-bold text-white mb-1">My Downloads</h1>
                <p className="text-gray-300">Manage your downloaded books</p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 md:px-8 py-6 space-y-8 relative z-20">
          {/* Search */}
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-gray-700/50">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search your downloads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 backdrop-blur-sm transition-all duration-200"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-gray-700/50">
              <div className="flex items-center gap-3">
                <Download className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{stats.total_downloads}</p>
                  <p className="text-gray-400 text-sm">Total Downloads</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-gray-700/50">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-blue-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{stats.unique_books}</p>
                  <p className="text-gray-400 text-sm">Unique Books</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-gray-700/50">
              <div className="flex items-center gap-3">
                <Calendar className="w-8 h-8 text-purple-400" />
                <div>
                  <p className="text-2xl font-bold text-white">
                    {downloads.length > 0
                      ? formatDate(downloads[0].last_downloaded_at).split(',')[0]
                      : 'N/A'
                    }
                  </p>
                  <p className="text-gray-400 text-sm">Latest Download</p>
                </div>
              </div>
            </div>
          </div>

          {/* Downloads List */}
          {filteredDownloads.length > 0 ? (
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-gray-700/50">
              <h2 className="text-xl font-semibold text-white mb-6">
                Download History ({filteredDownloads.length})
              </h2>

              <div className="space-y-4">
                {filteredDownloads.map((download) => (
                  <div key={download.id} className="bg-gray-700/30 backdrop-blur-sm rounded-xl p-4 border border-gray-600/30 hover:bg-gray-600/30 transition-all duration-200">
                    <div className="flex items-center gap-4">
                      <img
                        src={download.cover_file_url}
                        alt={download.title}
                        className="w-16 h-20 rounded-lg object-cover shadow-lg"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/64x80/11b53f/ffffff?text=📖';
                        }}
                      />

                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white truncate mb-1">{download.title}</h3>
                        <p className="text-sm text-gray-300 mb-1">by {download.author}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>Downloaded {formatDate(download.last_downloaded_at)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            <span>{download.download_count} time{download.download_count !== 1 ? 's' : ''}</span>
                          </div>
                          <span className="px-2 py-1 bg-green-600/20 text-green-400 rounded-full">
                            {download.genre}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => redownload(download)}
                          className="p-2 text-gray-400 hover:text-green-400 transition-colors rounded-lg hover:bg-gray-600/30"
                          title="Re-download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeDownload(download.id)}
                          className="p-2 text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-gray-600/30"
                          title="Remove from downloads"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-12 shadow-2xl border border-gray-700/50 max-w-md mx-auto">
                <Download className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  {downloads.length === 0 ? 'No Downloads Yet' : 'No Downloads Found'}
                </h3>
                <p className="text-gray-400 mb-6">
                  {downloads.length === 0
                    ? 'Start downloading books to read offline. Your downloads will appear here.'
                    : 'Try adjusting your search to find your downloaded books.'
                  }
                </p>
                {downloads.length === 0 && (
                  <button
                    onClick={() => window.location.href = '/'}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl font-medium hover:from-green-700 hover:to-green-600 transition-all duration-200 shadow-lg"
                  >
                    Browse Books
                  </button>
                )}
              </div>
            </div>
          )}
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

export default Downloads;
