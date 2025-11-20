import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Box, 
  IconButton, 
  Tooltip, 
  Chip, 
  Stack 
} from '@mui/material';
import { 
  Favorite, 
  FavoriteBorder, 
  Bookmark, 
  BookmarkBorder, 
  Tv, 
  Movie as MovieIcon 
} from '@mui/icons-material';
import { Movie } from '../types/Movie';

interface MovieCardProps {
  movie: Movie;
  onFavoriteToggle?: (movie: Movie, isFavorite: boolean) => void;
  onWatchLaterToggle?: (movie: Movie) => void;
  isFavorite?: boolean;
  isInWatchLater?: boolean;
  showWatchLater?: boolean;
}

const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  onFavoriteToggle,
  onWatchLaterToggle,
  isFavorite: propIsFavorite = false,
  isInWatchLater = false,
  showWatchLater = true
}) => {
  const [isFavorite, setIsFavorite] = useState(propIsFavorite);
  const [isInWatchLaterState, setIsInWatchLater] = useState(isInWatchLater);

  useEffect(() => {
    setIsFavorite(propIsFavorite);
  }, [propIsFavorite]);

  useEffect(() => {
    setIsInWatchLater(isInWatchLater);
  }, [isInWatchLater]);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newFavoriteState = !isFavorite;
    setIsFavorite(newFavoriteState);
    if (onFavoriteToggle) {
      onFavoriteToggle(movie, newFavoriteState);
    }
  };

  const handleWatchLaterClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onWatchLaterToggle) {
      onWatchLaterToggle(movie);
    }
  };

  return (
    <Link to={`/movie/${movie.imdbID}`} style={{ textDecoration: 'none' }}>
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          transition: 'transform 0.2s, box-shadow 0.2s',
          position: 'relative',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            '& .action-button': {
              opacity: 1,
            },
          },
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            display: 'flex',
            gap: 1,
            '& .action-button': {
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              color: 'white',
              opacity: 0.9,
              transition: 'opacity 0.2s, transform 0.2s, color 0.2s',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                transform: 'scale(1.1)',
                opacity: 1,
              },
            },
          }}
        >
          {showWatchLater && onWatchLaterToggle && (
            <Tooltip title={isInWatchLaterState ? 'Remove from Watch Later' : 'Add to Watch Later'}>
              <IconButton
                className="action-button"
                onClick={handleWatchLaterClick}
                sx={{
                  color: isInWatchLaterState ? '#4caf50' : 'white',
                }}
              >
                {isInWatchLaterState ? <Bookmark /> : <BookmarkBorder />}
              </IconButton>
            </Tooltip>
          )}
          {onFavoriteToggle && (
            <Tooltip title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
              <IconButton
                className="action-button"
                onClick={handleFavoriteClick}
                sx={{
                  color: isFavorite ? '#ff4081' : 'white',
                }}
              >
                {isFavorite ? <Favorite /> : <FavoriteBorder />}
              </IconButton>
            </Tooltip>
          )}
        </Box>
        <CardMedia
          component="img"
          height="300"
          image={movie.Poster !== 'N/A' ? movie.Poster : '/no-poster.png'}
          alt={movie.Title}
          sx={{
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
          }}
        />
        <CardContent sx={{ flexGrow: 1, p: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1, mb: 1 }}>
            <Typography variant="h6" component="h3" noWrap sx={{ flex: 1, fontWeight: 'bold' }}>
              {movie.Title}
            </Typography>
            {movie.Type && (
              <Chip
                size="small"
                icon={movie.Type === 'movie' ? <MovieIcon fontSize="small" /> : <Tv fontSize="small" />}
                label={movie.Type}
                color={movie.Type === 'movie' ? 'primary' : 'secondary'}
                sx={{ ml: 1, textTransform: 'capitalize' }}
              />
            )}
          </Box>
          <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap', gap: 0.5 }}>
            <Chip
              size="small"
              label={movie.Year}
              variant="outlined"
              sx={{ fontSize: '0.7rem' }}
            />
            {movie.Type === 'movie' && movie.Year && (
              <Chip
                size="small"
                label={`${new Date().getFullYear() - parseInt(movie.Year)} years ago`}
                variant="outlined"
                sx={{ fontSize: '0.7rem' }}
              />
            )}
          </Stack>
        </CardContent>
      </Card>
    </Link>
  );
};

export default MovieCard;