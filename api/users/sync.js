// Vercel API function for user sync with Clerk
import { db, users } from '../../src/lib/db/index.js';
import { eq } from 'drizzle-orm';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { clerkId, email, name } = req.body;

    if (!clerkId || !email || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);

    if (existingUser.length > 0) {
      // Update existing user
      const updatedUser = await db
        .update(users)
        .set({
          email,
          name,
          updatedAt: new Date()
        })
        .where(eq(users.clerkId, clerkId))
        .returning();

      return res.status(200).json(updatedUser[0]);
    }

    // Determine role based on admin email
    const adminEmail = process.env.VITE_ADMIN_EMAIL || 'admin@pneumabookstore.com';
    const role = email.toLowerCase() === adminEmail.toLowerCase() ? 'admin' : 'user';

    // Create new user
    const newUser = await db
      .insert(users)
      .values({
        clerkId,
        email,
        name,
        role,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    return res.status(201).json(newUser[0]);

  } catch (error) {
    console.error('User sync error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
