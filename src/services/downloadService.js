// Professional download service for books
import { booksApi } from './newApi';
import { getDownloadUrl, convertToDownloadUrl, getDirectAccessUrl } from '../config/cloudinary';
import { userDataService } from './userDataService';

export const downloadService = {
  // Download book PDF
  downloadBook: async (book, userId = null) => {
    try {
      console.log('📥 Starting book download:', book.title);
      console.log('📚 Book data:', book);

      // Get PDF URL and public ID
      let pdfUrl = book.pdf_file_url || book.pdfFileUrl || book.pdf_url || book.pdfUrl;
      const publicId = book.pdf_file_id || book.pdfFileId || book.pdf_public_id;

      console.log('📄 Original PDF URL:', pdfUrl);
      console.log('📄 Public ID:', publicId);

      if (!pdfUrl && !publicId) {
        console.error('❌ No PDF URL or Public ID found');
        console.log('Available fields:', Object.keys(book));
        return {
          success: false,
          error: 'PDF file not available for this book'
        };
      }

      // PROFESSIONAL CLOUDINARY DOWNLOAD URL WITH fl_attachment FLAG
      let downloadUrl;

      if (pdfUrl) {
        // Use utility function to convert to download URL
        downloadUrl = convertToDownloadUrl(pdfUrl);
        console.log('📄 Converted to download URL with fl_attachment:', downloadUrl);
      } else if (publicId) {
        // Generate download URL from public ID using utility function
        downloadUrl = getDownloadUrl(publicId);
        console.log('📄 Generated download URL from public ID:', downloadUrl);
      }

      // Set the final PDF URL for download
      pdfUrl = downloadUrl;

      // Track download in database (increment download count)
      try {
        await booksApi.incrementDownloads(book.id);
        console.log('📊 Download count updated');
      } catch (error) {
        console.warn('⚠️ Failed to update download count:', error);
        // Continue with download even if tracking fails
      }

      // MULTIPLE DOWNLOAD STRATEGIES - PROFESSIONAL APPROACH
      console.log('🔥 Starting download with multiple strategies...');

      // Strategy 1: Try direct download with proper headers
      try {
        console.log('🔥 Strategy 1: Direct download with authentication headers');
        const response = await fetch(pdfUrl, {
          method: 'GET',
          mode: 'cors',
          credentials: 'omit',
          headers: {
            'Accept': 'application/pdf,*/*',
            'Cache-Control': 'no-cache'
          }
        });

        console.log('📄 Response status:', response.status);
        console.log('📄 Response headers:', Object.fromEntries(response.headers.entries()));

        if (response.ok) {
          const blob = await response.blob();
          console.log('📄 Blob created, size:', blob.size, 'type:', blob.type);

          const blobUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = `${book.title} - ${book.author}.pdf`;
          link.style.display = 'none';

          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
          console.log('✅ Strategy 1 successful');

          // Add to downloads tracking with user ID
          userDataService.addToDownloads(book, userId);

          return {
            success: true,
            message: 'Download completed successfully'
          };
        } else if (response.status === 401) {
          console.log('❌ Strategy 1 failed: 401 Unauthorized - File is private');
          throw new Error('PDF file is private. Please check Cloudinary access settings.');
        }
      } catch (error) {
        console.log('❌ Strategy 1 failed:', error.message);
        if (error.message.includes('private') || error.message.includes('401')) {
          throw error; // Don't try other strategies for auth errors
        }
      }

      // Strategy 2: Try CORS mode
      try {
        console.log('🔥 Strategy 2: CORS mode');
        const response = await fetch(pdfUrl, {
          method: 'GET',
          mode: 'cors',
          headers: { 'Accept': 'application/pdf,*/*' },
        });

        if (response.ok) {
          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = `${book.title} - ${book.author}.pdf`;
          link.style.display = 'none';

          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
          console.log('✅ Strategy 2 successful');

          // Add to downloads tracking with user ID
          userDataService.addToDownloads(book, userId);

          return {
            success: true,
            message: 'Download completed successfully'
          };
        }
      } catch (error) {
        console.log('❌ Strategy 2 failed:', error.message);
      }

      // Strategy 3: Direct link download (fallback)
      try {
        console.log('🔥 Strategy 3: Direct link download');
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = `${book.title} - ${book.author}.pdf`;
        link.target = '_blank';
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log('✅ Strategy 3 executed (direct link)');

        // Add to downloads tracking with user ID
        userDataService.addToDownloads(book, userId);

        return {
          success: true,
          message: 'Download initiated successfully'
        };
      } catch (error) {
        console.log('❌ Strategy 3 failed:', error.message);
      }

      // If all strategies fail
      throw new Error('Download failed. Please try again.');

    } catch (error) {
      console.error('❌ Download failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Check if book is downloadable
  isDownloadable: (book) => {
    const pdfUrl = book.pdf_file_url || book.pdfFileUrl || book.pdf_url || book.pdfUrl;
    return !!pdfUrl;
  },

  // Get download URL
  getDownloadUrl: (book) => {
    return book.pdf_file_url || book.pdfFileUrl || book.pdf_url || null;
  },

  // Preview book (open in new tab)
  previewBook: async (book) => {
    try {
      console.log('👁️ Opening book preview:', book.title);

      const pdfUrl = book.pdf_file_url || book.pdfFileUrl || book.pdf_url;

      if (!pdfUrl) {
        throw new Error('PDF file not available for preview');
      }

      // Open in new tab
      window.open(pdfUrl, '_blank', 'noopener,noreferrer');

      return {
        success: true,
        message: 'Preview opened successfully'
      };

    } catch (error) {
      console.error('❌ Preview failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Get file size (if available from Cloudinary)
  getFileSize: (book) => {
    // This would need to be stored when uploading
    return book.pdf_file_size || book.fileSize || null;
  },

  // Format file size for display
  formatFileSize: (bytes) => {
    if (!bytes) return 'Unknown size';

    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }
};

// Add increment downloads method to booksApi if it doesn't exist
if (!booksApi.incrementDownloads) {
  booksApi.incrementDownloads = async (bookId) => {
    try {
      const response = await fetch(`${booksApi.baseUrl}/books/${bookId}/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error incrementing downloads:', error);
      throw error;
    }
  };
}
