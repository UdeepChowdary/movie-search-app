import React from 'react';
import { Grid, Typography, Box } from '@mui/material';
import { Movie } from '../types/Movie';
import MovieCard from './MovieCard';
import SkeletonLoader from './SkeletonLoader';

interface MovieGridProps {
  movies: Movie[];
  loading?: boolean;
}

const MovieGrid: React.FC<MovieGridProps> = ({ movies, loading = false }) => {
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
          <MovieCard movie={movie} />
        </Grid>
      ))}
    </Grid>
  );
};

export default MovieGrid; 