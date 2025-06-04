import { useState, useCallback } from 'react';
import { getMovieDetails } from '../services/api';
import { MovieDetail } from '../types/Movie';

interface UseMovieDetailReturn {
  movie: MovieDetail | null;
  loading: boolean;
  error: string | null;
  fetchMovieDetails: (imdbID: string) => Promise<void>;
}

export const useMovieDetail = (): UseMovieDetailReturn => {
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMovieDetails = useCallback(async (imdbID: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await getMovieDetails(imdbID);
      
      if (response.Response === 'True') {
        setMovie(response);
        setError(null);
      } else {
        setMovie(null);
        setError(response.Error || 'Movie details not found');
      }
    } catch (err) {
      setMovie(null);
      setError('An error occurred while fetching movie details');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    movie,
    loading,
    error,
    fetchMovieDetails,
  };
}; 