import { Star, Headphones, Play, BookOpen, FileText, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAudio } from '../contexts/AudioContext';
import { useAuth } from '../contexts/BetterAuthContext';
import AuthModal from './AuthModal';
import Spinner from './ui/Spinner';

const MobileBookCard = ({ book }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const { playTrack } = useAudio();
    const { user } = useAuth();
    const isAuthenticated = !!user;

    const handleImageLoad = () => setImageLoaded(true);
    const handleImageError = () => setImageError(true);

    const coverUrl = book.cover_file_url || book.coverUrl || book.cover_url ||
        'https://via.placeholder.com/300x400/11b53f/ffffff?text=📖';

    const rating = book.rating || 4;

    // Handle play button click
    const handlePlay = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            return;
        }

        if (book.audioLink || book.audio_link) {
            const audioTrack = {
                id: book.id,
                title: book.title,
                author: book.author,
                cover_file_url: book.cover_file_url || book.coverUrl || book.cover_url,
                audioLink: book.audioLink || book.audio_link,
                audio_link: book.audioLink || book.audio_link
            };

            console.log('🎵 Playing audio:', audioTrack);
            playTrack(audioTrack);
        } else {
            console.log('🎵 No audio available for this book');
        }
    };

    return (
        <>
            <div className="relative group h-full">
                <div className="bg-gray-800/95 backdrop-blur-xl rounded-2xl overflow-hidden shadow-xl border border-gray-700/30 transition-all duration-500 hover:shadow-2xl hover:shadow-green-500/20 hover:border-green-500/50 hover:scale-[1.02] h-full flex flex-col min-h-[420px] group-hover:bg-gray-800/98">
                    <Link to={`/book/${book.id}`} className="block">
                        {/* Cover Image Section */}
                        <div className="relative aspect-[3/4] overflow-hidden">
                            {!imageError ? (
                                <img
                                    src={coverUrl}
                                    alt={book.title}
                                    className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110 ${
                                        imageLoaded ? 'opacity-100' : 'opacity-0'
                                    }`}
                                    onLoad={handleImageLoad}
                                    onError={handleImageError}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
                                    <div className="text-center text-gray-400">
                                        <BookOpen className="w-16 h-16 mx-auto mb-2" />
                                        <div className="text-sm font-medium">No Cover</div>
                                    </div>
                                </div>
                            )}

                            {!imageLoaded && !imageError && (
                                <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                                    <Spinner size="lg" color="green" />
                                </div>
                            )}

                            {/* Dark Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent group-hover:from-black/95 transition-all duration-500"></div>

                            {/* Top Right Badges */}
                            <div className="absolute top-3 right-3 flex flex-col gap-2">
                                {(book.audioLink || book.audio_link) && (
                                    <div className="w-8 h-8 bg-green-600/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-green-500/90 transition-all duration-300 hover:scale-110">
                                        <Headphones className="w-4 h-4 text-white" />
                                    </div>
                                )}

                                {(book.pdf_file_url || book.pdfFileUrl || book.pdf_url) && (
                                    <div className="w-8 h-8 bg-blue-600/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-blue-500/90 transition-all duration-300 hover:scale-110">
                                        <FileText className="w-4 h-4 text-white" />
                                    </div>
                                )}
                            </div>

                            {/* Center Play Button (only show if audio available) */}
                            {(book.audioLink || book.audio_link) && (
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 bg-black/50 backdrop-blur-sm">
                                    {isAuthenticated ? (
                                        <button
                                            onClick={handlePlay}
                                            className="w-20 h-20 bg-gradient-to-br from-green-600 to-green-500 backdrop-blur-sm rounded-full flex items-center justify-center hover:from-green-500 hover:to-green-400 transition-all duration-300 shadow-2xl hover:shadow-green-500/50 hover:scale-110 border-2 border-white/20"
                                            title="Play Audio"
                                        >
                                            <Play className="w-10 h-10 text-white ml-1 drop-shadow-lg" />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => setShowAuthModal(true)}
                                            className="w-20 h-20 bg-gradient-to-br from-gray-600 to-gray-500 backdrop-blur-sm rounded-full flex items-center justify-center hover:from-gray-500 hover:to-gray-400 transition-all duration-300 shadow-2xl hover:scale-110 border-2 border-white/20"
                                            title="Sign in to listen"
                                        >
                                            <Lock className="w-10 h-10 text-white drop-shadow-lg" />
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Top Left Featured Badge */}
                            {book.featured && (
                                <div className="absolute top-3 left-3 px-3 py-1 bg-gradient-to-r from-orange-500 to-orange-400 text-white text-xs font-bold rounded-full shadow-lg">
                                    Featured
                                </div>
                            )}
                        </div>
                    </Link>

                    {/* Content Section */}
                    <div className="p-5 flex-1 flex flex-col justify-between bg-gradient-to-t from-gray-900/50 to-transparent">
                        {/* Title and Category */}
                        <div className="mb-3">
                            <p className="text-gray-400 text-xs mb-1">{book.category || book.genre || 'General'}</p>
                            <h3 className="font-medium text-white text-base line-clamp-2 leading-tight mb-1">
                                {book.title}
                            </h3>
                            
                            {/* Star Rating */}
                            <div className="flex items-center gap-0.5 mb-2">
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
                                <p className="text-gray-400 text-xs ml-1">({rating})</p>
                            </div>
                        </div>

                        <div className="mt-auto">
                            <Link
                                to={`/book/${book.id}`}
                                className="inline-flex items-center justify-center bg-green-600/20 border border-green-500/40 px-4 py-2 rounded text-green-400 font-medium hover:bg-green-600/30 transition-colors"
                            >
                                Read
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Auth Modal */}
            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                defaultMode="login"
            />
        </>
    );
};

export default MobileBookCard;
