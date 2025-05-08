import { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';
import { Movie } from '../types/Movie';
import { searchMovies } from '../services/api';

interface UseMovieSearchReturn {
  movies: Movie[];
  loading: boolean;
  error: string | null;
  totalResults: number;
  currentPage: number;
  search: (query: string) => void;
  changePage: (page: number) => void;
}

export const useMovieSearch = (): UseMovieSearchReturn => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = useCallback(async (query: string, page: number = 1) => {
    if (!query.trim()) {
      setMovies([]);
      setTotalResults(0);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await searchMovies(query, page);
      
      if (response.Response === 'True') {
        setMovies(response.Search);
        setTotalResults(parseInt(response.totalResults));
        setError(null);
      } else {
        setMovies([]);
        setTotalResults(0);
        setError(response.Error || 'No movies found');
      }
    } catch (err) {
      setMovies([]);
      setTotalResults(0);
      setError('An error occurred while searching for movies');
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setCurrentPage(1);
      handleSearch(query, 1);
    }, 500),
    [handleSearch]
  );

  const search = useCallback((query: string) => {
    setSearchQuery(query);
    debouncedSearch(query);
  }, [debouncedSearch]);

  const changePage = useCallback((page: number) => {
    setCurrentPage(page);
    handleSearch(searchQuery, page);
  }, [searchQuery, handleSearch]);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  return {
    movies,
    loading,
    error,
    totalResults,
    currentPage,
    search,
    changePage,
  };
}; 