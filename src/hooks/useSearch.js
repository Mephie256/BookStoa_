import { useState, useEffect, useCallback } from 'react';
import { booksApi } from '../services/newApi';

export const useSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Debounced search for suggestions
  const getSuggestions = useCallback(async (searchQuery) => {
    if (!searchQuery || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await booksApi.getSuggestions(searchQuery);
      if (response.success) {
        setSuggestions(response.suggestions);
      }
    } catch (err) {
      console.error('Error fetching suggestions:', err);
    }
  }, []);

  // Full search
  const search = useCallback(async (searchQuery, filters = {}) => {
    if (!searchQuery?.trim()) return;

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      console.log('🔍 Performing search:', searchQuery, filters);
      
      const response = await booksApi.search(searchQuery, filters);
      
      if (response.success) {
        setResults(response.books || []);
        
        // Save to search history
        const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
        const updatedHistory = [
          { query: searchQuery, timestamp: Date.now() },
          ...history.filter(h => h.query !== searchQuery)
        ].slice(0, 20);
        localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
      } else {
        setError(response.error || 'Search failed');
        setResults([]);
      }
    } catch (err) {
      console.error('❌ Search error:', err);
      setError(err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear search
  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setSuggestions([]);
    setError(null);
    setHasSearched(false);
  }, []);

  // Get search history
  const getSearchHistory = useCallback(() => {
    const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    return history.slice(0, 10).map(h => h.query);
  }, []);

  return {
    query,
    setQuery,
    results,
    suggestions,
    loading,
    error,
    hasSearched,
    search,
    getSuggestions,
    clearSearch,
    getSearchHistory
  };
};

export default useSearch;
