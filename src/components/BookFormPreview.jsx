import React from 'react';

const BookFormPreview = ({ formData, files, previews }) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-gray-700/50">
      <h3 className="text-xl font-semibold text-white mb-4 border-b border-gray-700/50 pb-2">
        Book Preview
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cover Image */}
        <div className="lg:col-span-1">
          {previews.coverImage ? (
            <img
              src={previews.coverImage}
              alt="Book cover preview"
              className="w-full max-w-xs mx-auto rounded-xl shadow-lg"
            />
          ) : (
            <div className="w-full max-w-xs mx-auto h-80 bg-gray-700/30 rounded-xl flex items-center justify-center">
              <span className="text-gray-400">No cover image</span>
            </div>
          )}
        </div>

        {/* Book Details */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <h4 className="text-2xl font-bold text-white">
              {formData.title || 'Book Title'}
            </h4>
            <p className="text-lg text-gray-300">
              by {formData.author || 'Author Name'}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {formData.genre && (
              <div className="bg-gray-700/30 rounded-xl p-3">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Genre</p>
                <p className="text-sm font-medium text-white">{formData.genre}</p>
              </div>
            )}

            {formData.language && (
              <div className="bg-gray-700/30 rounded-xl p-3">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Language</p>
                <p className="text-sm font-medium text-white">{formData.language}</p>
              </div>
            )}

            {formData.pages && (
              <div className="bg-gray-700/30 rounded-xl p-3">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Pages</p>
                <p className="text-sm font-medium text-white">{formData.pages}</p>
              </div>
            )}

            {formData.publisher && (
              <div className="bg-gray-700/30 rounded-xl p-3">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Publisher</p>
                <p className="text-sm font-medium text-white">{formData.publisher}</p>
              </div>
            )}

            {formData.rating && (
              <div className="bg-gray-700/30 rounded-xl p-3">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Rating</p>
                <p className="text-sm font-medium text-white">⭐ {formData.rating}</p>
              </div>
            )}
          </div>

          {formData.description && (
            <div>
              <h5 className="text-lg font-semibold text-white mb-2">Description</h5>
              <p className="text-gray-300 leading-relaxed">{formData.description}</p>
            </div>
          )}

          {formData.tags.length > 0 && (
            <div>
              <h5 className="text-lg font-semibold text-white mb-2">Tags</h5>
              <div className="flex flex-wrap gap-1 md:gap-2">
                {formData.tags.slice(0, 8).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-green-600/20 text-green-400 rounded-md text-xs md:text-sm border border-green-500/30"
                  >
                    {tag}
                  </span>
                ))}
                {formData.tags.length > 8 && (
                  <span className="px-2 py-1 bg-gray-600/20 text-gray-400 rounded-md text-xs md:text-sm">
                    +{formData.tags.length - 8} more
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-4 text-sm text-gray-400">
            {formData.featured && (
              <span className="px-2 py-1 bg-yellow-600/20 text-yellow-400 rounded">Featured</span>
            )}
            {formData.bestseller && (
              <span className="px-2 py-1 bg-red-600/20 text-red-400 rounded">Bestseller</span>
            )}
            {formData.newRelease && (
              <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded">New Release</span>
            )}
          </div>

          <div className="flex gap-4 text-sm text-gray-400">
            {files.pdfFile && (
              <span className="text-green-400">✓ PDF uploaded</span>
            )}
            {formData.audioLink && (
              <span className="text-green-400">✓ Audio available</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookFormPreview;
