import { BookCard } from "./book-card";

const DemoBookCard = () => {
  // Sample book data
  const sampleBook = {
    id: 'demo-1',
    title: 'The Purpose Driven Life',
    author: 'Rick Warren',
    genre: 'Christian Living',
    rating: 4.8,
    pages: 334,
    cover_file_url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop&crop=center',
    pdf_file_url: 'https://example.com/sample.pdf',
    audioLink: 'https://example.com/sample-audio.mp3',
    downloads: 1247
  };

  const sampleBook2 = {
    id: 'demo-2',
    title: 'Jesus Calling: Enjoying Peace in His Presence',
    author: 'Sarah Young',
    genre: 'Devotional',
    rating: 4.7,
    pages: 400,
    cover_file_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop&crop=center',
    pdf_file_url: 'https://example.com/sample2.pdf',
    downloads: 892
  };

  const sampleBook3 = {
    id: 'demo-3',
    title: 'Mere Christianity',
    author: 'C.S. Lewis',
    genre: 'Theology',
    rating: 4.9,
    pages: 227,
    cover_file_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=center',
    pdf_file_url: 'https://example.com/sample3.pdf',
    audioLink: 'https://example.com/sample-audio3.mp3',
    downloads: 756
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-black dark:to-zinc-950 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            New Book Card Design
          </h1>
          <p className="text-lg text-gray-600 dark:text-zinc-400">
            Modern, elegant book cards with smooth animations and interactive elements
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
          <BookCard book={sampleBook} />
          <BookCard book={sampleBook2} />
          <BookCard book={sampleBook3} />
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Smooth Animations</h3>
              <p className="text-sm text-gray-600 dark:text-zinc-400">
                700ms hover transitions with scale and image zoom effects
              </p>
            </div>
            <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Interactive Elements</h3>
              <p className="text-sm text-gray-600 dark:text-zinc-400">
                Download buttons, favorites, and audio play functionality
              </p>
            </div>
            <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Dark Mode Support</h3>
              <p className="text-sm text-gray-600 dark:text-zinc-400">
                Seamless dark/light mode with proper contrast ratios
              </p>
            </div>
            <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Responsive Design</h3>
              <p className="text-sm text-gray-600 dark:text-zinc-400">
                Adapts beautifully to all screen sizes and devices
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { DemoBookCard };
