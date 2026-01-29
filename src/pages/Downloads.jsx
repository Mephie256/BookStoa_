import { useState, useEffect } from 'react';
import { Download, Calendar, FileText, Trash2, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Aurora } from '../components/ui/aurora';
import { useAuth } from '../contexts/BetterAuthContext';
import { useModal } from '../contexts/ModalContext';
import { userDataService } from '../services/userDataService';
import LoaderOne from '../components/ui/loader-one';
import AuthModal from '../components/AuthModal';

const Downloads = () => {
  const [downloads, setDownloads] = useState([]);
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

  const filteredDownloads = downloads;

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
                  className="block w-full px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-md hover:from-green-700 hover:to-green-600 transition-all duration-200 font-semibold shadow-lg"
                >
                  Sign In / Sign Up
                </button>
                <Link
                  to="/"
                  className="block w-full px-6 py-3 bg-gray-800/50 backdrop-blur-sm text-white rounded-md hover:bg-gray-700/50 transition-all duration-200 border border-gray-600/50"
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

      <main className="min-h-screen overflow-auto relative z-20 md:ml-60 lg:ml-80 pb-32 md:pb-24">
        <div className="px-4 md:px-8 pt-24 md:pt-6 pb-6 space-y-8 relative z-20">

          {/* Stats */}


          {/* Downloads List */}
          {filteredDownloads.length > 0 ? (
            <div className="bg-gray-800/50 backdrop-blur-xl  p-6 shadow-2xl border border-gray-700/30">
              <h2 className="text-xl font-semibold text-white mb-6">
                Download History ({filteredDownloads.length})
              </h2>

              <div className="space-y-4">
                {filteredDownloads.map((download) => (
                  <div key={download.id} className="bg-gray-700/30 backdrop-blur-sm  p-4 border border-gray-600/30 hover:bg-gray-600/30 transition-all duration-200">
                    <div className="flex items-center gap-4">
                      <img
                        src={download.cover_file_url}
                        alt={download.title}
                        className="w-16 h-20 rounded-md object-cover shadow-lg"
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
                          <span className="px-2 py-1 bg-green-600/20 text-green-400 rounded-md text-xs font-medium">
                            {download.genre}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => redownload(download)}
                          className="p-2 text-gray-400 hover:text-green-400 transition-colors rounded-md hover:bg-gray-600/30"
                          title="Re-download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeDownload(download.id)}
                          className="p-2 text-gray-400 hover:text-red-400 transition-colors rounded-md hover:bg-gray-600/30"
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
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-md p-12 shadow-2xl border border-gray-700/30 max-w-md mx-auto">
                <Download className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  {downloads.length === 0 ? 'No Downloads Yet' : 'No Downloads Found'}
                </h3>
                <p className="text-gray-400 mb-6">
                  {downloads.length === 0
                    ? 'Start downloading books to read offline. Your downloads will appear here.'
                    : 'No downloads match your current view.'
                  }
                </p>
                {downloads.length === 0 && (
                  <button
                    onClick={() => window.location.href = '/'}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-md font-medium hover:from-green-700 hover:to-green-600 transition-all duration-200 shadow-lg"
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
