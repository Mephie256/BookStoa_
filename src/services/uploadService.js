// Upload service using Cloudinary
import {
  uploadBookCover,
  uploadBookPDF,
  deleteCloudinaryFile,
  validateImageFile,
  validatePDFFile
} from '../config/cloudinary.js';

export const uploadService = {
  // Upload cover image
  async uploadCover(file) {
    try {
      console.log('📤 Starting cover upload process...');

      // Validate file
      const validation = validateImageFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Upload to Cloudinary
      const result = await uploadBookCover(file);

      if (!result.success) {
        throw new Error(result.error);
      }

      return {
        success: true,
        url: result.url,
        publicId: result.publicId,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes
      };
    } catch (error) {
      console.error('❌ Cover upload failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Upload PDF file
  async uploadPdf(file) {
    try {
      console.log('📤 Starting PDF upload process...');

      // Validate file
      const validation = validatePDFFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Upload to Cloudinary
      const result = await uploadBookPDF(file);

      if (!result.success) {
        throw new Error(result.error);
      }

      return {
        success: true,
        url: result.url,
        publicId: result.publicId,
        format: result.format,
        bytes: result.bytes
      };
    } catch (error) {
      console.error('❌ PDF upload failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Delete file
  async deleteFile(publicId, resourceType = 'image') {
    try {
      console.log('🗑️ Starting file deletion process...');

      const result = await deleteCloudinaryFile(publicId, resourceType);

      if (!result.success) {
        throw new Error(result.error);
      }

      return {
        success: true,
        message: 'File deleted successfully'
      };
    } catch (error) {
      console.error('❌ File deletion failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
};
