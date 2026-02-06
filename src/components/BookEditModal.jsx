import { useState, useEffect } from 'react';
import { X, Save, Upload, FileText, Image } from 'lucide-react';
import { booksApi } from '../services/newApi';
import { uploadBookCover, uploadBookPDF } from '../config/cloudinary';
import LoaderOne from './ui/loader-one';

const BookEditModal = ({ book, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    fullDescription: '',
    genre: '',
    category: '',
    tags: '',
    publisher: '',
    publishedDate: '',
    isbn: '',
    language: '',
    pages: '',
    rating: '',
    totalRatings: '',
    audioLink: '',
    previewLink: '',
    isFree: true,
    price: '',
    featured: false,
    bestseller: false,
    newRelease: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [files, setFiles] = useState({
    coverImage: null,
    pdfFile: null
  });
  const [previews, setPreviews] = useState({
    coverImage: null
  });

  useEffect(() => {
    if (book && isOpen) {
      const isFree = typeof book.is_free === 'boolean' ? book.is_free : (typeof book.isFree === 'boolean' ? book.isFree : true);
      setFormData({
        title: book.title || '',
        author: book.author || '',
        description: book.description || '',
        fullDescription: book.full_description || book.fullDescription || '',
        genre: book.genre || '',
        category: book.category || '',
        tags: Array.isArray(book.tags) ? book.tags.join(', ') : (book.tags || ''),
        publisher: book.publisher || '',
        publishedDate: book.published_date || book.publishedDate || '',
        isbn: book.isbn || '',
        language: book.language || '',
        pages: book.pages || '',
        rating: book.rating || '',
        totalRatings: book.total_ratings || book.totalRatings || '',
        audioLink: book.audio_link || book.audioLink || '',
        previewLink: book.preview_link || book.previewLink || '',
        isFree,
        price: String(book.price ?? ''),
        featured: book.featured || false,
        bestseller: book.bestseller || false,
        newRelease: book.new_release || book.newRelease || false
      });

      // Set current cover image preview
      setPreviews({
        coverImage: book.cover_file_url || book.coverUrl || book.cover_url || null
      });

      // Reset file inputs
      setFiles({
        coverImage: null,
        pdfFile: null
      });

      setError('');
    }
  }, [book, isOpen]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (file) {
      setFiles(prev => ({
        ...prev,
        [fileType]: file
      }));

      // Create preview for cover image
      if (fileType === 'coverImage' && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviews(prev => ({
            ...prev,
            coverImage: e.target.result
          }));
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const removeFile = (fileType) => {
    setFiles(prev => ({
      ...prev,
      [fileType]: null
    }));

    if (fileType === 'coverImage') {
      // Reset to original cover if removing new upload
      setPreviews(prev => ({
        ...prev,
        coverImage: book?.cover_file_url || book?.coverUrl || book?.cover_url || null
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('📝 Starting book update...');
      console.log('📝 Book ID:', book.id);
      console.log('📝 Form data:', formData);
      console.log('📝 Files to upload:', files);

      let coverFileUrl = book.cover_file_url || book.coverUrl || book.cover_url || '';
      let coverFileId = book.cover_file_id || book.coverFileId || '';
      let pdfFileUrl = book.pdf_file_url || book.pdfFileUrl || '';
      let pdfFileId = book.pdf_file_id || book.pdfFileId || '';

      // Upload new cover image if provided
      if (files.coverImage) {
        console.log('📤 Uploading new cover image...');
        const coverResult = await uploadBookCover(files.coverImage);
        if (coverResult.success) {
          coverFileUrl = coverResult.url;
          coverFileId = coverResult.publicId;
          console.log('✅ New cover uploaded:', coverFileUrl);
        } else {
          console.error('❌ Cover upload failed:', coverResult.error);
          throw new Error(`Cover upload failed: ${coverResult.error}`);
        }
      }

      // Upload new PDF file if provided
      if (files.pdfFile) {
        console.log('📤 Uploading new PDF file...');
        const pdfResult = await uploadBookPDF(files.pdfFile);
        if (pdfResult.success) {
          pdfFileUrl = pdfResult.url;
          pdfFileId = pdfResult.publicId;
          console.log('✅ New PDF uploaded:', pdfFileUrl);
        } else {
          console.error('❌ PDF upload failed:', pdfResult.error);
          throw new Error(`PDF upload failed: ${pdfResult.error}`);
        }
      }

      const updateData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag).join(','),
        pages: parseInt(formData.pages) || 0,
        rating: parseFloat(formData.rating) || 0,
        totalRatings: parseInt(formData.totalRatings) || 0,
        cover_file_url: coverFileUrl,
        cover_file_id: coverFileId,
        pdf_file_url: pdfFileUrl,
        pdf_file_id: pdfFileId,
        is_free: formData.isFree,
        price: formData.isFree ? 0 : (parseInt(formData.price) || 0),
      };

      console.log('📝 Processed update data:', updateData);
      console.log('📝 Calling booksApi.update...');

      const result = await booksApi.update(book.id, updateData);

      console.log('📝 API response:', result);

      if (result && result.success) {
        console.log('✅ Book updated successfully:', result.book);
        onSave(result.book || { ...book, ...updateData });
        onClose();
      } else {
        const errorMsg = result?.error || result?.message || 'Failed to update book - no success response';
        console.error('❌ Update failed:', errorMsg);
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('❌ Error updating book:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        bookId: book.id
      });
      setError(`Failed to update book: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800/90 backdrop-blur-xl rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-700/50 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <h2 className="text-2xl font-bold text-white">Edit Book</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-600/20 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Author *</label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Short Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
            />
          </div>

          {/* Full Description */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Full Description</label>
            <textarea
              name="fullDescription"
              value={formData.fullDescription}
              onChange={handleInputChange}
              rows={5}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
            />
          </div>

          {/* Categories */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Genre</label>
              <input
                type="text"
                name="genre"
                value={formData.genre}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Category</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Tags (comma separated)</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="faith, prayer, devotional"
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
              />
            </div>
          </div>

          {/* Publication Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Publisher</label>
              <input
                type="text"
                name="publisher"
                value={formData.publisher}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Published Date</label>
              <input
                type="date"
                name="publishedDate"
                value={formData.publishedDate}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">ISBN</label>
              <input
                type="text"
                name="isbn"
                value={formData.isbn}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
              />
            </div>
          </div>

          {/* Book Details */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Language</label>
              <input
                type="text"
                name="language"
                value={formData.language}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Pages</label>
              <input
                type="number"
                name="pages"
                value={formData.pages}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Rating</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                name="rating"
                value={formData.rating}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Total Ratings</label>
              <input
                type="number"
                name="totalRatings"
                value={formData.totalRatings}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
              />
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Audio Link</label>
              <input
                type="url"
                name="audioLink"
                value={formData.audioLink}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Preview Link</label>
              <input
                type="url"
                name="previewLink"
                value={formData.previewLink}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
              />
            </div>
          </div>

          {/* Payment */}
          <div className="bg-gray-700/20 border border-gray-600/50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Payment</h3>

            <div className="space-y-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isFree"
                  checked={formData.isFree}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
                />
                <span className="text-white">This book is free</span>
              </label>

              {!formData.isFree && (
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Price (UGX)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                    step="1"
                    placeholder="20"
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Flags */}
          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleInputChange}
                className="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
              />
              <span className="text-white">Featured</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="bestseller"
                checked={formData.bestseller}
                onChange={handleInputChange}
                className="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
              />
              <span className="text-white">Bestseller</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="newRelease"
                checked={formData.newRelease}
                onChange={handleInputChange}
                className="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
              />
              <span className="text-white">New Release</span>
            </label>
          </div>

          {/* File Uploads */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white border-b border-gray-700/50 pb-2">Update Files</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cover Image Upload */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Cover Image
                </label>

                {/* Current Cover Preview */}
                {previews.coverImage && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-400 mb-2">Current Cover:</p>
                    <img
                      src={previews.coverImage}
                      alt="Current cover"
                      className="w-24 h-32 object-cover rounded-xl shadow-lg border border-gray-600/50"
                    />
                  </div>
                )}

                <div className="border-2 border-dashed border-gray-600/50 rounded-xl p-6 text-center bg-gray-700/20 backdrop-blur-sm">
                  {files.coverImage ? (
                    <div className="relative">
                      <img
                        src={URL.createObjectURL(files.coverImage)}
                        alt="New cover preview"
                        className="w-24 h-32 object-cover rounded-xl mx-auto mb-2 shadow-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeFile('coverImage')}
                        className="absolute top-0 right-1/2 transform translate-x-1/2 -translate-y-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors shadow-lg"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <p className="text-xs text-gray-400">{files.coverImage.name}</p>
                      <p className="text-xs text-green-400 mt-1">New cover selected</p>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-300 mb-2">Upload new cover image</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'coverImage')}
                        className="hidden"
                        id="editCoverImage"
                      />
                      <label
                        htmlFor="editCoverImage"
                        className="inline-block px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl text-sm font-medium cursor-pointer hover:from-green-700 hover:to-green-600 transition-all duration-200 shadow-lg"
                      >
                        Choose New Image
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* PDF Upload */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  PDF File
                </label>

                {/* Current PDF Info */}
                {(book?.pdf_file_url || book?.pdfFileUrl) && (
                  <div className="mb-4 p-3 bg-gray-700/30 rounded-xl border border-gray-600/50">
                    <p className="text-xs text-gray-400 mb-1">Current PDF:</p>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-white">PDF file available</span>
                    </div>
                  </div>
                )}

                <div className="border-2 border-dashed border-gray-600/50 rounded-xl p-6 text-center bg-gray-700/20 backdrop-blur-sm">
                  {files.pdfFile ? (
                    <div className="flex items-center justify-between bg-gray-600/30 rounded-xl p-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-red-400" />
                        <span className="text-sm text-white truncate">{files.pdfFile.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile('pdfFile')}
                        className="text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-300 mb-2">Upload new PDF file</p>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handleFileChange(e, 'pdfFile')}
                        className="hidden"
                        id="editPdfFile"
                      />
                      <label
                        htmlFor="editPdfFile"
                        className="inline-block px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl text-sm font-medium cursor-pointer hover:from-blue-700 hover:to-blue-600 transition-all duration-200 shadow-lg"
                      >
                        Choose New PDF
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-700/50">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-700 text-white rounded-xl font-medium hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl font-medium hover:from-green-700 hover:to-green-600 transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="scale-75">
                    <LoaderOne />
                  </div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookEditModal;
