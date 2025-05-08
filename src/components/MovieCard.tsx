import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardMedia, Typography, Box } from '@mui/material';
import { Movie } from '../types/Movie';

interface MovieCardProps {
  movie: Movie;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  return (
    <Link to={`/movie/${movie.imdbID}`} style={{ textDecoration: 'none' }}>
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          },
        }}
      >
        <CardMedia
          component="img"
          height="300"
          image={movie.Poster !== 'N/A' ? movie.Poster : '/movie-placeholder.svg'}
          alt={movie.Title}
          sx={{
            objectFit: 'cover',
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
          }}
        />
        <CardContent sx={{ flexGrow: 1, color: 'white' }}>
          <Typography
            gutterBottom
            variant="h6"
            component="div"
            sx={{
              fontWeight: 'bold',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {movie.Title}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              {movie.Year}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                backgroundColor: 'primary.main',
                color: 'white',
                padding: '2px 8px',
                borderRadius: '4px',
                textTransform: 'capitalize',
              }}
            >
              {movie.Type}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Link>
  );
};

export default MovieCard; 