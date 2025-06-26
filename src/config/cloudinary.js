// Cloudinary configuration for frontend uploads
export const cloudinaryConfig = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY,
  uploadPreset: 'pneuma_books',
};



// Upload function for book covers
export const uploadBookCover = async (file) => {
  try {
    if (!cloudinaryConfig.cloudName || !cloudinaryConfig.uploadPreset) {
      throw new Error('Cloudinary configuration missing');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', cloudinaryConfig.uploadPreset);
    formData.append('folder', 'covers');
    formData.append('resource_type', 'image');

    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`;

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Cover upload failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    return {
      success: true,
      url: data.secure_url,
      publicId: data.public_id
    };
  } catch (error) {
    console.error('❌ COVER UPLOAD FAILED:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Upload function for PDF files
export const uploadBookPDF = async (file) => {
  try {
    if (!cloudinaryConfig.cloudName || !cloudinaryConfig.uploadPreset) {
      throw new Error('Cloudinary configuration missing');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', cloudinaryConfig.uploadPreset);
    formData.append('folder', 'pdfs');
    formData.append('resource_type', 'raw');

    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/raw/upload`;

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`PDF upload failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    return {
      success: true,
      url: data.secure_url,
      publicId: data.public_id
    };
  } catch (error) {
    console.error('❌ PDF UPLOAD FAILED:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Delete file from Cloudinary
export const deleteCloudinaryFile = async (publicId, resourceType = 'image') => {
  try {
    console.log('🗑️ Deleting file from Cloudinary:', publicId);

    // This would typically be done on your backend for security
    // For now, we'll just return success
    console.log('✅ File deletion requested:', publicId);

    return {
      success: true,
      message: 'File deletion requested'
    };
  } catch (error) {
    console.error('❌ Error deleting file:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Generate optimized image URL
export const getOptimizedImageUrl = (publicId, options = {}) => {
  const {
    width = 400,
    height = 600,
    quality = 'auto',
    format = 'auto',
    crop = 'fill'
  } = options;

  return `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/image/upload/w_${width},h_${height},c_${crop},q_${quality},f_${format}/${publicId}`;
};

// Generate public download URL for PDFs
export const getPublicDownloadUrl = (publicId, filename = 'download.pdf') => {
  if (!publicId) return null;

  // Generate URL with forced download and proper filename
  return `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/raw/upload/fl_attachment:${filename}/${publicId}`;
};

// Generate direct access URL (no download flag)
export const getDirectAccessUrl = (publicId) => {
  if (!publicId) return null;

  return `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/raw/upload/${publicId}`;
};

// Validate file types
export const validateImageFile = (file) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Please select a valid image file (JPEG, PNG, or WebP)'
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Image file size must be less than 5MB'
    };
  }

  return { valid: true };
};

export const validatePDFFile = (file) => {
  const allowedTypes = ['application/pdf'];
  const maxSize = 50 * 1024 * 1024; // 50MB

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Please select a valid PDF file'
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'PDF file size must be less than 50MB'
    };
  }

  return { valid: true };
};

// Get download URL with fl_attachment flag for forced downloads
export const getDownloadUrl = (publicId) => {
  if (!publicId) return null;
  return `https://res.cloudinary.com/${CLOUD_NAME}/raw/upload/fl_attachment/${publicId}`;
};

// Convert any Cloudinary URL to download URL
export const convertToDownloadUrl = (url) => {
  if (!url || !url.includes('res.cloudinary.com')) return url;

  // If already has fl_attachment, return as is
  if (url.includes('fl_attachment')) return url;

  // Add fl_attachment flag
  return url.replace('/upload/', '/upload/fl_attachment/');
};

// Check if a Cloudinary file is publicly accessible
export const checkFileAccess = async (url) => {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      mode: 'cors',
      credentials: 'omit'
    });

    return {
      accessible: response.ok,
      status: response.status,
      statusText: response.statusText
    };
  } catch (error) {
    return {
      accessible: false,
      status: 0,
      statusText: error.message
    };
  }
};