import React from 'react';
import { Grid, Typography, Box } from '@mui/material';
import { Movie } from '../types/Movie';
import MovieCard from './MovieCard';
import SkeletonLoader from './SkeletonLoader';

export interface MovieGridProps {
  movies: Movie[];
  loading?: boolean;
  onFavoriteToggle?: (imdbID: string, isFavorite: boolean) => void;
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
      <Grid container spacing={3}>
        {[...Array(8)].map((_, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
            <SkeletonLoader />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (movies.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="text.secondary" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          No movies found
        </Typography>
      </Box>
    );
  }

  return (
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
  );
};

export default MovieGrid; 