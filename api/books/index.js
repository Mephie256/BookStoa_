// Vercel API function for books
import { db, books } from '../../src/lib/db/index.js'
import { eq, like, desc, asc } from 'drizzle-orm'
import { clerkClient } from '@clerk/backend'

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  )
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    switch (req.method) {
      case 'GET':
        return await getBooks(req, res)
      case 'POST':
        return await createBook(req, res)
      default:
        return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
//__Filtered books
// Get books with filters
async function getBooks(req, res) {
  const {
    search,
    genre,
    category,
    featured,
    bestseller,
    newRelease,
    limit = 20,
    offset = 0,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query

  let query = db.select().from(books)

  // Apply filters
  const conditions = []

  if (search) {
    conditions.push(
      like(books.title, `%${search}%`),
      like(books.author, `%${search}%`),
      like(books.description, `%${search}%`)
    )
  }

  if (genre) {
    conditions.push(eq(books.genre, genre))
  }

  if (category) {
    conditions.push(eq(books.category, category))
  }

  if (featured === 'true') {
    conditions.push(eq(books.featured, true))
  }

  if (bestseller === 'true') {
    conditions.push(eq(books.bestseller, true))
  }

  if (newRelease === 'true') {
    conditions.push(eq(books.newRelease, true))
  }

  // Apply conditions
  if (conditions.length > 0) {
    query = query.where(or(...conditions))
  }

  // Apply sorting
  const sortColumn = books[sortBy] || books.createdAt
  query = query.orderBy(
    sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn)
  )

  // Apply pagination
  query = query.limit(parseInt(limit)).offset(parseInt(offset))

  const result = await query

  return res.status(200).json({
    books: result,
    pagination: {
      limit: parseInt(limit),
      offset: parseInt(offset),
      total: result.length,
    },
  })
}

// Create new book (admin only)
async function createBook(req, res) {
  // Verify admin access
  const { authorization } = req.headers
  if (!authorization) {
    return res.status(401).json({ error: 'Authorization required' })
  }

  try {
    const token = authorization.replace('Bearer ', '')
    const { userId } = await clerkClient.verifyToken(token)

    // Get user from database to check admin role
    const user = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1)

    if (!user[0] || user[0].role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' })
    }

    const bookData = req.body

    // Validate required fields
    const requiredFields = ['title', 'author', 'description', 'genre']
    for (const field of requiredFields) {
      if (!bookData[field]) {
        return res.status(400).json({ error: `${field} is required` })
      }
    }

    // Create book
    const newBook = await db
      .insert(books)
      .values({
        ...bookData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()

    return res.status(201).json({ book: newBook[0] })
  } catch (error) {
    console.error('Auth error:', error)
    return res.status(401).json({ error: 'Invalid token' })
  }
}
