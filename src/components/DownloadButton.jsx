import { useState } from 'react';
import { Download, Eye, FileText, AlertCircle, Lock } from 'lucide-react';
import { downloadService } from '../services/downloadService';
import { useAuth } from '../contexts/SimpleAuthContext';
import { useModal } from '../contexts/ModalContext';
import AuthModal from './AuthModal';

const DownloadButton = ({ book, variant = 'default', showPreview = true }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const { user } = useAuth();
  const { showError, showSuccess } = useModal();
  const isDownloadable = downloadService.isDownloadable(book);
  const isAuthenticated = !!user;



  const handleDownload = async () => {
    if (!isAuthenticated) {
      alert('Please sign in to download books');
      return;
    }

    if (!isDownloadable || isDownloading) return;

    setIsDownloading(true);
    try {
      console.log('🔽 DOWNLOAD DEBUG - Book data:', {
        title: book.title,
        pdf_file_url: book.pdf_file_url,
        pdf_file_id: book.pdf_file_id,
        allFields: Object.keys(book)
      });

      // Pass user ID to download service
      const userId = user?.id || user?.email || user?.uid;
      const result = await downloadService.downloadBook(book, userId);
      console.log('📥 Download result:', result);

      if (result && result.success) {
        console.log('✅ Download successful:', result.message);
        showSuccess('Download started successfully!', 'Download Complete');
      } else if (result && !result.success) {
        console.error('❌ Download failed:', result.error);
        showError(`Download failed: ${result.error}`, 'Download Failed');
      } else {
        console.error('❌ Invalid download result:', result);
        showError('Download failed. Please try again.', 'Download Failed');
      }
    } catch (error) {
      console.error('❌ Download exception:', error);
      showError(`Download failed: ${error.message}`, 'Download Failed');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePreview = async () => {
    if (!isDownloadable || isPreviewing) return;

    setIsPreviewing(true);
    try {
      const result = await downloadService.previewBook(book);

      if (!result.success) {
        alert(`Preview failed: ${result.error}`);
      }
    } catch (error) {
      alert(`Preview failed: ${error.message}`);
    } finally {
      setIsPreviewing(false);
    }
  };

  // Compact variant (for cards) - Hide when not authenticated
  if (variant === 'compact') {
    if (!isAuthenticated) {
      return null; // Don't show download button on cards when not authenticated
    }

    return (
      <div className="w-full">
        {isDownloadable ? (
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 shadow-lg bg-gradient-to-r from-green-600 to-green-500 text-white hover:from-green-700 hover:to-green-600 disabled:opacity-50"
            title="Download PDF"
          >
            <Download className={`w-4 h-4 ${isDownloading ? 'animate-bounce' : ''}`} />
            {isDownloading ? 'Downloading...' : 'Download'}
          </button>
        ) : (
          <div className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-700/80 text-gray-400 text-sm font-medium rounded-lg cursor-not-allowed" title="PDF not available">
            <AlertCircle className="w-4 h-4" />
            No PDF
          </div>
        )}
      </div>
    );
  }

  // Full variant (for detail pages)
  if (variant === 'full') {
    return (
      <>
        <div className="space-y-3">
          {!isAuthenticated ? (
            <button
              onClick={() => setShowAuthModal(true)}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-600 transition-all duration-200 shadow-lg"
            >
              <Lock className="w-5 h-5" />
              Sign In to Download
            </button>
          ) : isDownloadable ? (
          <>
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-600 transition-all duration-200 shadow-lg disabled:opacity-50"
            >
              <Download className={`w-5 h-5 ${isDownloading ? 'animate-bounce' : ''}`} />
              {isDownloading ? 'Downloading...' : 'Download PDF'}
            </button>

            {showPreview && (
              <button
                onClick={handlePreview}
                disabled={isPreviewing}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-600 transition-all duration-200 shadow-lg disabled:opacity-50"
              >
                <Eye className={`w-5 h-5 ${isPreviewing ? 'animate-pulse' : ''}`} />
                {isPreviewing ? 'Opening Preview...' : 'Preview PDF'}
              </button>
            )}

            <div className="text-center text-sm text-gray-400">
              <div className="flex items-center justify-center gap-2">
                <FileText className="w-4 h-4" />
                <span>PDF Format</span>
                {book.downloads && (
                  <>
                    <span>•</span>
                    <span>{book.downloads} downloads</span>
                  </>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gray-700 text-gray-400 font-semibold rounded-xl cursor-not-allowed">
            <AlertCircle className="w-5 h-5" />
            PDF Not Available
          </div>
        )}
        </div>

        {/* Auth Modal */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          defaultMode="login"
        />
      </>
    );
  }

  // Default variant
  return (
    <>
      <div className="flex items-center gap-3">
      {isDownloadable && isAuthenticated ? (
        <>
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <Download className={`w-4 h-4 ${isDownloading ? 'animate-bounce' : ''}`} />
            {isDownloading ? 'Downloading...' : 'Download'}
          </button>

          {showPreview && (
            <button
              onClick={handlePreview}
              disabled={isPreviewing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Eye className={`w-4 h-4 ${isPreviewing ? 'animate-pulse' : ''}`} />
              Preview
            </button>
          )}
        </>
      ) : isDownloadable && !isAuthenticated ? (
        <button
          onClick={() => setShowAuthModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          title="Sign in to download"
        >
          <Lock className="w-4 h-4" />
          Sign In to Download
        </button>
      ) : !isDownloadable ? (
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-gray-300 rounded-lg cursor-not-allowed">
          <AlertCircle className="w-4 h-4" />
          No PDF Available
        </div>
      ) : null}
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultMode="login"
      />
    </>
  );
};

export default DownloadButton;
