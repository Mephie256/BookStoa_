// Cloudflare R2 Storage Service
// This service handles file uploads to Cloudflare R2 for production storage

class CloudflareR2Service {
    constructor() {
        this.accountId = import.meta.env.VITE_CLOUDFLARE_R2_ACCOUNT_ID;
        this.accessKeyId = import.meta.env.VITE_CLOUDFLARE_R2_ACCESS_KEY_ID;
        this.secretAccessKey = import.meta.env.VITE_CLOUDFLARE_R2_SECRET_ACCESS_KEY;
        this.bucketName = import.meta.env.VITE_CLOUDFLARE_R2_BUCKET_NAME;
        this.publicUrl = import.meta.env.VITE_CLOUDFLARE_R2_PUBLIC_URL;
        
        // Check if R2 is configured
        this.isConfigured = !!(this.accountId && this.accessKeyId && this.secretAccessKey && this.bucketName);
    }

    // Generate a signed URL for direct upload to R2
    async getUploadUrl(fileName, fileType, folder = '') {
        if (!this.isConfigured) {
            throw new Error('Cloudflare R2 is not configured');
        }

        try {
            // In a real implementation, this would call your backend API
            // to generate a signed URL for direct upload to R2
            const response = await fetch('/api/r2/upload-url', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fileName,
                    fileType,
                    folder
                })
            });

            if (!response.ok) {
                throw new Error('Failed to get upload URL');
            }

            const data = await response.json();
            return data.uploadUrl;
        } catch (error) {
            console.error('Error getting R2 upload URL:', error);
            throw error;
        }
    }

    // Upload file directly to R2 using signed URL
    async uploadFile(file, folder = '') {
        if (!this.isConfigured) {
            throw new Error('Cloudflare R2 is not configured');
        }

        try {
            const fileName = `${folder}/${Date.now()}-${file.name}`;
            const uploadUrl = await this.getUploadUrl(fileName, file.type, folder);

            // Upload file to R2 using the signed URL
            const uploadResponse = await fetch(uploadUrl, {
                method: 'PUT',
                body: file,
                headers: {
                    'Content-Type': file.type,
                }
            });

            if (!uploadResponse.ok) {
                throw new Error('Failed to upload file to R2');
            }

            // Return the public URL for the uploaded file
            const fileUrl = `${this.publicUrl}/${fileName}`;
            
            return {
                fileId: fileName,
                fileUrl: fileUrl,
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type
            };
        } catch (error) {
            console.error('Error uploading to R2:', error);
            throw error;
        }
    }

    // Upload PDF file
    async uploadPDF(file) {
        return this.uploadFile(file, 'books/pdfs');
    }

    // Upload cover image
    async uploadCoverImage(file) {
        return this.uploadFile(file, 'books/covers');
    }

    // Delete file from R2
    async deleteFile(fileId) {
        if (!this.isConfigured) {
            throw new Error('Cloudflare R2 is not configured');
        }

        try {
            const response = await fetch('/api/r2/delete', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ fileId })
            });

            if (!response.ok) {
                throw new Error('Failed to delete file from R2');
            }

            return { success: true };
        } catch (error) {
            console.error('Error deleting from R2:', error);
            throw error;
        }
    }

    // Get file URL
    getFileUrl(fileId) {
        if (!this.isConfigured || !fileId) {
            return null;
        }
        return `${this.publicUrl}/${fileId}`;
    }

    // Check if R2 is available
    isAvailable() {
        return this.isConfigured;
    }

    // Get storage info
    getStorageInfo() {
        return {
            provider: 'Cloudflare R2',
            configured: this.isConfigured,
            bucketName: this.bucketName,
            publicUrl: this.publicUrl
        };
    }
}

export const r2Service = new CloudflareR2Service();

// Hybrid storage service that uses R2 when available, falls back to Appwrite
export class HybridStorageService {
    constructor() {
        this.r2 = r2Service;
        this.preferR2 = true; // Prefer R2 over Appwrite Storage
    }

    async uploadFile(file, folder = '') {
        // Try R2 first if configured and preferred
        if (this.preferR2 && this.r2.isAvailable()) {
            try {
                return await this.r2.uploadFile(file, folder);
            } catch (error) {
                console.warn('R2 upload failed, falling back to Appwrite:', error);
            }
        }

        // Fallback to Appwrite Storage
        const { storage, BOOKS_BUCKET_ID, COVERS_BUCKET_ID } = await import('../../lib/appwrite');
        const { ID } = await import('appwrite');

        try {
            const bucketId = folder.includes('covers') ? COVERS_BUCKET_ID : BOOKS_BUCKET_ID;
            const fileUpload = await storage.createFile(bucketId, ID.unique(), file);
            
            return {
                fileId: fileUpload.$id,
                fileUrl: storage.getFileView(bucketId, fileUpload.$id),
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
                provider: 'Appwrite'
            };
        } catch (error) {
            console.error('Appwrite upload failed:', error);
            throw new Error('Failed to upload file to any storage provider');
        }
    }

    async uploadPDF(file) {
        return this.uploadFile(file, 'books/pdfs');
    }

    async uploadCoverImage(file) {
        return this.uploadFile(file, 'books/covers');
    }

    async deleteFile(fileId, provider = 'auto') {
        // Try R2 first if it looks like an R2 file ID
        if (provider === 'auto' || provider === 'r2') {
            if (this.r2.isAvailable() && fileId.includes('/')) {
                try {
                    return await this.r2.deleteFile(fileId);
                } catch (error) {
                    console.warn('R2 delete failed:', error);
                }
            }
        }

        // Try Appwrite Storage
        if (provider === 'auto' || provider === 'appwrite') {
            try {
                const { storage, BOOKS_BUCKET_ID, COVERS_BUCKET_ID } = await import('../../lib/appwrite');
                
                // Try both buckets
                try {
                    await storage.deleteFile(BOOKS_BUCKET_ID, fileId);
                    return { success: true };
                } catch {
                    await storage.deleteFile(COVERS_BUCKET_ID, fileId);
                    return { success: true };
                }
            } catch (error) {
                console.warn('Appwrite delete failed:', error);
            }
        }

        throw new Error('Failed to delete file from any storage provider');
    }

    getFileUrl(fileId, provider = 'auto') {
        // If it looks like an R2 file ID (contains path separators)
        if (fileId && fileId.includes('/') && this.r2.isAvailable()) {
            return this.r2.getFileUrl(fileId);
        }

        // Otherwise assume it's an Appwrite file ID
        // This will be handled by the books service
        return null;
    }

    getStorageInfo() {
        return {
            primary: this.r2.isAvailable() ? 'Cloudflare R2' : 'Appwrite Storage',
            r2: this.r2.getStorageInfo(),
            fallback: 'Appwrite Storage'
        };
    }
}

export const hybridStorage = new HybridStorageService();
