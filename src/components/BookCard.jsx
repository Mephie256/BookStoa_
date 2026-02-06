import React from 'react';
import { Link } from 'react-router-dom';
import { DollarSign } from 'lucide-react';

const BookCard = ({ book }) => {
    // Get cover image URL
    const getCoverUrl = () => {
        return book.cover_file_url ||
               book.coverFileUrl ||
               book.coverUrl ||
               book.cover_url ||
               book.image_url ||
               book.thumbnail ||
               'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop&crop=center';
    };

    const coverUrl = getCoverUrl();
    const rating = book.rating || 4;
    const price = Number(book.price || 0);
    const isFree =
        typeof book.is_free === 'boolean'
            ? book.is_free
            : typeof book.isFree === 'boolean'
                ? book.isFree
                : !(price > 0);

    // Format price in UGX
    const formatPrice = (amount) => {
        return new Intl.NumberFormat('en-UG', {
            style: 'currency',
            currency: 'UGX',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="border border-gray-700/30 rounded-md md:px-4 px-3 py-2 bg-gray-800/50 backdrop-blur-xl w-full min-w-0 overflow-hidden sm:hover:border-green-500/50 transition-all duration-300 relative">
            {/* Price Badge */}
            {!isFree && (
                <div className="absolute top-2 right-2 z-10 bg-green-600 text-white px-2 py-1 rounded-md text-xs font-semibold shadow-lg flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    {formatPrice(price)}
                </div>
            )}
            {isFree && (
                <div className="absolute top-2 right-2 z-10 bg-gray-700/90 text-green-400 px-2 py-1 rounded-md text-xs font-semibold shadow-lg">
                    FREE
                </div>
            )}
            
            <div className="group cursor-pointer flex items-center justify-center px-2">
                <Link to={`/book/${book.id}`}>
                    <img 
                        className="w-full max-w-[120px] md:max-w-[144px] h-auto object-contain sm:group-hover:scale-105 transition" 
                        src={coverUrl} 
                        alt={book.title} 
                    />
                </Link>
            </div>
            <div className="text-gray-400 text-sm">
                <p className="text-gray-500">{book.category || book.genre || 'General'}</p>
                <p className="text-white font-medium text-lg truncate w-full">{book.title}</p>
                <div className="flex items-center gap-0.5">
                    {Array(5).fill('').map((_, i) => (
                        rating > i ? (
                            <svg key={i} width="14" height="13" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8.049.927c.3-.921 1.603-.921 1.902 0l1.294 3.983a1 1 0 0 0 .951.69h4.188c.969 0 1.371 1.24.588 1.81l-3.388 2.46a1 1 0 0 0-.364 1.118l1.295 3.983c.299.921-.756 1.688-1.54 1.118L9.589 13.63a1 1 0 0 0-1.176 0l-3.389 2.46c-.783.57-1.838-.197-1.539-1.118L4.78 10.99a1 1 0 0 0-.363-1.118L1.028 7.41c-.783-.57-.38-1.81.588-1.81h4.188a1 1 0 0 0 .95-.69z" fill="#22c55e" />
                            </svg>
                        ) : (
                            <svg key={i} width="14" height="13" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8.04894 0.927049C8.3483 0.00573802 9.6517 0.00574017 9.95106 0.927051L11.2451 4.90983C11.379 5.32185 11.763 5.60081 12.1962 5.60081H16.3839C17.3527 5.60081 17.7554 6.84043 16.9717 7.40983L13.5838 9.87132C13.2333 10.126 13.0866 10.5773 13.2205 10.9894L14.5146 14.9721C14.8139 15.8934 13.7595 16.6596 12.9757 16.0902L9.58778 13.6287C9.2373 13.374 8.7627 13.374 8.41221 13.6287L5.02426 16.0902C4.24054 16.6596 3.18607 15.8934 3.48542 14.9721L4.7795 10.9894C4.91338 10.5773 4.76672 10.126 4.41623 9.87132L1.02827 7.40983C0.244561 6.84043 0.647338 5.60081 1.61606 5.60081H5.8038C6.23703 5.60081 6.62099 5.32185 6.75486 4.90983L8.04894 0.927049Z" fill="#22c55e" fillOpacity="0.35" />
                            </svg>
                        )
                    ))}
                    <p className="text-gray-400">({rating})</p>
                </div>
                <div className="mt-3">
                    <Link
                        to={`/book/${book.id}`}
                        className="inline-flex items-center justify-center bg-green-600/20 border border-green-500/40 px-3 py-1.5 rounded text-green-400 font-medium hover:bg-green-600/30 transition-colors"
                    >
                        {isFree ? 'Read' : 'View'}
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default BookCard;
