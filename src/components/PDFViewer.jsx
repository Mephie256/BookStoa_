import { useState, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, Maximize2, Minimize2, Download } from 'lucide-react';
import Spinner from './ui/Spinner';

const PDFViewer = ({ book, isOpen, onClose }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfSrc, setPdfSrc] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  const pdfUrl = book?.pdf_file_url || book?.pdfFileUrl || book?.pdf_url || book?.pdfUrl;

  const toInlinePdfUrl = (url) => {
    if (!url || typeof url !== 'string') return url;

    if (!url.includes('res.cloudinary.com')) return url;

    let next = url;
    next = next.replace('/upload/fl_attachment/', '/upload/');
    next = next.replace(/\/upload\/fl_attachment:[^/]+\//, '/upload/');

    next = next.replace('/raw/upload/fl_inline/', '/raw/upload/');

    return next;
  };

  const inlinePdfUrl = toInlinePdfUrl(pdfUrl);
  const effectivePdfUrl = inlinePdfUrl || pdfUrl;

  const openExternally = () => {
    if (!effectivePdfUrl) return;
    const a = document.createElement('a');
    a.href = effectivePdfUrl;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.click();
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();

    const ua = typeof navigator !== 'undefined' ? (navigator.userAgent || '') : '';
    const isiOSDevice = /iPad|iPhone|iPod/.test(ua);
    const isiPadOS = ua.includes('Mac') && typeof document !== 'undefined' && 'ontouchend' in document;
    setIsIOS(isiOSDevice || isiPadOS);

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
        if (isMobile || isIOS) {
          setIsLoading(false);
          return;
        }

        const cacheKey = new Request(effectivePdfUrl, { cache: 'reload' });
        let response = null;

        if (typeof caches !== 'undefined') {
          try {
            const cache = await caches.open('bookstoa-pdf-cache-v1');
            response = await cache.match(cacheKey);
            if (!response) {
              response = await fetch(effectivePdfUrl, { mode: 'cors', credentials: 'omit' });
              if (!response.ok) {
                throw new Error(`Failed to load PDF (${response.status})`);
              }
              await cache.put(cacheKey, response.clone());
            }
          } catch {
            response = await fetch(effectivePdfUrl, { mode: 'cors', credentials: 'omit' });
            if (!response.ok) {
              throw new Error(`Failed to load PDF (${response.status})`);
            }
          }
        } else {
          response = await fetch(effectivePdfUrl, { mode: 'cors', credentials: 'omit' });
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
  }, [isOpen, pdfUrl, effectivePdfUrl, isMobile, isIOS]);

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
          <button
            onClick={openExternally}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors rounded-lg"
            aria-label="Open PDF"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* PDF Content */}
      <div
        className="flex-1 flex items-center justify-center p-2 md:p-4 overflow-auto bg-gray-950"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {isLoading && !isMobile ? (
          <div className="text-center p-4">
            <Spinner size="xl" color="green" />
            <p className="text-white text-base md:text-lg font-semibold mb-1">Loading PDF...</p>
            <p className="text-gray-400 text-xs md:text-sm">Please wait while we prepare your book</p>
          </div>
        ) : error && !isMobile ? (
          <div className="text-center p-4 md:p-8 max-w-md">
            <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-400" />
            </div>
            <p className="text-white text-base md:text-lg font-semibold mb-2">PDF Viewer Issue</p>
            <p className="text-gray-400 text-xs md:text-sm mb-6">{error}</p>
            <button
              onClick={openExternally}
              className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg font-medium hover:from-green-700 hover:to-green-600 transition-all duration-200 shadow-sm"
            >
              Open PDF
            </button>
          </div>
        ) : isMobile || isIOS ? (
          <div className="w-full h-full flex flex-col">
            {/* Mobile PDF Notice */}
            <div className="bg-gray-800/90 backdrop-blur-xl p-4 mx-2 mt-2 rounded-lg border border-gray-700/50 shadow-lg">
              <p className="text-white text-sm font-medium mb-2">📱 Mobile Reading</p>
              <p className="text-gray-300 text-xs mb-3">
                For the best reading experience on mobile, we recommend opening the PDF in your browser or a PDF reader app.
              </p>
              <button
                onClick={openExternally}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg font-medium hover:from-green-700 hover:to-green-600 transition-all duration-200 shadow-sm text-sm"
              >
                Open in Browser
              </button>
            </div>
            
            {/* Embedded PDF Viewer */}
            <div className="flex-1 relative mt-2">
              <iframe
                src={effectivePdfUrl}
                className="w-full h-full rounded-none border-0 bg-white"
                title={`${book.title} - PDF Viewer`}
                style={{ minHeight: 'calc(100vh - 200px)' }}
              />
            </div>
          </div>
        ) : (
          <div className="w-full h-full relative max-w-7xl mx-auto">
            <iframe
              src={`${pdfSrc || effectivePdfUrl}#toolbar=1&navpanes=0&scrollbar=1&view=FitH`}
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
