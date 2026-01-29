-- Drop old tables
DROP TABLE IF EXISTS "verificationToken" CASCADE;
DROP TABLE IF EXISTS "session" CASCADE;
DROP TABLE IF EXISTS "account" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

-- Create better-auth compatible tables
CREATE TABLE IF NOT EXISTS "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"emailVerified" boolean DEFAULT false NOT NULL,
	"image" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);

CREATE TABLE IF NOT EXISTS "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"userId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE cascade
);

CREATE TABLE IF NOT EXISTS "account" (
	"id" text PRIMARY KEY NOT NULL,
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"userId" text NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"idToken" text,
	"expiresAt" timestamp,
	"password" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE cascade
);

CREATE TABLE IF NOT EXISTS "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);

-- Update foreign keys in existing tables to reference new 'user' table
ALTER TABLE "favorites" DROP CONSTRAINT IF EXISTS "favorites_user_id_users_id_fk";
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_user_id_fk" 
  FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade;

ALTER TABLE "downloads" DROP CONSTRAINT IF EXISTS "downloads_user_id_users_id_fk";
ALTER TABLE "downloads" ADD CONSTRAINT "downloads_user_id_user_id_fk" 
  FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade;

ALTER TABLE "book_ratings" DROP CONSTRAINT IF EXISTS "book_ratings_user_id_users_id_fk";
ALTER TABLE "book_ratings" ADD CONSTRAINT "book_ratings_user_id_user_id_fk" 
  FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade;

ALTER TABLE "reading_progress" DROP CONSTRAINT IF EXISTS "reading_progress_user_id_users_id_fk";
ALTER TABLE "reading_progress" ADD CONSTRAINT "reading_progress_user_id_user_id_fk" 
  FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade;
