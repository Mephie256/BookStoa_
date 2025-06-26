// Script to seed the database with sample Christian books
import { booksApi } from '../services/newApi';

const sampleBooks = [
  {
    title: 'The Purpose Driven Life',
    author: 'Rick Warren',
    genre: 'Christian Living',
    category: 'Christian Living',
    description: 'A groundbreaking manifesto on the meaning of life that has inspired millions of readers worldwide. Warren guides you through a personal 40-day spiritual journey that will transform your answer to life\'s most important question: What on earth am I here for?',
    pages: 334,
    rating: 4.8,
    total_ratings: 1247,
    published_date: '2002-10-01',
    language: 'English',
    isbn: '9780310205715',
    tags: ['Purpose', 'Life', 'Spiritual Growth', 'Bestseller'],
    cover_file_url: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1320532872i/4063.jpg',
    pdf_file_url: 'https://example.com/purpose-driven-life.pdf',
    audioLink: 'https://example.com/audio/purpose-driven-life.mp3'
  },
  {
    title: 'Jesus Calling',
    author: 'Sarah Young',
    genre: 'Devotional',
    category: 'Devotional',
    description: 'Experience peace in the presence of the Savior who is always with you. This devotional is written as if Jesus Himself is speaking directly to your heart, based on Jesus\' own words of hope, guidance, and peace within Scripture.',
    pages: 400,
    rating: 4.9,
    total_ratings: 892,
    published_date: '2004-10-01',
    language: 'English',
    isbn: '9781591451884',
    tags: ['Devotional', 'Daily Reading', 'Peace', 'Comfort'],
    cover_file_url: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1320552628i/8186808.jpg',
    pdf_file_url: 'https://example.com/jesus-calling.pdf'
  },
  {
    title: 'Mere Christianity',
    author: 'C.S. Lewis',
    genre: 'Apologetics',
    category: 'Apologetics',
    description: 'One of the most popular and beloved introductions to the concept of faith ever written, Mere Christianity has sold millions of copies worldwide. Lewis\'s forceful and accessible doctrine has sustained believers for over half a century.',
    pages: 227,
    rating: 4.7,
    total_ratings: 2156,
    published_date: '1952-01-01',
    language: 'English',
    isbn: '9780060652920',
    tags: ['Apologetics', 'Faith', 'Classic', 'Philosophy'],
    cover_file_url: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1308068055i/801463.jpg',
    pdf_file_url: 'https://example.com/mere-christianity.pdf',
    audioLink: 'https://example.com/audio/mere-christianity.mp3'
  },
  {
    title: 'The Case for Christ',
    author: 'Lee Strobel',
    genre: 'Apologetics',
    category: 'Apologetics',
    description: 'A seasoned journalist chases down the biggest story in history—is there credible evidence that Jesus of Nazareth really is the Son of God? Retracing his own spiritual journey, Strobel cross-examines experts with doctorates from Cambridge, Princeton, and Brandeis.',
    pages: 360,
    rating: 4.6,
    total_ratings: 1834,
    published_date: '1998-08-01',
    language: 'English',
    isbn: '9780310209300',
    tags: ['Apologetics', 'Evidence', 'Investigation', 'Historical'],
    cover_file_url: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1347765716i/32773.jpg',
    pdf_file_url: 'https://example.com/case-for-christ.pdf'
  },
  {
    title: 'Crazy Love',
    author: 'Francis Chan',
    genre: 'Christian Living',
    category: 'Christian Living',
    description: 'Have you ever wondered if we\'re missing it? It\'s crazy, if you think about it. The God of the universe—the Creator of nitrogen and pine needles, galaxies and E-minor—loves us with a radical, unconditional, self-sacrificing love.',
    pages: 208,
    rating: 4.8,
    total_ratings: 967,
    published_date: '2008-10-01',
    language: 'English',
    isbn: '9780781400435',
    tags: ['Love', 'Radical Faith', 'Commitment', 'Discipleship'],
    cover_file_url: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1266815746i/6827756.jpg',
    pdf_file_url: 'https://example.com/crazy-love.pdf',
    audioLink: 'https://example.com/audio/crazy-love.mp3'
  },
  {
    title: 'The Screwtape Letters',
    author: 'C.S. Lewis',
    genre: 'Theology',
    category: 'Theology',
    description: 'A masterpiece of satire, this classic has entertained and enlightened readers the world over with its sly and ironic portrayal of human life and foibles from the vantage point of Screwtape, a highly placed assistant to "Our Father Below."',
    pages: 175,
    rating: 4.5,
    total_ratings: 1456,
    published_date: '1942-02-01',
    language: 'English',
    isbn: '9780060652890',
    tags: ['Satire', 'Spiritual Warfare', 'Classic', 'Temptation'],
    cover_file_url: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1374085330i/17253.jpg',
    pdf_file_url: 'https://example.com/screwtape-letters.pdf',
    audioLink: 'https://example.com/audio/screwtape-letters.mp3'
  },
  {
    title: 'Desiring God',
    author: 'John Piper',
    genre: 'Theology',
    category: 'Theology',
    description: 'Scripture reveals that the pursuit of pleasure is a necessary motive for every good deed. God himself is most glorified in us when we are most satisfied in him. This truth is the foundation of Christian Hedonism.',
    pages: 364,
    rating: 4.7,
    total_ratings: 743,
    published_date: '1986-01-01',
    language: 'English',
    isbn: '9781590521229',
    tags: ['Joy', 'Worship', 'Christian Hedonism', 'Satisfaction'],
    cover_file_url: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1320552628i/8186808.jpg',
    pdf_file_url: 'https://example.com/desiring-god.pdf'
  },
  {
    title: 'The Pilgrim\'s Progress',
    author: 'John Bunyan',
    genre: 'Christian Living',
    category: 'Christian Living',
    description: 'A timeless allegory that has captivated readers for more than three centuries. Follow Christian on his journey from the City of Destruction to the Celestial City, encountering obstacles, temptations, and fellow travelers along the way.',
    pages: 324,
    rating: 4.4,
    total_ratings: 1289,
    published_date: '1678-01-01',
    language: 'English',
    isbn: '9780140430400',
    tags: ['Allegory', 'Journey', 'Classic', 'Pilgrimage'],
    cover_file_url: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327872146i/29797.jpg',
    pdf_file_url: 'https://example.com/pilgrims-progress.pdf',
    audioLink: 'https://example.com/audio/pilgrims-progress.mp3'
  },
  {
    title: 'The Cost of Discipleship',
    author: 'Dietrich Bonhoeffer',
    genre: 'Theology',
    category: 'Theology',
    description: 'What did Jesus mean to say to us? What is his will for us today? Drawing on the Sermon on the Mount, Bonhoeffer answers these timeless questions by showing us what it means to follow Christ.',
    pages: 352,
    rating: 4.6,
    total_ratings: 892,
    published_date: '1937-01-01',
    language: 'English',
    isbn: '9780684815008',
    tags: ['Discipleship', 'Sacrifice', 'Following Christ', 'Commitment'],
    cover_file_url: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1348932089i/92307.jpg',
    pdf_file_url: 'https://example.com/cost-of-discipleship.pdf'
  },
  {
    title: 'My Utmost for His Highest',
    author: 'Oswald Chambers',
    genre: 'Devotional',
    category: 'Devotional',
    description: 'For over seventy years this daily devotional has challenged, comforted, and changed the lives of millions of readers around the world. Each day\'s reading contains a Bible verse, a short reading, and a prayer.',
    pages: 400,
    rating: 4.8,
    total_ratings: 1567,
    published_date: '1927-01-01',
    language: 'English',
    isbn: '9780929239576',
    tags: ['Daily Devotional', 'Spiritual Growth', 'Classic', 'Prayer'],
    cover_file_url: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1348932089i/92307.jpg',
    pdf_file_url: 'https://example.com/my-utmost.pdf',
    audioLink: 'https://example.com/audio/my-utmost.mp3'
  }
];

// Function to add books to database
export const seedDatabase = async () => {
  console.log('🌱 Starting database seeding...');

  let successCount = 0;
  let errorCount = 0;

  for (const book of sampleBooks) {
    try {
      console.log(`📚 Adding: ${book.title} by ${book.author}`);
      const result = await booksApi.create(book);

      if (result.success) {
        successCount++;
        console.log(`✅ Successfully added: ${book.title}`);
      } else {
        errorCount++;
        console.error(`❌ Failed to add: ${book.title}`, result.error);
      }
    } catch (error) {
      errorCount++;
      console.error(`❌ Error adding ${book.title}:`, error.message);
    }

    // Small delay to avoid overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`\n🎉 Seeding complete!`);
  console.log(`✅ Successfully added: ${successCount} books`);
  console.log(`❌ Failed to add: ${errorCount} books`);

  return { successCount, errorCount };
};

// Export the sample books for other uses
export { sampleBooks };
