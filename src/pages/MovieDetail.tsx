import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Box,
  Paper,
  Chip,
  CircularProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getMovieDetails } from '../services/api';
import { MovieDetail as MovieDetailType } from '../types/Movie';
import ErrorMessage from '../components/ErrorMessage';

const MovieDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<MovieDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const data = await getMovieDetails(id);
        setMovie(data);
        setError(null);
      } catch (err) {
        setError('Failed to load movie details');
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [id]);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: '#141414',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !movie) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <ErrorMessage message={error || 'Movie not found'} />
      </Container>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#141414',
        color: 'white',
        padding: { xs: '32px 16px 40px', md: '48px 24px 56px' },
      }}
    >
      <Container maxWidth="lg">
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            color: 'white',
            textDecoration: 'none',
            marginBottom: 3,
          }}
        >
          <ArrowBackIcon sx={{ marginRight: 1 }} />
          Back to Search
        </Link>

        <Grid container spacing={{ xs: 3, md: 4 }} alignItems="flex-start">
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                overflow: 'hidden',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
              }}
            >
              <img
                src={movie.Poster !== 'N/A' ? movie.Poster : '/movie-placeholder.svg'}
                alt={movie.Title}
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                }}
              />
            </Paper>
          </Grid>

          <Grid item xs={12} md={8}>
            <Typography
              variant="h3"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 'bold',
              }}
            >
              {movie.Title}
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
              <Chip
                label={movie.Year}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                }}
              />
              <Chip
                label={movie.Type}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  textTransform: 'capitalize',
                }}
              />
              {movie.imdbRating !== 'N/A' && (
                <Chip
                  label={`IMDb: ${movie.imdbRating}`}
                  sx={{
                    backgroundColor: '#f5c518',
                    color: 'black',
                  }}
                />
              )}
            </Box>

            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Plot
            </Typography>
            <Typography paragraph>{movie.Plot}</Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="text.secondary">
                  Director
                </Typography>
                <Typography paragraph>{movie.Director}</Typography>

                <Typography variant="subtitle1" color="text.secondary">
                  Writers
                </Typography>
                <Typography paragraph>{movie.Writer}</Typography>

                <Typography variant="subtitle1" color="text.secondary">
                  Stars
                </Typography>
                <Typography paragraph>{movie.Actors}</Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="text.secondary">
                  Genre
                </Typography>
                <Typography paragraph>{movie.Genre}</Typography>

                <Typography variant="subtitle1" color="text.secondary">
                  Runtime
                </Typography>
                <Typography paragraph>{movie.Runtime}</Typography>

                <Typography variant="subtitle1" color="text.secondary">
                  Released
                </Typography>
                <Typography paragraph>{movie.Released}</Typography>

                <Typography variant="subtitle1" color="text.secondary">
                  Language
                </Typography>
                <Typography paragraph>{movie.Language}</Typography>

                <Typography variant="subtitle1" color="text.secondary">
                  Country
                </Typography>
                <Typography paragraph>{movie.Country}</Typography>
              </Grid>
            </Grid>

            {movie.Awards !== 'N/A' && (
              <>
                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  Awards
                </Typography>
                <Typography paragraph>{movie.Awards}</Typography>
              </>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default MovieDetail; 