import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Clock, TrendingUp, Book, User, Tag, ArrowUpRight } from 'lucide-react';
import { booksApi } from '../services/newApi';
import Spinner from './ui/Spinner';

const GoogleStyleSearch = ({
  placeholder = "Search books, authors, genres...",
  initialValue = "",
  onSearch,
  className = "",
  variant = "desktop" // desktop, mobile, header
}) => {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState([]);
  const [trending, setTrending] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState([]);

  const navigate = useNavigate();
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);

  // Load recent searches and trending on mount
  useEffect(() => {
    const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    setRecentSearches(recent.slice(0, 5));

    // Load trending searches
    booksApi.getTrendingSearches().then(response => {
      if (response.success) {
        setTrending(response.trending);
      }
    });

    // Auto-focus on mobile variant
    if (variant === 'mobile' && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
        setIsOpen(true);
      }, 100);
    }
  }, [variant]);

  // Debounced suggestions fetch
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.length >= 2) {
      setLoading(true);
      debounceRef.current = setTimeout(async () => {
        try {
          const response = await booksApi.getSuggestions(query);
          if (response.success) {
            setSuggestions(response.suggestions);
          }
        } catch (error) {
          console.error('Error fetching suggestions:', error);
        } finally {
          setLoading(false);
        }
      }, 300);
    } else {
      setSuggestions([]);
      setLoading(false);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      const totalItems = suggestions.length + (query.length < 2 ? trending.length + recentSearches.length : 0);

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % totalItems);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => prev <= 0 ? totalItems - 1 : prev - 1);
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0) {
            handleSuggestionClick(getAllItems()[selectedIndex]);
          } else {
            handleSearch(query);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          setSelectedIndex(-1);
          inputRef.current?.blur();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, suggestions, trending, recentSearches, query]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getAllItems = () => {
    if (query.length >= 2) {
      return suggestions;
    }
    return [
      ...recentSearches.map(search => ({ text: search, type: 'recent' })),
      ...trending.map(trend => ({ text: trend, type: 'trending' }))
    ];
  };

  const handleSearch = (searchQuery) => {
    const finalQuery = searchQuery || query;
    if (!finalQuery.trim()) return;

    console.log('🔍 GoogleStyleSearch handleSearch called:', finalQuery);

    // Save to recent searches
    const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    const updated = [finalQuery, ...recent.filter(s => s !== finalQuery)].slice(0, 10);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
    setRecentSearches(updated.slice(0, 5));

    // Close dropdown
    setIsOpen(false);
    setSelectedIndex(-1);

    // Navigate or callback
    if (onSearch) {
      console.log('🔍 Calling onSearch callback:', finalQuery);
      onSearch(finalQuery);
    } else {
      console.log('🔍 Navigating to search page:', finalQuery);
      navigate(`/search?q=${encodeURIComponent(finalQuery)}`);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    if (suggestion.type === 'book') {
      navigate(`/book/${suggestion.id}`);
    } else {
      handleSearch(suggestion.text);
    }
  };

  const clearQuery = () => {
    setQuery('');
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const getIcon = (type) => {
    switch (type) {
      case 'book': return <Book className="w-4 h-4" />;
      case 'author': return <User className="w-4 h-4" />;
      case 'genre': return <Tag className="w-4 h-4" />;
      case 'recent': return <Clock className="w-4 h-4" />;
      case 'trending': return <TrendingUp className="w-4 h-4" />;
      default: return <Search className="w-4 h-4" />;
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'mobile':
        return {
          container: "relative w-full",
          input: "w-full h-12 pl-12 pr-10 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200",
          dropdown: "absolute top-full left-0 right-0 mt-2 bg-gray-800/95 backdrop-blur-xl rounded-xl border border-gray-700/50 shadow-2xl z-50 max-h-80 overflow-y-auto"
        };
      case 'header':
        return {
          container: "relative w-full max-w-md",
          input: "w-full h-10 pl-10 pr-8 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200",
          dropdown: "absolute top-full left-0 right-0 mt-2 bg-gray-800/95 backdrop-blur-xl rounded-xl border border-gray-700/50 shadow-2xl z-50 max-h-80 overflow-y-auto"
        };
      default: // desktop
        return {
          container: "relative w-full max-w-2xl mx-auto",
          input: "w-full h-14 pl-14 pr-12 bg-gray-800/50 border border-gray-600/50 rounded-2xl text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 text-lg",
          dropdown: "absolute top-full left-0 right-0 mt-3 bg-gray-800/95 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-2xl z-50 max-h-96 overflow-y-auto"
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className={`${styles.container} ${className}`} ref={dropdownRef}>
      {/* Search Input */}
      <div className="relative">
        <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 ${
          variant === 'header' ? 'w-4 h-4' : variant === 'mobile' ? 'w-5 h-5' : 'w-6 h-6'
        }`} />

        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSearch(query);
            }
          }}
          className={styles.input}
          autoComplete="off"
        />

        {query && (
          <button
            onClick={clearQuery}
            className={`absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors ${
              variant === 'header' ? 'w-4 h-4' : 'w-5 h-5'
            }`}
          >
            <X className="w-full h-full" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className={styles.dropdown}>
          {loading && (
            <div className="p-4 text-center">
              <Spinner size="sm" color="green" />
              <span className="ml-2 text-gray-400 text-sm">Searching...</span>
            </div>
          )}

          {!loading && (
            <>
              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="p-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={`suggestion-${index}`}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg text-left hover:bg-gray-700/50 transition-colors ${
                        selectedIndex === index ? 'bg-gray-700/50' : ''
                      }`}
                    >
                      <div className="text-gray-400">
                        {getIcon(suggestion.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium truncate">
                          {suggestion.text}
                        </div>
                        {suggestion.author && (
                          <div className="text-gray-400 text-sm truncate">
                            by {suggestion.author}
                          </div>
                        )}
                      </div>
                      {suggestion.type === 'book' && (
                        <ArrowUpRight className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Recent & Trending (when no query) */}
              {query.length < 2 && (
                <>
                  {recentSearches.length > 0 && (
                    <div className="p-2 border-b border-gray-700/50">
                      <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Recent Searches
                      </div>
                      {recentSearches.map((search, index) => (
                        <button
                          key={`recent-${index}`}
                          onClick={() => handleSearch(search)}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg text-left hover:bg-gray-700/50 transition-colors ${
                            selectedIndex === index ? 'bg-gray-700/50' : ''
                          }`}
                        >
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-white">{search}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {trending.length > 0 && (
                    <div className="p-2">
                      <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Trending Searches
                      </div>
                      {trending.map((trend, index) => (
                        <button
                          key={`trending-${index}`}
                          onClick={() => handleSearch(trend)}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg text-left hover:bg-gray-700/50 transition-colors ${
                            selectedIndex === (recentSearches.length + index) ? 'bg-gray-700/50' : ''
                          }`}
                        >
                          <TrendingUp className="w-4 h-4 text-green-400" />
                          <span className="text-white">{trend}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* No results */}
              {!loading && query.length >= 2 && suggestions.length === 0 && (
                <div className="p-4 text-center text-gray-400">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No suggestions found</p>
                  <p className="text-sm mt-1">Press Enter to search anyway</p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default GoogleStyleSearch;
