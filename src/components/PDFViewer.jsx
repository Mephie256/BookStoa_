import { useState, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Maximize2, Minimize2, Download } from 'lucide-react';

const PDFViewer = ({ book, isOpen, onClose }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfSrc, setPdfSrc] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  const pdfUrl = book?.pdf_file_url || book?.pdfFileUrl || book?.pdf_url;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    let objectUrl = null;
    let cancelled = false;

    const loadPdf = async () => {
      if (!isOpen || !pdfUrl) return;

      setIsLoading(true);
      setError(null);
      setPdfSrc(null);

      try {
        const cacheKey = new Request(pdfUrl, { cache: 'reload' });
        let response = null;

        if (typeof caches !== 'undefined') {
          const cache = await caches.open('bookstoa-pdf-cache-v1');
          response = await cache.match(cacheKey);
          if (!response) {
            response = await fetch(pdfUrl, { mode: 'cors', credentials: 'omit' });
            if (!response.ok) {
              throw new Error(`Failed to load PDF (${response.status})`);
            }
            await cache.put(cacheKey, response.clone());
          }
        } else {
          response = await fetch(pdfUrl, { mode: 'cors', credentials: 'omit' });
          if (!response.ok) {
            throw new Error(`Failed to load PDF (${response.status})`);
          }
        }

        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        if (cancelled) return;

        setPdfSrc(objectUrl);
        setIsLoading(false);
      } catch (e) {
        if (cancelled) return;
        setError(e?.message || 'Unable to load PDF.');
        setIsLoading(false);
      }
    };

    loadPdf();

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
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

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  if (!isOpen) return null;

  if (!pdfUrl) {
    return (
      <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-6">
        <div className="bg-gray-800/90 backdrop-blur-xl rounded-xl p-6 md:p-8 max-w-md w-full text-center shadow-xl border border-gray-700/50">
          <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">PDF Not Available</h3>
          <p className="text-gray-300 text-sm mb-6">
            This book doesn't have a PDF file available for reading.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg font-medium hover:from-green-700 hover:to-green-600 transition-all duration-200 shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex flex-col ${isFullscreen ? '' : 'md:p-4'}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3 md:px-6 md:py-4 bg-gray-900/90 backdrop-blur-xl border-b border-gray-700/50 shadow-lg">
        <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors rounded-lg flex-shrink-0"
            aria-label="Close PDF viewer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm md:text-lg font-semibold text-white truncate">{book.title}</h2>
            <p className="text-xs md:text-sm text-gray-400 truncate hidden sm:block">by {book.author}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
          {/* Zoom Controls - Hidden on mobile */}
          {!isMobile && (
            <div className="flex items-center gap-1 px-2 py-1 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700/50">
              <button
                onClick={handleZoomOut}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700/50 transition-colors rounded"
                aria-label="Zoom out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-medium text-white px-2 min-w-[3rem] text-center">
                {zoom}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700/50 transition-colors rounded"
                aria-label="Zoom in"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Fullscreen Toggle - Hidden on mobile */}
          {!isMobile && (
            <button
              onClick={handleFullscreen}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors rounded-lg"
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* PDF Content */}
      <div className="flex-1 flex items-center justify-center p-2 md:p-4 overflow-hidden bg-gray-950">
        {isLoading ? (
          <div className="text-center p-4">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-base md:text-lg font-semibold mb-1">Loading PDF...</p>
            <p className="text-gray-400 text-xs md:text-sm">Please wait while we prepare your book</p>
          </div>
        ) : error ? (
          <div className="text-center p-4 md:p-8 max-w-md">
            <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-400" />
            </div>
            <p className="text-white text-base md:text-lg font-semibold mb-2">PDF Viewer Issue</p>
            <p className="text-gray-400 text-xs md:text-sm mb-6">{error}</p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg font-medium hover:from-green-700 hover:to-green-600 transition-all duration-200 shadow-sm"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="w-full h-full relative max-w-7xl mx-auto">
            <iframe
              src={`${pdfSrc || pdfUrl}#toolbar=${isMobile ? '0' : '1'}&navpanes=0&scrollbar=1&view=FitH`}
              className="w-full h-full rounded-none md:rounded-lg border-0 md:border md:border-gray-700/50 bg-white shadow-2xl"
              title={`${book.title} - PDF Viewer`}
              onLoad={() => {
                setIsLoading(false);
                setError(null);
              }}
              onError={() => {
                setError('Unable to load PDF in viewer. Please try again.');
                setIsLoading(false);
              }}
            />
          </div>
        )}
      </div>

      {/* Footer - Responsive */}
      <div className="px-3 py-2 md:px-6 md:py-3 bg-gray-900/90 backdrop-blur-xl border-t border-gray-700/50 shadow-lg">
        <div className="flex items-center justify-between gap-2 max-w-7xl mx-auto">
          <div className="text-xs md:text-sm text-gray-400 truncate flex-1 min-w-0">
            <span className="hidden sm:inline">Reading: </span>
            <span className="text-white font-medium truncate">{book.title}</span>
          </div>
          <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-400 flex-shrink-0">
            {!isMobile && <span className="hidden md:inline">Zoom: {zoom}%</span>}
            {/* Mobile zoom controls */}
            {isMobile && (
              <div className="flex items-center gap-1 px-2 py-1 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700/50">
                <button
                  onClick={handleZoomOut}
                  className="p-1 text-gray-400 hover:text-white"
                  aria-label="Zoom out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-medium text-white px-1.5">
                  {zoom}%
                </span>
                <button
                  onClick={handleZoomIn}
                  className="p-1 text-gray-400 hover:text-white"
                  aria-label="Zoom in"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
