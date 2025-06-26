import { Client, Account, Databases, Storage, Query } from 'appwrite';

// Appwrite configuration
const client = new Client();

client
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

// Initialize Appwrite services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// Database and Collection IDs
export const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
export const BOOKS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_BOOKS_COLLECTION_ID;
export const USERS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID;
export const DOWNLOADS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_DOWNLOADS_COLLECTION_ID;
export const FAVORITES_COLLECTION_ID = import.meta.env.VITE_APPWRITE_FAVORITES_COLLECTION_ID;

// Storage Bucket IDs
export const BOOKS_BUCKET_ID = import.meta.env.VITE_APPWRITE_BOOKS_BUCKET_ID;
export const COVERS_BUCKET_ID = import.meta.env.VITE_APPWRITE_COVERS_BUCKET_ID;

// Export Query for easy access
export { Query };

// Helper function to get file preview URL
export const getFilePreview = (bucketId, fileId) => {
    return storage.getFilePreview(bucketId, fileId);
};

// Helper function to get file download URL
export const getFileDownload = (bucketId, fileId) => {
    return storage.getFileDownload(bucketId, fileId);
};

export default client;
