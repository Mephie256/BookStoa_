import { betterAuth } from "better-auth";

import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { drizzle } from 'drizzle-orm/neon-http';

import { neon } from '@neondatabase/serverless';

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

    emailAndPassword: {

      enabled: true,

      requireEmailVerification: false,

    },

    session: {

      expiresIn: 60 * 60 * 24 * 7, // 7 days

      updateAge: 60 * 60 * 24, // 1 day

    },

    trustedOrigins: (() => {
      const defaults = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
        "http://localhost:3000",
      ];

      try {
        if (BETTER_AUTH_URL) {
          const origin = new URL(BETTER_AUTH_URL).origin;
          if (origin && !defaults.includes(origin)) defaults.push(origin);
        }
      } catch {
        // ignore invalid BETTER_AUTH_URL
      }

      return defaults;
    })(),

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

