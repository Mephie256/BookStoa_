// Cloudinary configuration and utilities

// Get Cloudinary config from environment
export const cloudinaryConfig = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY,
  apiSecret: import.meta.env.CLOUDINARY_API_SECRET, // Server-side only
};

// Generate Cloudinary URL for optimized images
export const getOptimizedImageUrl = (publicId, options = {}) => {
  if (!publicId || !cloudinaryConfig.cloudName) return null;
  
  const {
    width = 'auto',
    height = 'auto',
    crop = 'fill',
    quality = 'auto',
    format = 'auto',
    gravity = 'center'
  } = options;
  
  const transformations = [
    `w_${width}`,
    `h_${height}`,
    `c_${crop}`,
    `q_${quality}`,
    `f_${format}`,
    `g_${gravity}`
  ].join(',');
  
  return `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/image/upload/${transformations}/${publicId}`;
};

// Generate Cloudinary URL for raw files (PDFs, etc.)
export const getRawFileUrl = (publicId, options = {}) => {
  if (!publicId || !cloudinaryConfig.cloudName) return null;
  
  const { format = 'pdf' } = options;
  
  return `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/raw/upload/${publicId}.${format}`;
};

// Upload file to Cloudinary (client-side using unsigned upload)
export const uploadToCloudinary = async (file, options = {}) => {
  const {
    folder = 'pneuma-bookstore',
    resourceType = 'auto', // 'image', 'raw', 'video', 'auto'
    uploadPreset = 'pneuma_unsigned', // You'll need to create this in Cloudinary
  } = options;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', folder);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/${resourceType}/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const result = await response.json();
    return {
      success: true,
      publicId: result.public_id,
      url: result.secure_url,
      format: result.format,
      bytes: result.bytes,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Delete file from Cloudinary
export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    const response = await fetch('/api/cloudinary/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        publicId,
        resourceType,
      }),
    });

    if (!response.ok) {
      throw new Error('Delete failed');
    }

    return { success: true };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Predefined image transformations for the app
export const imageTransforms = {
  bookCover: {
    thumbnail: { width: 150, height: 200, crop: 'fill' },
    medium: { width: 300, height: 400, crop: 'fill' },
    large: { width: 600, height: 800, crop: 'fill' },
  },
  avatar: {
    small: { width: 40, height: 40, crop: 'fill', gravity: 'face' },
    medium: { width: 80, height: 80, crop: 'fill', gravity: 'face' },
    large: { width: 150, height: 150, crop: 'fill', gravity: 'face' },
  },
};

// Helper to get book cover URL with specific size
export const getBookCoverUrl = (publicId, size = 'medium') => {
  if (!publicId) return null;
  const transform = imageTransforms.bookCover[size] || imageTransforms.bookCover.medium;
  return getOptimizedImageUrl(publicId, transform);
};

// Helper to get PDF download URL
export const getPdfDownloadUrl = (publicId) => {
  if (!publicId) return null;
  return getRawFileUrl(publicId, { format: 'pdf' });
};
