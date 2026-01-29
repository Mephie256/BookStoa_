import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import BookCard from '../components/BookCard';
import LoaderOne from '../components/ui/loader-one';
import { booksApi } from '../services/newApi';
import { useAudio } from '../contexts/AudioContext';
import { Aurora } from '../components/ui/aurora';

const Home = () => {
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  // Removed mock books - now using only API data

  // Removed exclusive book - now using only API data

  useEffect(() => {
    const loadBooks = async () => {
      setIsLoading(true);
      try {
        console.log('📚 Loading books from API...');
        const response = await booksApi.getAll();
        const apiBooks = response.books || response || [];
        console.log('📚 API returned:', apiBooks.length, 'books');

        // Use API books (even if empty)
        setBooks(apiBooks);
        console.log('📚 Loaded', apiBooks.length, 'books from API');
      } catch (error) {
        console.error('❌ Error loading books:', error);
        console.log('📚 Error loading from API, showing empty state');
        setBooks([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadBooks();
  }, []);

  const filteredBooks = books;

  return (
    <div className="min-h-[100dvh] bg-gray-900 relative overflow-hidden">
      {/* Dark Aurora Background - Full Coverage */}
      <div className="fixed inset-0 w-full h-full opacity-50 z-0">
        <Aurora
          colorStops={["#0d8a2f", "#1f2937", "#11b53f"]}
          blend={0.4}
          amplitude={0.6}
          speed={0.12}
          className="w-full h-full"
        />
      </div>

      {/* Dark overlay for better readability */}
      <div className="fixed inset-0 w-full h-full bg-gray-900/30 z-0"></div>



      <main data-scroll-container className="h-[100dvh] overflow-y-auto overflow-x-hidden relative z-20 md:ml-60 lg:ml-80 pb-32 md:pb-24">


        <div className="px-4 md:px-8 pt-24 md:pt-6 pb-6 space-y-12 relative z-20">

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="mb-4">
                  <LoaderOne />
                </div>
                <p className="text-gray-300">Loading amazing books...</p>
              </div>
            </div>
          )}

          {/* Main Content - Only show when not loading */}
          {!isLoading && (
            <>
              {/* Hero Section with Aurora Background - Updated Design */}
              <div data-gsap="fade-up" className="relative overflow-hidden rounded-3xl p-8 md:p-16 text-white min-h-[500px] flex flex-col justify-center items-center text-center md:text-left md:items-start">
                <style>{`
                    @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
                    .font-poppins { font-family: 'Poppins', sans-serif; }
                `}</style>

                {/* Dark Aurora Background */}
                <div className="absolute inset-0">
                  <Aurora
                    colorStops={["#0d8a2f", "#11b53f", "#16c946"]}
                    blend={0.7}
                    amplitude={1.2}
                    speed={0.25}
                    className="w-full h-full"
                  />
                </div>
                {/* Dark overlay for better text readability */}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"></div>

                <div className="relative z-10 w-full max-w-4xl mx-auto md:mx-0 font-poppins">
                    {/* Social Proof */}
                    <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
                        <div className="flex -space-x-3">
                            <img src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200" alt="User"
                                className="w-10 h-10 rounded-full border-2 border-green-900 hover:-translate-y-1 transition-transform z-10" />
                            <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200" alt="User"
                                className="w-10 h-10 rounded-full border-2 border-green-900 hover:-translate-y-1 transition-transform z-20" />
                            <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&h=200&auto=format&fit=crop"
                                alt="User"
                                className="w-10 h-10 rounded-full border-2 border-green-900 hover:-translate-y-1 transition-transform z-30" />
                        </div>
                        <div className="flex flex-col items-center md:items-start">
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <svg key={star} width="16" height="16" viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M5.85536 0.463527C6.00504 0.00287118 6.65674 0.00287028 6.80642 0.463526L7.82681 3.60397C7.89375 3.80998 8.08572 3.94946 8.30234 3.94946H11.6044C12.0888 3.94946 12.2901 4.56926 11.8983 4.85397L9.22687 6.79486C9.05162 6.92219 8.97829 7.14787 9.04523 7.35388L10.0656 10.4943C10.2153 10.955 9.68806 11.338 9.2962 11.0533L6.62478 9.11244C6.44954 8.98512 6.21224 8.98512 6.037 9.11244L3.36558 11.0533C2.97372 11.338 2.44648 10.955 2.59616 10.4943L3.61655 7.35388C3.68349 7.14787 3.61016 6.92219 3.43491 6.79486L0.763497 4.85397C0.37164 4.56927 0.573027 3.94946 1.05739 3.94946H4.35944C4.57606 3.94946 4.76803 3.80998 4.83497 3.60397L5.85536 0.463527Z" fill="#FBBF24"/>
                                    </svg>
                                ))}
                            </div>
                            <p className="text-sm text-gray-200">Trusted by 12k+ Readers</p>
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-green-50 to-green-100 text-transparent bg-clip-text leading-tight drop-shadow-sm">
                        Discover Life-Changing <br className="hidden md:block"/>Christian Literature
                    </h1>
                    
                    <p className="text-lg md:text-xl text-gray-100 mb-10 max-w-2xl leading-relaxed opacity-90">
                        Explore our curated collection of books that will inspire, challenge, and transform your faith journey today.
                    </p>

                    <button 
                        onClick={() => navigate('/books')}
                        className="px-10 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-full font-semibold text-lg transition-all shadow-[0_0_20px_rgba(22,201,70,0.2)] hover:shadow-[0_0_30px_rgba(22,201,70,0.4)] transform hover:-translate-y-1"
                    >
                        Browse Collection
                    </button>
                </div>
              </div>

          {/* Featured Book or Empty State */}
          <div data-gsap="fade-up">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Featured This Week</h2>
              <div className="flex gap-2">
                <button className="w-10 h-10 bg-gray-800/50 border border-gray-600 rounded-full flex items-center justify-center hover:bg-gray-700/50 transition-colors shadow-sm">
                  <ChevronLeft className="w-5 h-5 text-gray-300" />
                </button>
                <button className="w-10 h-10 bg-gray-800/50 border border-gray-600 rounded-full flex items-center justify-center hover:bg-gray-700/50 transition-colors shadow-sm">
                  <ChevronRight className="w-5 h-5 text-gray-300" />
                </button>
              </div>
            </div>

            {filteredBooks.length > 0 ? (
              <BookCard book={filteredBooks[0]} variant="featured" />
            ) : (
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 text-center border border-gray-700/50">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No Books Available</h3>
                <p className="text-gray-400 mb-6">The library is currently empty. Check back later for new additions!</p>
                <button
                  onClick={() => navigate('/admin/upload')}
                  className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
                >
                  Add First Book
                </button>
              </div>
            )}
          </div>

          {/* Popular Books */}
          <div data-gsap="fade-up">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Popular This Month</h2>
                <p className="text-gray-300">Most loved books by our community</p>
              </div>
              <div className="flex gap-2">
                <button className="w-10 h-10 bg-gray-800/50 border border-gray-600 rounded-full flex items-center justify-center hover:bg-gray-700/50 transition-colors shadow-sm">
                  <ChevronLeft className="w-5 h-5 text-gray-300" />
                </button>
                <button className="w-10 h-10 bg-gray-800/50 border border-gray-600 rounded-full flex items-center justify-center hover:bg-gray-700/50 transition-colors shadow-sm">
                  <ChevronRight className="w-5 h-5 text-gray-300" />
                </button>
              </div>
            </div>

            {/* Responsive grid: 2 columns mobile, 3 tablet, 4 desktop */}
            <div className="grid grid-cols-1 min-[420px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 justify-items-stretch">
              {filteredBooks.length > 1 ? (
                filteredBooks.slice(1, 6).map((book) => (
                  <BookCard key={book.id} book={book} />
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-400">No additional books to display</p>
                </div>
              )}
            </div>
          </div>

          {/* Recently Added */}
          <div data-gsap="fade-up">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Recently Added</h2>
                <p className="text-gray-300">Fresh additions to our library</p>
              </div>
              <button
                onClick={() => navigate('/books')}
                className="font-semibold transition-colors hover:opacity-80"
                style={{color: '#11b53f'}}
              >
                View All →
              </button>
            </div>

            {/* Show recent books - if we have enough, show slice, otherwise show all */}
            <div className="grid grid-cols-1 min-[420px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 justify-items-stretch">
              {filteredBooks.length > 6 ? (
                // If we have more than 6 books, show the last 5 (most recent)
                filteredBooks.slice(-5).reverse().map((book) => (
                  <BookCard key={`recent-${book.id}`} book={book} />
                ))
              ) : (
                // If we have 6 or fewer books, show all except the first one (featured)
                filteredBooks.slice(1).map((book) => (
                  <BookCard key={`recent-${book.id}`} book={book} />
                ))
              )}
            </div>

            {/* Show message if no books */}
            {filteredBooks.length <= 1 && (
              <div className="text-center py-8">
                <p className="text-gray-400">No recent books available</p>
              </div>
            )}
          </div>

          {/* Categories */}
          <div data-gsap="fade-up">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Browse by Category</h2>
              <p className="text-gray-300">Discover books by your favorite genres</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {['Christian Living', 'Devotional', 'Theology', 'Apologetics'].map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    console.log('🏷️ Category clicked:', category);
                    navigate(`/search?q=${encodeURIComponent(category)}`);
                  }}
                  className="group cursor-pointer text-left"
                >
                  <div className="rounded-xl md:rounded-2xl p-4 md:p-6 text-white hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl border border-gray-700/30 hover:border-green-500/50 hover:shadow-green-500/10">
                    <h3 className="font-bold text-sm md:text-lg mb-1 md:mb-2 text-green-400 leading-tight">{category}</h3>
                    <p className="text-gray-400 text-xs md:text-sm font-medium">
                      {filteredBooks.filter(book =>
                        book.genre === category ||
                        book.category === category ||
                        book.tags?.includes(category)
                      ).length} books
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
          </>
          )}
        </div>
      </main>


    </div>
  );
};

export default Home;
