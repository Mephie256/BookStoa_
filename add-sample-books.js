// Script to add sample books to the database
import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

const sampleBooks = [
  {
    id: 'book_1',
    title: 'The Purpose Driven Life',
    author: 'Rick Warren',
    description: 'A groundbreaking manifesto on the meaning of life that has inspired millions worldwide.',
    full_description: 'This groundbreaking manifesto on the meaning of life has inspired millions of readers worldwide. Rick Warren takes you on a personal journey of discovery, helping you understand God\'s incredible plan for your life both here and now, and for eternity.',
    genre: 'Christian Living',
    category: 'Spiritual Growth',
    tags: 'purpose,life,spiritual,growth',
    publisher: 'Zondervan',
    published_date: '2002-10-23',
    isbn: '9780310205715',
    language: 'English',
    pages: 334,
    rating: 4.8,
    total_ratings: 1247,
    downloads: 1247,
    audio_link: null,
    preview_link: null,
    pdf_file_url: '/uploads/purpose-driven-life.pdf',
    pdf_file_id: 'pdf_purpose_driven',
    cover_file_url: 'https://covers.openlibrary.org/b/isbn/9780310205715-L.jpg',
    cover_file_id: 'cover_purpose_driven',
    featured: true,
    bestseller: true,
    new_release: false
  },
  {
    id: 'book_2',
    title: 'Jesus Calling',
    author: 'Sarah Young',
    description: 'A devotional filled with uniquely inspired treasures from heaven for every day of the year.',
    full_description: 'After many years of writing in her prayer journal, missionary Sarah Young decided to listen to God with pen in hand, writing down whatever she believed He was saying to her.',
    genre: 'Devotional',
    category: 'Daily Reading',
    tags: 'devotional,daily,prayer,jesus',
    publisher: 'Thomas Nelson',
    published_date: '2004-10-01',
    isbn: '9781591451884',
    language: 'English',
    pages: 400,
    rating: 4.9,
    total_ratings: 2156,
    downloads: 892,
    audio_link: null,
    preview_link: null,
    pdf_file_url: '/uploads/jesus-calling.pdf',
    pdf_file_id: 'pdf_jesus_calling',
    cover_file_url: 'https://covers.openlibrary.org/b/isbn/9781591451884-L.jpg',
    cover_file_id: 'cover_jesus_calling',
    featured: true,
    bestseller: false,
    new_release: true
  },
  {
    id: 'book_3',
    title: 'Mere Christianity',
    author: 'C.S. Lewis',
    description: 'A theological book exploring the common ground upon which all Christians stand together.',
    full_description: 'In the classic Mere Christianity, C.S. Lewis, the most important writer of the 20th century, explores the common ground upon which all of those of Christian faith stand together.',
    genre: 'Theology',
    category: 'Apologetics',
    tags: 'theology,apologetics,christianity,lewis',
    publisher: 'HarperOne',
    published_date: '1952-01-01',
    isbn: '9780060652920',
    language: 'English',
    pages: 227,
    rating: 4.7,
    total_ratings: 1834,
    downloads: 756,
    audio_link: null,
    preview_link: null,
    pdf_file_url: '/uploads/mere-christianity.pdf',
    pdf_file_id: 'pdf_mere_christianity',
    cover_file_url: 'https://covers.openlibrary.org/b/isbn/9780060652920-L.jpg',
    cover_file_id: 'cover_mere_christianity',
    featured: false,
    bestseller: true,
    new_release: false
  },
  {
    id: 'book_4',
    title: 'The Case for Christ',
    author: 'Lee Strobel',
    description: 'A journalist\'s personal investigation of the evidence for Jesus.',
    full_description: 'Is there credible evidence that Jesus of Nazareth really is the Son of God? Retracing his own spiritual journey from atheism to faith, Lee Strobel cross-examines experts with doctorates.',
    genre: 'Apologetics',
    category: 'Evidence',
    tags: 'apologetics,evidence,jesus,investigation',
    publisher: 'Zondervan',
    published_date: '1998-08-01',
    isbn: '9780310226956',
    language: 'English',
    pages: 360,
    rating: 4.6,
    total_ratings: 1456,
    downloads: 623,
    audio_link: null,
    preview_link: null,
    pdf_file_url: '/uploads/case-for-christ.pdf',
    pdf_file_id: 'pdf_case_for_christ',
    cover_file_url: 'https://covers.openlibrary.org/b/isbn/9780310226956-L.jpg',
    cover_file_id: 'cover_case_for_christ',
    featured: false,
    bestseller: false,
    new_release: true
  },
  {
    id: 'book_5',
    title: 'Crazy Love',
    author: 'Francis Chan',
    description: 'Overwhelmed by a Relentless God - A book about passionate love for God.',
    full_description: 'Have you ever wondered if we\'re missing it? It\'s crazy, if you think about it. The God of the universe loves us with a radical, unconditional, self-sacrificing love.',
    genre: 'Christian Living',
    category: 'Spiritual Growth',
    tags: 'love,god,passion,radical',
    publisher: 'David C Cook',
    published_date: '2008-10-01',
    isbn: '9781434768513',
    language: 'English',
    pages: 208,
    rating: 4.5,
    total_ratings: 987,
    downloads: 445,
    audio_link: null,
    preview_link: null,
    pdf_file_url: '/uploads/crazy-love.pdf',
    pdf_file_id: 'pdf_crazy_love',
    cover_file_url: 'https://covers.openlibrary.org/b/isbn/9781434768513-L.jpg',
    cover_file_id: 'cover_crazy_love',
    featured: true,
    bestseller: false,
    new_release: false
  }
];

async function addSampleBooks() {
  try {
    console.log('🚀 Adding sample books to database...');
    
    for (const book of sampleBooks) {
      console.log(`📚 Adding: ${book.title}`);
      
      // Check if book already exists
      const existing = await sql`SELECT id FROM books WHERE id = ${book.id}`;
      
      if (existing.length > 0) {
        console.log(`⚠️  Book ${book.title} already exists, skipping...`);
        continue;
      }
      
      // Insert book
      await sql`
        INSERT INTO books (
          id, title, author, description, full_description, genre, category, tags,
          publisher, published_date, isbn, language, pages, rating, total_ratings,
          downloads, audio_link, preview_link, pdf_file_url, pdf_file_id,
          cover_file_url, cover_file_id, featured, bestseller, new_release,
          created_at, updated_at
        ) VALUES (
          ${book.id}, ${book.title}, ${book.author}, ${book.description},
          ${book.full_description}, ${book.genre}, ${book.category}, ${book.tags},
          ${book.publisher}, ${book.published_date}, ${book.isbn}, ${book.language},
          ${book.pages}, ${book.rating}, ${book.total_ratings}, ${book.downloads},
          ${book.audio_link}, ${book.preview_link}, ${book.pdf_file_url}, ${book.pdf_file_id},
          ${book.cover_file_url}, ${book.cover_file_id}, ${book.featured}, ${book.bestseller}, ${book.new_release},
          NOW(), NOW()
        )
      `;
      
      console.log(`✅ Added: ${book.title}`);
    }
    
    console.log('🎉 All sample books added successfully!');
    
    // Verify books were added
    const allBooks = await sql`SELECT id, title, author FROM books ORDER BY created_at DESC`;
    console.log('📚 Books in database:');
    allBooks.forEach(book => {
      console.log(`  - ${book.title} by ${book.author}`);
    });
    
  } catch (error) {
    console.error('❌ Error adding sample books:', error);
  }
}

addSampleBooks();
