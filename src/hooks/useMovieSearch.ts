import { useState, useEffect, useCallback, useMemo } from 'react';
import debounce from 'lodash/debounce';
import { Movie } from '../types/Movie';
import { searchMovies, SearchOptions } from '../services/api';

interface UseMovieSearchReturn {
  movies: Movie[];
  loading: boolean;
  error: string | null;
  totalResults: number;
  currentPage: number;
  search: (query: string, page?: number, options?: SearchOptions) => void;
  changePage: (page: number) => void;
}

export const useMovieSearch = (): UseMovieSearchReturn => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOptions, setSearchOptions] = useState<SearchOptions>({});

  const handleSearch = useCallback(async (query: string, page: number = 1, options: SearchOptions = {}) => {
    if (!query.trim()) {
      setMovies([]);
      setTotalResults(0);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await searchMovies(query, page, options);
      
      if (response.Response === 'True') {
        setMovies(response.Search || []);
        setTotalResults(parseInt(response.totalResults) || 0);
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
  }, [setMovies, setTotalResults, setError, setLoading]);

  const debouncedSearch = useMemo(() => 
    debounce((query: string, page: number, options: SearchOptions) => {
      handleSearch(query, page, options);
    }, 500),
    [handleSearch]
  );

  const search = useCallback((query: string, page: number = 1, options: SearchOptions = {}) => {
    setSearchQuery(query);
    setCurrentPage(page);
    setSearchOptions(options);
    debouncedSearch(query, page, options);
  }, [debouncedSearch, setSearchQuery, setCurrentPage, setSearchOptions]);

  const changePage = useCallback((page: number) => {
    setCurrentPage(page);
    handleSearch(searchQuery, page, searchOptions);
  }, [searchQuery, searchOptions, handleSearch, setCurrentPage]);

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