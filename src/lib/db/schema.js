import { pgTable, text, timestamp, integer, boolean, decimal } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

// ============================================
// BETTER-AUTH TABLES
// ============================================

// Users table - Compatible with better-auth
export const user = pgTable('user', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  email: text('email').unique().notNull(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  // Custom fields for our app
  role: text('role').default('user').notNull(),
  isActive: boolean('isActive').default(true).notNull(),
});

// Session table - Required by better-auth
export const session = pgTable("session", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

// Account table - For authentication methods
export const account = pgTable("account", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  expiresAt: timestamp("expiresAt"),
  password: text("password"), // For email/password authentication
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

// Verification table - For email verification
export const verification = pgTable("verification", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
});

// ============================================
// APPLICATION TABLES
// ============================================

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
  // Payment fields
  isFree: boolean('is_free').default(true).notNull(),
  price: integer('price').default(0), // Price in UGX
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Favorites table
export const favorites = pgTable('favorites', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }).notNull(),
  bookId: text('book_id').references(() => books.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Downloads table
export const downloads = pgTable('downloads', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }).notNull(),
  bookId: text('book_id').references(() => books.id, { onDelete: 'cascade' }).notNull(),
  downloadType: text('download_type').default('pdf').notNull(), // 'pdf', 'audio'
  downloadCount: integer('download_count').default(1).notNull(),
  downloadedAt: timestamp('downloaded_at').defaultNow().notNull(),
  lastDownloadedAt: timestamp('last_downloaded_at').defaultNow().notNull(),
});

// Book ratings table (for future use)
export const bookRatings = pgTable('book_ratings', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }).notNull(),
  bookId: text('book_id').references(() => books.id, { onDelete: 'cascade' }).notNull(),
  rating: integer('rating').notNull(), // 1-5 stars
  review: text('review'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Reading progress table (for future use)
export const readingProgress = pgTable('reading_progress', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }).notNull(),
  bookId: text('book_id').references(() => books.id, { onDelete: 'cascade' }).notNull(),
  currentPage: integer('current_page').default(0),
  totalPages: integer('total_pages'),
  progressPercentage: decimal('progress_percentage', { precision: 5, scale: 2 }).default('0'),
  lastReadAt: timestamp('last_read_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
