import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, User, LogIn, LogOut, Crown, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/SimpleAuthContext';
import GoogleStyleSearch from './GoogleStyleSearch';
import AuthModal from './AuthModal';

const MobileHeader = ({ onSearch, searchTerm, setSearchTerm }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const { user, isAdmin, loading, logout } = useAuth();

  console.log('🔍 MobileHeader rendered, showSearchModal:', showSearchModal);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-40 bg-gray-900/95 backdrop-blur-xl border-b border-gray-700/50">
        <div className="flex items-center justify-between p-3">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img
              src="https://i.ibb.co/5W2jJ7qT/Untitled-design-10.png"
              alt="Pneuma"
              className="w-7 h-7 rounded-lg"
            />
            <h1 className="text-lg font-bold text-white">Pneuma</h1>
          </div>

          {/* User Section */}
          <div className="flex items-center gap-2">
            {/* Search Button */}
            <button
              onClick={() => {
                console.log('🔍 Mobile search button clicked, current state:', showSearchModal);
                setShowSearchModal(true);
                console.log('🔍 Setting showSearchModal to true');
              }}
              className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-700/50"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-gray-700/50 transition-colors"
                >
                  <div className="relative">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-white" />
                    </div>
                    {isAdmin && (
                      <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-yellow-500 rounded-full flex items-center justify-center">
                        <Crown className="w-1.5 h-1.5 text-white" />
                      </div>
                    )}
                  </div>
                  <span className="text-white font-medium text-sm max-w-[60px] truncate">
                    {user.name?.split(' ')[0] || 'User'}
                  </span>
                </button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-gray-800/95 backdrop-blur-xl rounded-xl border border-gray-700/50 shadow-2xl overflow-hidden">
                    <div className="p-3 border-b border-gray-700/50">
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
                        <a
                          href="/admin"
                          className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Crown className="w-4 h-4" />
                          <span>Admin Dashboard</span>
                        </a>
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
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg font-medium hover:from-green-700 hover:to-green-600 transition-all duration-200"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Backdrop for user menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm md:hidden"
          onClick={() => setShowUserMenu(false)}
        />
      )}

      {/* Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 bg-gray-900/95 backdrop-blur-xl" onClick={() => console.log('🔍 Modal backdrop clicked')}>
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
              <h2 className="text-lg font-semibold text-white">Search</h2>
              <button
                onClick={() => setShowSearchModal(false)}
                className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-700/50"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            {/* Search Content */}
            <div className="flex-1 p-4">
              <GoogleStyleSearch
                placeholder="Search books, authors, genres..."
                variant="mobile"
                onSearch={(query) => {
                  console.log('🔍 Mobile search triggered:', query);
                  setShowSearchModal(false);
                  // Force navigation to search page
                  window.location.href = `/search?q=${encodeURIComponent(query)}`;
                }}
                className="mb-6"
              />

              {/* Quick Actions */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    Quick Search
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {['Christian Living', 'Devotional', 'Theology', 'Prayer'].map((term) => (
                      <button
                        key={term}
                        onClick={() => {
                          console.log('🔍 Quick search clicked:', term);
                          setShowSearchModal(false);
                          // Force navigation
                          setTimeout(() => {
                            window.location.href = `/search?q=${encodeURIComponent(term)}`;
                          }, 100);
                        }}
                        className="p-3 bg-gray-800/50 rounded-xl text-left hover:bg-gray-700/50 transition-colors"
                      >
                        <span className="text-white font-medium">{term}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
