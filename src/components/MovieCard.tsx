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

  const yearsAgoText = movie.Type === 'movie' && movie.Year ? (() => {
    const year = parseInt(movie.Year);
    if (isNaN(year)) return null;
    const diff = new Date().getFullYear() - year;
    return diff >= 0 ? `${diff} years ago` : null;
  })() : null;

  return (
    <Link to={`/movie/${movie.imdbID}`} style={{ textDecoration: 'none' }}>
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'rgba(22, 26, 36, 0.4)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
          '&:hover': {
            transform: 'translateY(-8px) scale(1.025)',
            border: '1px solid rgba(255, 51, 102, 0.3)',
            boxShadow: '0 12px 30px rgba(255, 51, 102, 0.25)',
            '& .card-media-poster': {
              transform: 'scale(1.08)',
            },
            '& .action-button': {
              opacity: 1,
              transform: 'translateY(0)',
            },
          },
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            display: 'flex',
            gap: 1.2,
            zIndex: 10,
          }}
        >
          {showWatchLater && onWatchLaterToggle && (
            <Tooltip title={isInWatchLaterState ? 'Remove from Watch Later' : 'Add to Watch Later'}>
              <IconButton
                className="action-button"
                onClick={handleWatchLaterClick}
                sx={{
                  backgroundColor: 'rgba(8, 9, 12, 0.8)',
                  color: isInWatchLaterState ? '#00F2FE' : '#F3F4F6',
                  opacity: isInWatchLaterState ? 1 : 0,
                  transform: isInWatchLaterState ? 'translateY(0)' : 'translateY(-6px)',
                  border: isInWatchLaterState ? '1px solid rgba(0, 242, 254, 0.4)' : '1px solid rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(8px)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    backgroundColor: 'rgba(8, 9, 12, 0.95)',
                    color: '#00F2FE',
                    transform: 'scale(1.15)',
                    border: '1px solid #00F2FE',
                  },
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
                  backgroundColor: 'rgba(8, 9, 12, 0.8)',
                  color: isFavorite ? '#FF3366' : '#F3F4F6',
                  opacity: isFavorite ? 1 : 0,
                  transform: isFavorite ? 'translateY(0)' : 'translateY(-6px)',
                  border: isFavorite ? '1px solid rgba(255, 51, 102, 0.4)' : '1px solid rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(8px)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    backgroundColor: 'rgba(8, 9, 12, 0.95)',
                    color: '#FF3366',
                    transform: 'scale(1.15)',
                    border: '1px solid #FF3366',
                  },
                }}
              >
                {isFavorite ? <Favorite /> : <FavoriteBorder />}
              </IconButton>
            </Tooltip>
          )}
        </Box>
        <Box sx={{ position: 'relative', overflow: 'hidden', height: 320 }}>
          <CardMedia
            component="img"
            className="card-media-poster"
            image={movie.Poster !== 'N/A' ? movie.Poster : '/movie-placeholder.svg'}
            alt={movie.Title}
            sx={{
              height: '100%',
              width: '100%',
              objectFit: 'cover',
              backgroundColor: 'rgba(8, 9, 12, 0.4)',
              transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              height: '40%',
              background: 'linear-gradient(to top, rgba(8, 9, 12, 0.9) 0%, rgba(8, 9, 12, 0) 100%)',
              zIndex: 1,
            }}
          />
        </Box>
        <CardContent sx={{ flexGrow: 1, p: 2.5, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', '&:last-child': { pb: 2.5 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
            <Typography 
              variant="h6" 
              component="h3" 
              noWrap 
              sx={{ 
                flex: 1, 
                fontFamily: '"Outfit", sans-serif',
                fontWeight: 700,
                fontSize: '1.15rem',
                color: '#F3F4F6'
              }}
            >
              {movie.Title}
            </Typography>
            {movie.Type && (
              <Chip
                size="small"
                icon={movie.Type === 'movie' ? <MovieIcon fontSize="small" style={{ color: 'inherit' }} /> : <Tv fontSize="small" style={{ color: 'inherit' }} />}
                label={movie.Type}
                sx={{ 
                  ml: 1, 
                  textTransform: 'capitalize',
                  fontFamily: '"Outfit", sans-serif',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  borderRadius: '6px',
                  background: movie.Type === 'movie' 
                    ? 'linear-gradient(135deg, rgba(255, 51, 102, 0.15) 0%, rgba(255, 94, 54, 0.08) 100%)' 
                    : 'linear-gradient(135deg, rgba(0, 242, 254, 0.15) 0%, rgba(79, 172, 254, 0.08) 100%)',
                  border: movie.Type === 'movie' 
                    ? '1px solid rgba(255, 51, 102, 0.25)' 
                    : '1px solid rgba(0, 242, 254, 0.25)',
                  color: movie.Type === 'movie' ? '#FF5E36' : '#00F2FE',
                  '& .MuiChip-icon': {
                    color: 'inherit',
                  }
                }}
              />
            )}
          </Box>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            <Chip
              size="small"
              label={movie.Year}
              sx={{ 
                fontSize: '0.75rem', 
                fontFamily: '"Inter", sans-serif',
                fontWeight: 500,
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#9CA3AF',
                borderRadius: '6px'
              }}
            />
            {yearsAgoText && (
              <Chip
                size="small"
                label={yearsAgoText}
                sx={{ 
                  fontSize: '0.75rem', 
                  fontFamily: '"Inter", sans-serif',
                  fontWeight: 500,
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#9CA3AF',
                  borderRadius: '6px'
                }}
              />
            )}
          </Stack>
        </CardContent>
      </Card>
    </Link>
  );
};

export default MovieCard;