import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/BetterAuthContext';
import AuthModal from './AuthModal';
import UserAvatar from './UserAvatar';
import { LogIn, User, LogOut, Crown, ExternalLink } from 'lucide-react';

const MobileHeader = () => {
    const [open, setOpen] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const navigate = useNavigate();
    const { user, isAdmin, logout } = useAuth();

    const handleLogout = () => {
        logout();
        setShowUserMenu(false);
    };

    return (
        <>
            <nav className="flex items-center gap-6 px-6 md:px-8 lg:px-10 xl:px-12 pb-4 pt-[calc(env(safe-area-inset-top,0px)+1rem)] md:py-4 border-b border-gray-700/50 bg-gray-900/95 backdrop-blur-xl relative transition-all sticky top-0 z-50 md:ml-60 lg:ml-80 md:w-[calc(100%-15rem)] lg:w-[calc(100%-20rem)]">
                
                {/* Logo */}
                <Link to="/" className="flex items-center gap-3 flex-shrink-0">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                        <img
                            src="https://i.ibb.co/5W2jJ7qT/Untitled-design-10.png"
                            alt="Pneuma Logo"
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <div className="hidden xl:block">
                        <h1 className="text-xl font-bold text-white">Pneuma</h1>
                        <p className="text-xs text-gray-400 font-medium">BookStore</p>
                    </div>
                </Link>

                {/* Navigation Links - Desktop - Only show on large screens (1024px+) */}
                <div className="hidden lg:flex items-center justify-center gap-4 xl:gap-8 flex-1 min-w-0">
                    {/* Navigation removed */}
                </div>

                {/* Desktop Menu - Only show on large screens (1024px+) */}
                <div className="hidden lg:flex items-center gap-6 flex-shrink-0">
                    {/* Search Bar */}
                    <div className="hidden 2xl:flex items-center text-sm gap-2 border border-gray-700/50 px-3 rounded-full bg-gray-800/50">
                        <input 
                            className="py-1.5 w-full bg-transparent outline-none placeholder-gray-500 text-gray-300" 
                            type="text" 
                            placeholder="Search books" 
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && e.target.value.trim()) {
                                    navigate(`/search?q=${encodeURIComponent(e.target.value)}`);
                                }
                            }}
                        />
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10.836 10.615 15 14.695" stroke="#9CA3AF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                            <path clipRule="evenodd" d="M9.141 11.738c2.729-1.136 4.001-4.224 2.841-6.898S7.67.921 4.942 2.057C2.211 3.193.94 6.281 2.1 8.955s4.312 3.92 7.041 2.783" stroke="#9CA3AF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>

                    {/* User Section */}
                    {user ? (
                        <div className="relative">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
                            >
                                <div className="relative">
                                    <UserAvatar user={user} size="sm" />
                                    {isAdmin && (
                                        <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-yellow-500 rounded-full flex items-center justify-center">
                                            <Crown className="w-2 h-2 text-white" />
                                        </div>
                                    )}
                                </div>
                                <span className="text-white font-medium text-sm max-w-[80px] truncate">
                                    {user.name?.split(' ')[0] || 'User'}
                                </span>
                            </button>

                            {/* User Dropdown Menu */}
                            {showUserMenu && (
                                <>
                                    <div className="absolute right-0 top-full mt-2 w-56 bg-gray-800/95 backdrop-blur-xl rounded-xl border border-gray-700/50 shadow-2xl overflow-hidden">
                                        <div className="p-4 border-b border-gray-700/50">
                                            <p className="text-white font-medium">{user.name || user.email}</p>
                                            <p className="text-xs text-gray-400">{user.email}</p>
                                            <div className="flex items-center gap-1 mt-1">
                                                <Crown className="w-3 h-3 text-green-400" />
                                                <span className="text-xs text-green-400">
                                                    {isAdmin ? 'Admin' : 'Member'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-2">
                                            {isAdmin && (
                                                <Link
                                                    to="/admin"
                                                    className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                                                    onClick={() => setShowUserMenu(false)}
                                                >
                                                    <Crown className="w-4 h-4" />
                                                    <span>Admin Dashboard</span>
                                                </Link>
                                            )}

                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center gap-2 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-gray-700/50 rounded-lg transition-colors w-full text-left"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                <span>Sign Out</span>
                                            </button>
                                        </div>
                                    </div>
                                    {/* Backdrop */}
                                    <div
                                        className="fixed inset-0 z-[-1]"
                                        onClick={() => setShowUserMenu(false)}
                                    />
                                </>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowAuthModal(true)}
                            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-full font-medium hover:from-green-700 hover:to-green-600 transition-all duration-200"
                        >
                            <LogIn className="w-4 h-4" />
                            <span>Sign In</span>
                        </button>
                    )}
                </div>

                {/* Mobile Menu Button - Show below 1024px */}
                <button 
                    onClick={() => setOpen(!open)} 
                    aria-label="Menu" 
                    className="lg:hidden ml-auto"
                >
                    <svg width="21" height="15" viewBox="0 0 21 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="21" height="1.5" rx=".75" fill="#9CA3AF" />
                        <rect x="8" y="6" width="13" height="1.5" rx=".75" fill="#9CA3AF" />
                        <rect x="6" y="13" width="15" height="1.5" rx=".75" fill="#9CA3AF" />
                    </svg>
                </button>

                {/* Mobile Menu - Solid background for readability */}
                <div className={`${open ? 'flex' : 'hidden'} absolute top-[60px] left-0 w-full bg-gray-900 border-b border-gray-700/50 shadow-2xl py-4 flex-col items-start gap-2 px-5 text-sm lg:hidden z-50`}>
                    {/* Mobile Search */}
                    <div className="w-full mb-2">
                        <input 
                            className="w-full py-2 px-3 bg-gray-800/50 border border-gray-700/50 rounded-lg outline-none placeholder-gray-500 text-gray-300" 
                            type="text" 
                            placeholder="Search books" 
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && e.target.value.trim()) {
                                    navigate(`/search?q=${encodeURIComponent(e.target.value)}`);
                                    setOpen(false);
                                }
                            }}
                        />
                    </div>

                    {/* Mobile Sign In Button */}
                    {!user && (
                        <button
                            onClick={() => {
                                setShowAuthModal(true);
                                setOpen(false);
                            }}
                            className="w-full flex items-center justify-center gap-2 px-6 py-2 mt-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-full font-medium"
                        >
                            <LogIn className="w-4 h-4" />
                            <span>Sign In</span>
                        </button>
                    )}

                    {/* Resources Links */}
                    <div className="w-full pt-4 mt-2 border-t border-gray-700/50 flex flex-col gap-2">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 px-1">
                            Resources
                        </p>
                        <a 
                            href="https://freedomexperienceministry.org/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-3 rounded-xl bg-gray-800/30 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                        >
                            <span className="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M3 21h18"/><path d="M5 21V7l8-4 8 4v14"/><path d="M17 21v-5.5a2.5 2.5 0 0 0-5 0V21"/><path d="M12 3a2.5 2.5 0 0 0 2.5 2.5"/></svg>
                                Church Website
                            </span>
                            <ExternalLink className="w-3 h-3 text-gray-500" />
                        </a>
                        <a 
                            href="https://christfaculty.org"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-3 rounded-xl bg-gray-800/30 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                        >
                            <span className="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                                Bible School
                            </span>
                            <ExternalLink className="w-3 h-3 text-gray-500" />
                        </a>
                    </div>
                </div>
            </nav>

            {/* Auth Modal */}
            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                defaultMode="login"
            />
        </>
    );
};

export default MobileHeader;
