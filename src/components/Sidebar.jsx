import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  BookOpen,
  Heart,
  Download,
  Search,
  Settings,
  User,
  Library,
  Crown,
  Sparkles,
  LogIn,
  LogOut,
  Book
} from 'lucide-react';
import MobileAudioPlayer from './MobileAudioPlayer';
import AuthModal from './AuthModal';
import UserAvatar from './UserAvatar';

import { useAuth } from '../contexts/BetterAuthContext';

const Sidebar = () => {
  const location = useLocation();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const { user, isAdmin, loading, logout } = useAuth();

  const navigationItems = [
    { icon: Home, label: 'Discover', path: '/', badge: null },
    { icon: Search, label: 'Search', path: '/search', badge: null },
    { icon: Book, label: 'All Books', path: '/books', badge: null },
    { icon: Library, label: 'My Library', path: '/library', badge: null },
    { icon: Heart, label: 'Favorites', path: '/favorites', badge: null },
    { icon: Download, label: 'Downloads', path: '/downloads', badge: null },
  ];

  // Mobile navigation items (without search since it's in header)
  const mobileNavigationItems = [
    { icon: Home, label: 'Home', path: '/', badge: null },
    { icon: Library, label: 'Library', path: '/library', badge: null },
    { icon: Heart, label: 'Favorites', path: '/favorites', badge: null },
    { icon: Download, label: 'Downloads', path: '/downloads', badge: null },
  ];



  return (
    <>
      {/* Desktop/Tablet Sidebar - Hidden on mobile */}
      <aside className="hidden md:flex md:w-60 lg:w-80 bg-gray-900/90 backdrop-blur-xl border-r border-gray-700/50 flex-col h-screen fixed left-0 top-0 bottom-0 z-40 shadow-2xl">
      {/* Subtle Aurora overlay for sidebar */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="w-full h-full bg-gradient-to-b from-green-900/20 via-transparent to-green-800/10"></div>
      </div>

      {/* User Profile Section - Only show if logged in */}
      {user && (
        <div className="relative z-10 p-6 border-b border-gray-700/50">
          <div className="flex items-center gap-3 p-3 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50">
            <div className="relative">
              <UserAvatar user={user} size="md" />
              {isAdmin && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                  <Crown className="w-2.5 h-2.5 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white truncate">{user.name || user.email}</h3>
              <div className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-green-400" />
                <span className="text-xs font-semibold text-green-400">
                  {isAdmin ? 'Admin' : 'Member'}
                </span>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-2 text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-gray-700/50"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="relative z-10 flex-1 px-4 py-6">
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'text-white shadow-lg bg-gradient-to-r from-green-600 to-green-500'
                    : 'text-gray-300 hover:bg-gray-800/50 hover:text-white backdrop-blur-sm'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-gray-400'
                  }`} />
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-green-600 text-white'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Admin Section */}
        {isAdmin && (
          <div className="mt-8 pt-6 border-t border-gray-700/50">
            <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Admin
            </p>
            <Link
              to="/admin"
              className="group flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-gray-800/50 hover:text-white transition-all duration-200 backdrop-blur-sm"
            >
              <Settings className="w-5 h-5 text-gray-400 transition-transform group-hover:scale-110 group-hover:rotate-90" />
              <span className="font-medium">Dashboard</span>
            </Link>
          </div>
        )}
      </nav>


    </aside>

    {/* Mobile Audio Player */}
    <MobileAudioPlayer />

    {/* Mobile Bottom Navigation */}
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-xl border-t border-gray-700/50 pb-[env(safe-area-inset-bottom,0px)]">
      <div className="flex items-center justify-around py-2">
        {mobileNavigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-all duration-200 relative min-w-0 ${
                isActive
                  ? 'text-green-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-xs font-medium truncate max-w-[60px] leading-tight">
                {item.label}
              </span>
              {item.badge && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{item.badge}</span>
                </div>
              )}
            </Link>
          );
        })}


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

export default Sidebar;
