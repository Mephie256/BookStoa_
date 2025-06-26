import { pgTable, text, timestamp, integer, boolean, decimal, uuid } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

// Users table
export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  clerkId: text('clerk_id').unique().notNull(),
  email: text('email').unique().notNull(),
  name: text('name').notNull(),
  role: text('role').default('user').notNull(), // 'user' or 'admin'
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Books table
export const books = pgTable('books', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  title: text('title').notNull(),
  author: text('author').notNull(),
  description: text('description').notNull(),
  fullDescription: text('full_description'),
  genre: text('genre').notNull(),
  category: text('category'),
  tags: text('tags'), // JSON string of tags array
  publisher: text('publisher'),
  publishedDate: text('published_date'),
  isbn: text('isbn'),
  language: text('language').default('English').notNull(),
  pages: integer('pages'),
  rating: decimal('rating', { precision: 3, scale: 2 }).default('0'),
  totalRatings: integer('total_ratings').default(0),
  downloads: integer('downloads').default(0),
  audioLink: text('audio_link'),
  previewLink: text('preview_link'),
  pdfFileUrl: text('pdf_file_url'),
  pdfFileId: text('pdf_file_id'), // Cloudinary public_id
  coverFileUrl: text('cover_file_url'),
  coverFileId: text('cover_file_id'), // Cloudinary public_id
  featured: boolean('featured').default(false),
  bestseller: boolean('bestseller').default(false),
  newRelease: boolean('new_release').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Favorites table
export const favorites = pgTable('favorites', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  bookId: text('book_id').references(() => books.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Downloads table
export const downloads = pgTable('downloads', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  bookId: text('book_id').references(() => books.id, { onDelete: 'cascade' }).notNull(),
  downloadType: text('download_type').default('pdf').notNull(), // 'pdf', 'audio'
  downloadCount: integer('download_count').default(1).notNull(),
  downloadedAt: timestamp('downloaded_at').defaultNow().notNull(),
  lastDownloadedAt: timestamp('last_downloaded_at').defaultNow().notNull(),
});

// Book ratings table (for future use)
export const bookRatings = pgTable('book_ratings', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  bookId: text('book_id').references(() => books.id, { onDelete: 'cascade' }).notNull(),
  rating: integer('rating').notNull(), // 1-5 stars
  review: text('review'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Reading progress table (for future use)
export const readingProgress = pgTable('reading_progress', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  bookId: text('book_id').references(() => books.id, { onDelete: 'cascade' }).notNull(),
  currentPage: integer('current_page').default(0),
  totalPages: integer('total_pages'),
  progressPercentage: decimal('progress_percentage', { precision: 5, scale: 2 }).default('0'),
  lastReadAt: timestamp('last_read_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
