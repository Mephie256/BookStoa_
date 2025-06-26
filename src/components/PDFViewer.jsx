import { useState, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, Download, ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';
import { convertToDownloadUrl } from '../config/cloudinary';

const PDFViewer = ({ book, isOpen, onClose }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const pdfUrl = book?.pdf_file_url || book?.pdfFileUrl || book?.pdf_url;

  useEffect(() => {
    if (isOpen && pdfUrl) {
      setIsLoading(true);
      setError(null);

      // Set a timeout to stop loading after 10 seconds
      const loadingTimeout = setTimeout(() => {
        setIsLoading(false);
        // Don't set error here, let the iframe handle it
      }, 10000);

      return () => clearTimeout(loadingTimeout);
    }
  }, [isOpen, pdfUrl]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleDownload = () => {
    if (pdfUrl) {
      // Use utility function to create proper download URL
      const downloadUrl = convertToDownloadUrl(pdfUrl);
      console.log('📥 PDF Viewer Download URL:', downloadUrl);

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${book.title}.pdf`;
      link.target = '_blank'; // Fallback for browsers that don't support download attribute
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  if (!isOpen) return null;

  if (!pdfUrl) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-gray-800/90 backdrop-blur-xl rounded-2xl p-8 max-w-md w-full text-center border border-gray-700/50">
          <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">PDF Not Available</h3>
          <p className="text-gray-300 mb-6">
            This book doesn't have a PDF file available for reading.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl font-medium hover:from-green-700 hover:to-green-600 transition-all duration-200"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex flex-col ${isFullscreen ? 'p-0' : 'p-4'}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-900/90 backdrop-blur-xl border-b border-gray-700/50">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-700/50"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-white truncate max-w-md">{book.title}</h2>
            <p className="text-sm text-gray-400">by {book.author}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Page Navigation */}
          <div className="flex items-center gap-2 px-3 py-1 bg-gray-700/50 rounded-lg">
            <button
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              className="p-1 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-white px-2">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
              className="p-1 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 px-2 py-1 bg-gray-700/50 rounded-lg">
            <button
              onClick={handleZoomOut}
              className="p-1 text-gray-400 hover:text-white transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-sm text-white px-2 min-w-[3rem] text-center">
              {zoom}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1 text-gray-400 hover:text-white transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Action Buttons */}
          <button
            onClick={handleFullscreen}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-700/50"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={handleDownload}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-700/50"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* PDF Content */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        {isLoading ? (
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-lg font-medium">Loading PDF...</p>
            <p className="text-gray-400 text-sm">Please wait while we prepare your book</p>
          </div>
        ) : error ? (
          <div className="text-center p-8">
            <div className="w-16 h-16 bg-yellow-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Download className="w-8 h-8 text-yellow-400" />
            </div>
            <p className="text-white text-lg font-medium mb-2">PDF Viewer Issue</p>
            <p className="text-gray-400 text-sm mb-6">{error}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
              <button
                onClick={() => window.open(pdfUrl, '_blank')}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <X className="w-4 h-4" />
                Open in New Tab
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full h-full relative">
            <iframe
              src={pdfUrl}
              className="w-full h-full rounded-lg border border-gray-700/50 bg-white"
              title={`${book.title} - PDF Viewer`}
              onLoad={() => {
                setIsLoading(false);
                setError(null);
              }}
              onError={() => {
                setError('Unable to load PDF in viewer. Please download or open in new tab.');
                setIsLoading(false);
              }}
            />

            {/* Fallback overlay if iframe fails */}
            <div className="absolute inset-0 bg-gray-800/90 backdrop-blur-sm rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
              <div className="text-center p-6">
                <p className="text-white text-sm mb-4">Having trouble viewing the PDF?</p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <button
                    onClick={() => window.open(pdfUrl, '_blank')}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <X className="w-4 h-4" />
                    New Tab
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-900/90 backdrop-blur-xl border-t border-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Reading: <span className="text-white font-medium">{book.title}</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>Zoom: {zoom}%</span>
            <span>Page {currentPage} of {totalPages}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
