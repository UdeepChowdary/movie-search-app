import React from 'react';
import { Grid, Typography, Box } from '@mui/material';
import { Movie } from '../types/Movie';
import MovieCard from './MovieCard';
import SkeletonLoader from './SkeletonLoader';

export interface MovieGridProps {
  movies: Movie[];
  loading?: boolean;
  onFavoriteToggle?: (movie: Movie, isFavorite: boolean) => void;
  onWatchLaterToggle?: (movie: Movie) => void;
  isFavorite?: (imdbID: string) => boolean;
  isInWatchLater?: (imdbID: string) => boolean;
  showWatchLater?: boolean;
}

const MovieGrid: React.FC<MovieGridProps> = ({ 
  movies, 
  loading = false, 
  onFavoriteToggle, 
  onWatchLaterToggle,
  isFavorite,
  isInWatchLater,
  showWatchLater = true
}) => {
  if (loading) {
    return (
      <Box sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          {[...Array(8)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <SkeletonLoader />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (movies.length === 0) {
    return (
      <Box
        sx={{
          textAlign: 'center',
          py: 6,
          color: 'rgba(255, 255, 255, 0.7)',
        }}
      >
        <Typography variant="h6" sx={{ mb: 1 }}>
          No movies found
        </Typography>
        <Typography variant="body2">
          Try a different search term or adjust your filters.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Grid container spacing={3}>
        {movies.map((movie) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={movie.imdbID}>
            <MovieCard 
              movie={movie} 
              onFavoriteToggle={onFavoriteToggle}
              onWatchLaterToggle={onWatchLaterToggle}
              isFavorite={isFavorite ? isFavorite(movie.imdbID) : false}
              isInWatchLater={isInWatchLater ? isInWatchLater(movie.imdbID) : false}
              showWatchLater={showWatchLater}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default MovieGrid;