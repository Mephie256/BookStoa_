import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { customSession } from "better-auth/plugins";
import { createAuthMiddleware } from "better-auth/api";
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { eq } from 'drizzle-orm';
import * as schema from './db/schema.js';

let authInstance = null;

// Lazy initialization of auth to avoid env variable issues
export function getAuth() {
  if (authInstance) {
    return authInstance;
  }

  // Get DATABASE_URL from environment
  // In Node (Vite middleware), process.env is what we want.
  // In Client, import.meta.env is what we want.
  const DATABASE_URL = process.env.DATABASE_URL || import.meta.env?.DATABASE_URL;
  
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required for better-auth');
  }

  // Get other config
  const BETTER_AUTH_URL = process.env.VITE_BETTER_AUTH_URL || import.meta.env?.VITE_BETTER_AUTH_URL || "http://localhost:5173";
  const BETTER_AUTH_SECRET = process.env.VITE_BETTER_AUTH_SECRET || import.meta.env?.VITE_BETTER_AUTH_SECRET;

  // Create database connection for auth
  const sql = neon(DATABASE_URL);
  const db = drizzle(sql, { schema });

  authInstance = betterAuth({
    database: drizzleAdapter(db, {
      provider: "pg", // PostgreSQL
    }),
    user: {
      additionalFields: {
        role: {
          type: "string",
          input: false,
        },
        isActive: {
          type: "boolean",
          input: false,
        },
      },
    },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // 1 day
    },
    plugins: [
      customSession(async ({ user, session }) => {
        try {
          const userId = session?.session?.userId;
          if (!userId) {
            return { user, session };
          }

          const rows = await db
            .select({ role: schema.user.role, isActive: schema.user.isActive })
            .from(schema.user)
            .where(eq(schema.user.id, userId))
            .limit(1);

          const dbUser = rows?.[0];
          return {
            user: {
              ...user,
              role: dbUser?.role ?? user?.role,
              isActive: dbUser?.isActive ?? user?.isActive,
            },
            session,
          };
        } catch {
          return { user, session };
        }
      }),
    ],
    hooks: {
      after: createAuthMiddleware(async (ctx) => {
        try {
          if (ctx.path !== "/sign-up/email") {
            return;
          }

          const returned = ctx?.context?.returned;
          const returnedUser = returned?.user || returned?.data?.user;
          if (!returnedUser?.id || !returnedUser?.email) {
            return;
          }

          const adminEmail = process.env.VITE_ADMIN_EMAIL || 'admin@pneumabookstore.com';
          const role =
            returnedUser.email.toLowerCase() === adminEmail.toLowerCase() ? 'admin' : 'user';

          await db
            .update(schema.user)
            .set({ role })
            .where(eq(schema.user.id, returnedUser.id));

          returnedUser.role = role;
        } catch {
          return;
        }
      }),
    },
    trustedOrigins: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "http://localhost:5176",
      "http://localhost:3000",
    ],
    // Explicitly set these from resolved variables to verify they are present
    baseURL: BETTER_AUTH_URL,
    secret: BETTER_AUTH_SECRET,
  });

  return authInstance;
}

// For backward compatibility
export const auth = new Proxy({}, {
  get(target, prop) {
    return getAuth()[prop];
  }
});
