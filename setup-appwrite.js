// Appwrite Setup Script
// Run this script to automatically create your database, collections, and storage buckets

import { Client, Databases, Storage, Permission, Role } from 'appwrite';

const client = new Client();
client
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject('68574828002ce0afad71')
    .setKey('YOUR_API_KEY_HERE'); // You'll need to create an API key in Appwrite Console

const databases = new Databases(client);
const storage = new Storage(client);

const DATABASE_ID = 'pneuma-bookstore';

async function setupAppwrite() {
    try {
        console.log('🚀 Setting up Appwrite for Pneuma BookStore...\n');

        // 1. Create Database
        console.log('📊 Creating database...');
        try {
            await databases.create(DATABASE_ID, 'Pneuma BookStore Database');
            console.log('✅ Database created successfully');
        } catch (error) {
            if (error.code === 409) {
                console.log('ℹ️  Database already exists');
            } else {
                throw error;
            }
        }

        // 2. Create Collections
        const collections = [
            {
                id: 'books',
                name: 'Books',
                permissions: [
                    Permission.read(Role.any()),
                    Permission.create(Role.users()),
                    Permission.update(Role.users()),
                    Permission.delete(Role.users())
                ],
                attributes: [
                    { key: 'title', type: 'string', size: 255, required: true },
                    { key: 'author', type: 'string', size: 255, required: true },
                    { key: 'description', type: 'string', size: 1000, required: true },
                    { key: 'fullDescription', type: 'string', size: 5000, required: false },
                    { key: 'genre', type: 'string', size: 100, required: true },
                    { key: 'category', type: 'string', size: 100, required: false },
                    { key: 'tags', type: 'string', size: 1000, required: false },
                    { key: 'publisher', type: 'string', size: 255, required: false },
                    { key: 'publishedDate', type: 'string', size: 50, required: false },
                    { key: 'isbn', type: 'string', size: 50, required: false },
                    { key: 'language', type: 'string', size: 50, required: true, default: 'English' },
                    { key: 'pages', type: 'integer', required: false },
                    { key: 'rating', type: 'double', required: false, default: 0 },
                    { key: 'totalRatings', type: 'integer', required: false, default: 0 },
                    { key: 'downloads', type: 'integer', required: false, default: 0 },
                    { key: 'audioLink', type: 'string', size: 500, required: false },
                    { key: 'previewLink', type: 'string', size: 500, required: false },
                    { key: 'pdfFileId', type: 'string', size: 100, required: false },
                    { key: 'pdfFileUrl', type: 'string', size: 500, required: false },
                    { key: 'coverFileId', type: 'string', size: 100, required: false },
                    { key: 'coverFileUrl', type: 'string', size: 500, required: false },
                    { key: 'featured', type: 'boolean', required: false, default: false },
                    { key: 'bestseller', type: 'boolean', required: false, default: false },
                    { key: 'newRelease', type: 'boolean', required: false, default: false },
                    { key: 'createdAt', type: 'datetime', required: true },
                    { key: 'updatedAt', type: 'datetime', required: true }
                ]
            },
            {
                id: 'users',
                name: 'Users',
                permissions: [
                    Permission.read(Role.users()),
                    Permission.create(Role.users()),
                    Permission.update(Role.users()),
                    Permission.delete(Role.users())
                ],
                attributes: [
                    { key: 'name', type: 'string', size: 255, required: true },
                    { key: 'email', type: 'string', size: 255, required: true },
                    { key: 'role', type: 'string', size: 50, required: true, default: 'user' },
                    { key: 'isActive', type: 'boolean', required: true, default: true },
                    { key: 'createdAt', type: 'datetime', required: true },
                    { key: 'updatedAt', type: 'datetime', required: true }
                ]
            },
            {
                id: 'favorites',
                name: 'Favorites',
                permissions: [
                    Permission.read(Role.users()),
                    Permission.create(Role.users()),
                    Permission.update(Role.users()),
                    Permission.delete(Role.users())
                ],
                attributes: [
                    { key: 'userId', type: 'string', size: 100, required: true },
                    { key: 'bookId', type: 'string', size: 100, required: true },
                    { key: 'createdAt', type: 'datetime', required: true }
                ]
            },
            {
                id: 'downloads',
                name: 'Downloads',
                permissions: [
                    Permission.read(Role.users()),
                    Permission.create(Role.users()),
                    Permission.update(Role.users()),
                    Permission.delete(Role.users())
                ],
                attributes: [
                    { key: 'userId', type: 'string', size: 100, required: true },
                    { key: 'bookId', type: 'string', size: 100, required: true },
                    { key: 'downloadType', type: 'string', size: 50, required: true, default: 'pdf' },
                    { key: 'downloadCount', type: 'integer', required: true, default: 1 },
                    { key: 'downloadedAt', type: 'datetime', required: true },
                    { key: 'lastDownloadedAt', type: 'datetime', required: true }
                ]
            }
        ];

        for (const collection of collections) {
            console.log(`📚 Creating collection: ${collection.name}...`);
            try {
                await databases.createCollection(
                    DATABASE_ID,
                    collection.id,
                    collection.name,
                    collection.permissions
                );
                console.log(`✅ Collection '${collection.name}' created`);

                // Create attributes
                for (const attr of collection.attributes) {
                    try {
                        if (attr.type === 'string') {
                            await databases.createStringAttribute(
                                DATABASE_ID,
                                collection.id,
                                attr.key,
                                attr.size,
                                attr.required,
                                attr.default
                            );
                        } else if (attr.type === 'integer') {
                            await databases.createIntegerAttribute(
                                DATABASE_ID,
                                collection.id,
                                attr.key,
                                attr.required,
                                undefined,
                                undefined,
                                attr.default
                            );
                        } else if (attr.type === 'double') {
                            await databases.createFloatAttribute(
                                DATABASE_ID,
                                collection.id,
                                attr.key,
                                attr.required,
                                undefined,
                                undefined,
                                attr.default
                            );
                        } else if (attr.type === 'boolean') {
                            await databases.createBooleanAttribute(
                                DATABASE_ID,
                                collection.id,
                                attr.key,
                                attr.required,
                                attr.default
                            );
                        } else if (attr.type === 'datetime') {
                            await databases.createDatetimeAttribute(
                                DATABASE_ID,
                                collection.id,
                                attr.key,
                                attr.required
                            );
                        }
                        console.log(`  ✅ Attribute '${attr.key}' created`);
                    } catch (attrError) {
                        if (attrError.code === 409) {
                            console.log(`  ℹ️  Attribute '${attr.key}' already exists`);
                        } else {
                            console.log(`  ❌ Error creating attribute '${attr.key}':`, attrError.message);
                        }
                    }
                }
            } catch (error) {
                if (error.code === 409) {
                    console.log(`ℹ️  Collection '${collection.name}' already exists`);
                } else {
                    throw error;
                }
            }
        }

        // 3. Create Storage Buckets
        const buckets = [
            {
                id: 'books-pdfs',
                name: 'Books PDFs',
                permissions: [
                    Permission.read(Role.any()),
                    Permission.create(Role.users()),
                    Permission.update(Role.users()),
                    Permission.delete(Role.users())
                ],
                fileSecurity: true,
                enabled: true,
                maximumFileSize: 50000000, // 50MB
                allowedFileExtensions: ['pdf']
            },
            {
                id: 'book-covers',
                name: 'Book Covers',
                permissions: [
                    Permission.read(Role.any()),
                    Permission.create(Role.users()),
                    Permission.update(Role.users()),
                    Permission.delete(Role.users())
                ],
                fileSecurity: true,
                enabled: true,
                maximumFileSize: 5000000, // 5MB
                allowedFileExtensions: ['jpg', 'jpeg', 'png', 'webp']
            }
        ];

        for (const bucket of buckets) {
            console.log(`🗂️  Creating storage bucket: ${bucket.name}...`);
            try {
                await storage.createBucket(
                    bucket.id,
                    bucket.name,
                    bucket.permissions,
                    bucket.fileSecurity,
                    bucket.enabled,
                    bucket.maximumFileSize,
                    bucket.allowedFileExtensions
                );
                console.log(`✅ Storage bucket '${bucket.name}' created`);
            } catch (error) {
                if (error.code === 409) {
                    console.log(`ℹ️  Storage bucket '${bucket.name}' already exists`);
                } else {
                    throw error;
                }
            }
        }

        console.log('\n🎉 Appwrite setup completed successfully!');
        console.log('\n📋 Next steps:');
        console.log('1. Create your first admin user by registering in the app');
        console.log('2. Go to Appwrite Console → Auth → Users');
        console.log('3. Find your user and copy the User ID');
        console.log('4. Go to Databases → Users Collection');
        console.log('5. Find your user document and change role from "user" to "admin"');
        console.log('6. Now you can access admin features!');

    } catch (error) {
        console.error('❌ Setup failed:', error);
    }
}

// Run setup
setupAppwrite();

// Instructions for running this script:
console.log('📝 To run this setup script:');
console.log('1. Go to Appwrite Console → Overview → Integrations');
console.log('2. Create a new API Key with all permissions');
console.log('3. Replace YOUR_API_KEY_HERE with your actual API key');
console.log('4. Run: node setup-appwrite.js');
