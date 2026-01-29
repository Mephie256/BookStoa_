import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { sql as sqlOp } from 'drizzle-orm';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function runMigration() {
  try {
    console.log('🚀 Running better-auth migration...\n');

    const sql = neon(process.env.DATABASE_URL);
    const db = drizzle(sql);

    console.log('Step 1: Dropping old tables...');
    await db.execute(sqlOp`DROP TABLE IF EXISTS "verificationToken" CASCADE`);
    await db.execute(sqlOp`DROP TABLE IF EXISTS "session" CASCADE`);
    await db.execute(sqlOp`DROP TABLE IF EXISTS "account" CASCADE`);
    await db.execute(sqlOp`DROP TABLE IF EXISTS "users" CASCADE`);

    console.log('Step 2: Creating user table...');
    await db.execute(sqlOp`
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
      )
    `);

    console.log('Step 3: Creating session table...');
    await db.execute(sqlOp`
      CREATE TABLE IF NOT EXISTS "session" (
        "id" text PRIMARY KEY NOT NULL,
        "expiresAt" timestamp NOT NULL,
        "ipAddress" text,
        "userAgent" text,
        "userId" text NOT NULL,
        "createdAt" timestamp DEFAULT now() NOT NULL,
        "updatedAt" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE cascade
      )
    `);

    console.log('Step 4: Creating account table...');
    await db.execute(sqlOp`
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
      )
    `);

    console.log('Step 5: Creating verification table...');
    await db.execute(sqlOp`
      CREATE TABLE IF NOT EXISTS "verification" (
        "id" text PRIMARY KEY NOT NULL,
        "identifier" text NOT NULL,
        "value" text NOT NULL,
        "expiresAt" timestamp NOT NULL,
        "createdAt" timestamp DEFAULT now(),
        "updatedAt" timestamp DEFAULT now()
      )
    `);

    console.log('Step 6: Updating foreign keys in favorites table...');
    await db.execute(sqlOp`ALTER TABLE "favorites" DROP CONSTRAINT IF EXISTS "favorites_user_id_users_id_fk"`);
    await db.execute(sqlOp`ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade`);

    console.log('Step 7: Updating foreign keys in downloads table...');
    await db.execute(sqlOp`ALTER TABLE "downloads" DROP CONSTRAINT IF EXISTS "downloads_user_id_users_id_fk"`);
    await db.execute(sqlOp`ALTER TABLE "downloads" ADD CONSTRAINT "downloads_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade`);

    console.log('Step 8: Updating foreign keys in book_ratings table...');
    await db.execute(sqlOp`ALTER TABLE "book_ratings" DROP CONSTRAINT IF EXISTS "book_ratings_user_id_users_id_fk"`);
    await db.execute(sqlOp`ALTER TABLE "book_ratings" ADD CONSTRAINT "book_ratings_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade`);

    console.log('Step 9: Updating foreign keys in reading_progress table...');
    await db.execute(sqlOp`ALTER TABLE "reading_progress" DROP CONSTRAINT IF EXISTS "reading_progress_user_id_users_id_fk"`);
    await db.execute(sqlOp`ALTER TABLE "reading_progress" ADD CONSTRAINT "reading_progress_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade`);

    console.log('\n✅ Migration completed successfully!');
    console.log('\n📝 Better-auth tables created:');
    console.log('  - user');
    console.log('  - session');
    console.log('  - account');
    console.log('  - verification');
    console.log('\n🔗 Foreign keys updated for:');
    console.log('  - favorites');
    console.log('  - downloads');
    console.log('  - book_ratings');
    console.log('  - reading_progress');
    console.log('\n🎉 You can now run `npm run dev` to start your app with better-auth!');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    console.error('\nError details:', error.message);
    process.exit(1);
  }
}

runMigration();
