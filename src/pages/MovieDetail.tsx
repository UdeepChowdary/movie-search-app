import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Box,
  Paper,
  Chip,
  Button,
  Tooltip,
  Fade,
  IconButton,
  TextField,
  CircularProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  Favorite,
  FavoriteBorder,
  Bookmark,
  BookmarkBorder,
  Star,
  EmojiEvents,
  Schedule,
  Public,
  Language as LanguageIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useMovieDetail } from '../hooks/useMovieDetail';
import { useFavorites } from '../context/FavoritesContext';
import { useWatchLater } from '../context/WatchLaterContext';
import { useJournal } from '../context/JournalContext';
import { Movie } from '../types/Movie';
import { searchMovies } from '../services/api';
import ErrorMessage from '../components/ErrorMessage';

// Premium Rating Circle Gauge Component
interface RatingCircleProps {
  rating: number;
  max: number;
  label: string;
  sublabel: string;
  gradientStart: string;
  gradientEnd: string;
}

const RatingCircle: React.FC<RatingCircleProps> = ({
  rating,
  max,
  label,
  sublabel,
  gradientStart,
  gradientEnd,
}) => {
  const percentage = (rating / max) * 100;
  const strokeWidth = 8;
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const id = `gradient-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 2.2,
        borderRadius: '20px',
        backgroundColor: 'rgba(22, 26, 36, 0.4)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
        flex: '1 1 200px',
        minWidth: '220px',
      }}
    >
      <Box sx={{ position: 'relative', width: 76, height: 76, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <svg width="76" height="76" style={{ transform: 'rotate(-90deg)' }}>
          <defs>
            <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={gradientStart} />
              <stop offset="100%" stopColor={gradientEnd} />
            </linearGradient>
          </defs>
          {/* Background circle track */}
          <circle
            cx="38"
            cy="38"
            r={radius}
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth={strokeWidth}
          />
          {/* Active progress arc */}
          <circle
            cx="38"
            cy="38"
            r={radius}
            fill="transparent"
            stroke={`url(#${id})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0px 0px 6px ${gradientStart}50)`,
              transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        </svg>
        <Box sx={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontFamily: '"Outfit", sans-serif',
              fontWeight: 800,
              fontSize: '1.15rem',
              color: '#F3F4F6',
              lineHeight: 1,
            }}
          >
            {rating}
          </Typography>
          <Typography variant="caption" sx={{ color: '#9CA3AF', fontSize: '0.65rem', mt: 0.1 }}>
            /{max}
          </Typography>
        </Box>
      </Box>
      <Box>
        <Typography
          variant="body2"
          sx={{
            fontFamily: '"Outfit", sans-serif',
            fontWeight: 700,
            color: '#F3F4F6',
            fontSize: '0.9rem',
          }}
        >
          {label}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: '#9CA3AF',
            display: 'block',
            mt: 0.3,
            lineHeight: 1.2,
          }}
        >
          {sublabel}
        </Typography>
      </Box>
    </Box>
  );
};

const MovieDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { movie, loading, error, fetchMovieDetails } = useMovieDetail();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isInWatchLater, addToWatchLater, removeFromWatchLater } = useWatchLater();
  const { getEntry, addOrUpdateEntry, deleteEntry } = useJournal();

  // Autocomplete suggestions and trailer panel states
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [relatedMovies, setRelatedMovies] = useState<Movie[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(false);

  // Journal note states
  const [userRating, setUserRating] = useState(0);
  const [userNotes, setUserNotes] = useState('');
  const [hoverStar, setHoverStar] = useState(-1);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (id) {
      fetchMovieDetails(id);
    }
  }, [id, fetchMovieDetails]);

  // Sync journal notes when movie updates
  useEffect(() => {
    if (movie) {
      const entry = getEntry(movie.imdbID);
      setUserRating(entry ? entry.rating : 0);
      setUserNotes(entry ? entry.notes : '');
      setIsSaved(false);
    }
  }, [movie, getEntry]);

  // Fetch related genre suggestions
  useEffect(() => {
    const fetchRelated = async () => {
      if (!movie || !movie.Genre || movie.Genre === 'N/A') return;
      setRelatedLoading(true);
      try {
        const firstGenre = movie.Genre.split(',')[0].trim();
        const response = await searchMovies(firstGenre, 1);
        if (response.Response === 'True') {
          const filtered = (response.Search || []).filter(
            (m) => m.imdbID !== movie.imdbID
          );
          setRelatedMovies(filtered.slice(0, 6));
        }
      } catch (err) {
        console.error('Failed to load related movies:', err);
      } finally {
        setRelatedLoading(false);
      }
    };
    fetchRelated();
  }, [movie]);

  // Dynamic values for action handling
  const movieAsMovie: Movie | null = movie
    ? {
        Title: movie.Title,
        Year: movie.Year,
        imdbID: movie.imdbID,
        Type: movie.Type,
        Poster: movie.Poster,
      }
    : null;

  const favoriteActive = movie ? isFavorite(movie.imdbID) : false;
  const watchLaterActive = movie ? isInWatchLater(movie.imdbID) : false;

  const handleFavoriteClick = () => {
    if (movieAsMovie) {
      toggleFavorite(movieAsMovie);
    }
  };

  const handleWatchLaterClick = () => {
    if (movieAsMovie) {
      if (watchLaterActive) {
        removeFromWatchLater(movieAsMovie.imdbID);
      } else {
        addToWatchLater(movieAsMovie);
      }
    }
  };

  const handleSaveJournal = () => {
    if (movie) {
      addOrUpdateEntry(movie.imdbID, movie.Title, movie.Poster, userRating, userNotes);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  const handleDeleteJournal = () => {
    if (movie) {
      deleteEntry(movie.imdbID);
      setUserRating(0);
      setUserNotes('');
    }
  };

  // Render Shimmering Cinematic Skeleton Loading State
  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: '#08090C',
          color: 'white',
          padding: { xs: '32px 16px 40px', md: '56px 24px 72px' },
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            display: 'block',
            position: 'absolute',
            left: '-150%',
            top: 0,
            width: '150%',
            height: '100%',
            backgroundImage: 'linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.02) 50%, rgba(255, 255, 255, 0) 100%)',
            animation: 'shimmer 2.2s infinite linear',
            zIndex: 1,
          },
          '@keyframes shimmer': {
            '0%': { left: '-150%' },
            '100%': { left: '150%' }
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          {/* Back button skeleton */}
          <Box sx={{ width: 160, height: 44, borderRadius: '30px', backgroundColor: 'rgba(255, 255, 255, 0.03)', mb: 5 }} />
          
          <Grid container spacing={{ xs: 4, md: 6 }}>
            {/* Poster card skeleton */}
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  height: 480,
                  backgroundColor: 'rgba(22, 26, 36, 0.3)',
                  borderRadius: '24px',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  mb: 3,
                }}
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ height: 48, flex: 1, backgroundColor: 'rgba(22, 26, 36, 0.3)', borderRadius: '12px' }} />
                <Box sx={{ height: 48, flex: 1, backgroundColor: 'rgba(22, 26, 36, 0.3)', borderRadius: '12px' }} />
              </Box>
            </Grid>
            
            {/* Details skeleton */}
            <Grid item xs={12} md={8}>
              <Box sx={{ height: 52, width: '70%', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', mb: 2.5 }} />
              
              <Box sx={{ display: 'flex', gap: 1.5, mb: 5 }}>
                <Box sx={{ height: 28, width: 70, backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: '6px' }} />
                <Box sx={{ height: 28, width: 85, backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: '6px' }} />
                <Box sx={{ height: 28, width: 110, backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: '6px' }} />
              </Box>
              
              <Box sx={{ height: 96, width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: '16px', mb: 5 }} />
              
              <Grid container spacing={2.5}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Grid item xs={12} sm={6} key={i}>
                    <Box sx={{ height: 14, width: '30%', backgroundColor: 'rgba(255, 255, 255, 0.015)', borderRadius: '4px', mb: 0.8 }} />
                    <Box sx={{ height: 22, width: '80%', backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: '6px' }} />
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>
    );
  }

  if (error || !movie) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <ErrorMessage message={error || 'Movie not found'} />
      </Container>
    );
  }

  // Parse specific ratings from OMDb payload
  const imdbRatingVal = movie.imdbRating !== 'N/A' ? parseFloat(movie.imdbRating) : null;
  const metascoreVal = movie.Metascore !== 'N/A' ? parseInt(movie.Metascore) : null;
  const rottenTomatoesText = movie.Ratings?.find((r) => r.Source === 'Rotten Tomatoes')?.Value;
  const rottenTomatoesVal = rottenTomatoesText ? parseInt(rottenTomatoesText.replace('%', '')) : null;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#08090C',
        color: 'white',
        padding: { xs: '32px 16px 40px', md: '56px 24px 72px' },
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Immersive scaled and blurred theatrical backdrop banner */}
      {movie.Poster !== 'N/A' && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '65vh',
            backgroundImage: `url(${movie.Poster})`,
            backgroundPosition: 'center 15%',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            transform: 'scale(1.12)',
            filter: 'blur(45px) saturate(1.35) brightness(0.28)',
            opacity: 0.75,
            zIndex: 0,
            pointerEvents: 'none',
            '&::after': {
              content: '""',
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to bottom, rgba(8, 9, 12, 0.2) 0%, rgba(8, 9, 12, 0.85) 60%, #08090C 100%)',
            },
          }}
        />
      )}

      <Fade in={true} timeout={700}>
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          {/* Glass floating Back Action trigger */}
          <Box sx={{ mb: 4 }}>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <Button
                startIcon={<ArrowBackIcon />}
                sx={{
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  color: 'rgba(243, 244, 246, 0.85)',
                  borderRadius: '30px',
                  px: 3,
                  py: 1.2,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    borderColor: '#00F2FE',
                    color: '#00F2FE',
                    transform: 'translateX(-4px)',
                    boxShadow: '0 4px 20px rgba(0, 242, 254, 0.2)',
                  },
                }}
              >
                Back to Search
              </Button>
            </Link>
          </Box>

          <Grid container spacing={{ xs: 4, md: 6 }} alignItems="flex-start">
            {/* Left Column - Poster Frame & Interactive Action buttons */}
            <Grid item xs={12} md={4}>
              <Paper
                sx={{
                  overflow: 'hidden',
                  backgroundColor: 'rgba(22, 26, 36, 0.3)',
                  borderRadius: '24px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 16px 40px rgba(0, 0, 0, 0.4), 0 0 30px rgba(255, 51, 102, 0.08)',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  mb: 3,
                  '&:hover': {
                    transform: 'translateY(-6px) scale(1.015)',
                    borderColor: 'rgba(255, 51, 102, 0.3)',
                    boxShadow: '0 20px 48px rgba(0, 0, 0, 0.5), 0 0 40px rgba(255, 51, 102, 0.18)',
                  },
                }}
              >
                <img
                  src={movie.Poster !== 'N/A' ? movie.Poster : '/movie-placeholder.svg'}
                  alt={movie.Title}
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    borderRadius: '24px',
                  }}
                />
              </Paper>

              {/* Watch Trailer Main Button */}
              <Button
                fullWidth
                onClick={() => setIsTrailerOpen(true)}
                variant="contained"
                sx={{
                  borderRadius: '16px',
                  py: 1.8,
                  mb: 2.5,
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  letterSpacing: '0.5px',
                  background: 'linear-gradient(135deg, #FF3366 0%, #FF5E36 100%)',
                  color: '#ffffff',
                  boxShadow: '0 8px 20px rgba(255, 51, 102, 0.25)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #FF5E36 0%, #FF3366 100%)',
                    boxShadow: '0 8px 25px rgba(255, 51, 102, 0.45)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
                startIcon={<Typography component="span" sx={{ fontSize: '1.2rem', mr: 0.5 }}>🎬</Typography>}
              >
                Watch Trailer
              </Button>

              {/* Action Buttons Panel */}
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Tooltip title={favoriteActive ? 'Remove from Favorites' : 'Add to Favorites'}>
                    <Button
                      fullWidth
                      onClick={handleFavoriteClick}
                      variant={favoriteActive ? 'contained' : 'outlined'}
                      startIcon={favoriteActive ? <Favorite /> : <FavoriteBorder />}
                      sx={{
                        borderRadius: '16px',
                        py: 1.5,
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        letterSpacing: '0.5px',
                        backgroundColor: favoriteActive ? undefined : 'rgba(22, 26, 36, 0.4)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        border: favoriteActive ? 'none' : '1px solid rgba(255, 51, 102, 0.35)',
                        borderColor: favoriteActive ? undefined : 'rgba(255, 51, 102, 0.35)',
                        color: favoriteActive ? undefined : '#FF3366',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          backgroundColor: favoriteActive ? undefined : 'rgba(255, 51, 102, 0.08)',
                          borderColor: '#FF3366',
                          boxShadow: favoriteActive 
                            ? '0 6px 20px rgba(255, 51, 102, 0.4)' 
                            : '0 4px 15px rgba(255, 51, 102, 0.18)',
                        },
                      }}
                    >
                      {favoriteActive ? 'Liked' : 'Favorite'}
                    </Button>
                  </Tooltip>
                </Grid>
                <Grid item xs={6}>
                  <Tooltip title={watchLaterActive ? 'Remove from Watch List' : 'Add to Watch List'}>
                    <Button
                      fullWidth
                      onClick={handleWatchLaterClick}
                      variant={watchLaterActive ? 'contained' : 'outlined'}
                      color="secondary"
                      startIcon={watchLaterActive ? <Bookmark /> : <BookmarkBorder />}
                      sx={{
                        borderRadius: '16px',
                        py: 1.5,
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        letterSpacing: '0.5px',
                        background: watchLaterActive ? 'linear-gradient(135deg, #00F2FE 0%, #4FACFE 100%)' : undefined,
                        backgroundColor: watchLaterActive ? undefined : 'rgba(22, 26, 36, 0.4)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        border: watchLaterActive ? 'none' : '1px solid rgba(0, 242, 254, 0.35)',
                        borderColor: watchLaterActive ? undefined : 'rgba(0, 242, 254, 0.35)',
                        color: watchLaterActive ? '#FFFFFF' : '#00F2FE',
                        boxShadow: watchLaterActive ? '0 4px 14px rgba(0, 242, 254, 0.25)' : undefined,
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          background: watchLaterActive ? 'linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%)' : undefined,
                          backgroundColor: watchLaterActive ? undefined : 'rgba(0, 242, 254, 0.08)',
                          borderColor: '#00F2FE',
                          boxShadow: watchLaterActive 
                            ? '0 6px 20px rgba(0, 242, 254, 0.4)' 
                            : '0 4px 15px rgba(0, 242, 254, 0.18)',
                        },
                      }}
                    >
                      {watchLaterActive ? 'Saved' : 'Watch List'}
                    </Button>
                  </Tooltip>
                </Grid>
              </Grid>
            </Grid>

            {/* Right Column - Title, Ratings Gauges, Technical Details */}
            <Grid item xs={12} md={8}>
              <Typography
                variant="h3"
                component="h1"
                sx={{
                  fontFamily: '"Outfit", sans-serif',
                  fontWeight: 900,
                  fontSize: { xs: '2.4rem', sm: '3rem', md: '3.6rem' },
                  letterSpacing: '-1px',
                  background: 'linear-gradient(135deg, #FFFFFF 0%, #E5E7EB 50%, #9CA3AF 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  lineHeight: 1.15,
                  mb: 2.2,
                  textShadow: '0 10px 30px rgba(0,0,0,0.3)',
                }}
              >
                {movie.Title}
              </Typography>

              {/* Glassy Metadata Badges list */}
              <Box sx={{ display: 'flex', gap: 1.2, flexWrap: 'wrap', mb: 4.5 }}>
                <Chip
                  label={movie.Year}
                  sx={{
                    fontFamily: '"Outfit", sans-serif',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    backgroundColor: 'rgba(255, 51, 102, 0.1)',
                    border: '1px solid rgba(255, 51, 102, 0.25)',
                    color: '#FF5E36',
                    borderRadius: '8px',
                  }}
                />
                {movie.Rated && movie.Rated !== 'N/A' && (
                  <Chip
                     label={movie.Rated}
                     sx={{
                       fontFamily: '"Outfit", sans-serif',
                       fontWeight: 700,
                       fontSize: '0.8rem',
                       backgroundColor: 'rgba(255, 255, 255, 0.05)',
                       border: '1px solid rgba(255, 255, 255, 0.1)',
                       color: '#E5E7EB',
                       borderRadius: '8px',
                     }}
                  />
                )}
                {movie.Runtime && movie.Runtime !== 'N/A' && (
                  <Chip
                    label={movie.Runtime}
                    sx={{
                      fontFamily: '"Outfit", sans-serif',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#E5E7EB',
                      borderRadius: '8px',
                    }}
                  />
                )}
                {movie.Genre && movie.Genre !== 'N/A' && (
                  <Chip
                    label={movie.Genre}
                    sx={{
                      fontFamily: '"Outfit", sans-serif',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      backgroundColor: 'rgba(0, 242, 254, 0.1)',
                      border: '1px solid rgba(0, 242, 254, 0.25)',
                      color: '#00F2FE',
                      borderRadius: '8px',
                    }}
                  />
                )}
              </Box>

              {/* High-Fidelity Ratings Gauges Row */}
              {(imdbRatingVal || metascoreVal || rottenTomatoesVal) && (
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 2.2,
                    mb: 5.5,
                  }}
                >
                  {imdbRatingVal && (
                    <RatingCircle
                      rating={imdbRatingVal}
                      max={10}
                      label="IMDb Rating"
                      sublabel={movie.imdbVotes !== 'N/A' ? `${movie.imdbVotes} votes` : 'User reviews'}
                      gradientStart="#FF3366"
                      gradientEnd="#FF5E36"
                    />
                  )}
                  {metascoreVal && (
                    <RatingCircle
                      rating={metascoreVal}
                      max={100}
                      label="Metascore"
                      sublabel="Metacritic reviews"
                      gradientStart="#00F2FE"
                      gradientEnd="#4FACFE"
                    />
                  )}
                  {rottenTomatoesVal && (
                    <RatingCircle
                      rating={rottenTomatoesVal}
                      max={100}
                      label="Rotten Tomatoes"
                      sublabel="Tomatometer score"
                      gradientStart="#FF4B2B"
                      gradientEnd="#FF416C"
                    />
                  )}
                </Box>
              )}

              {/* Storyline / Plot Panel */}
              <Box
                sx={{
                  p: 3.5,
                  borderRadius: '24px',
                  backgroundColor: 'rgba(22, 26, 36, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  mb: 5.5,
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: '"Outfit", sans-serif',
                    fontWeight: 700,
                    color: '#F3F4F6',
                    mb: 1.8,
                    fontSize: '1.25rem',
                    letterSpacing: '0.25px',
                  }}
                >
                  Storyline
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontFamily: '"Inter", sans-serif',
                    fontWeight: 400,
                    color: '#9CA3AF',
                    lineHeight: 1.75,
                    fontSize: '1.025rem',
                  }}
                >
                  {movie.Plot !== 'N/A' ? movie.Plot : 'No description available for this title.'}
                </Typography>
              </Box>

              {/* Technical Details Grid */}
              <Typography
                variant="h6"
                sx={{
                  fontFamily: '"Outfit", sans-serif',
                  fontWeight: 700,
                  color: '#F3F4F6',
                  mb: 2.5,
                  fontSize: '1.25rem',
                  letterSpacing: '0.25px',
                }}
              >
                Production Details
              </Typography>
              <Grid container spacing={2.5} sx={{ mb: 5.5 }}>
                {[
                  { label: 'Director', value: movie.Director, icon: <Star /> },
                  { label: 'Writers', value: movie.Writer, icon: <Star /> },
                  { label: 'Cast', value: movie.Actors, icon: <Star /> },
                  { label: 'Released', value: movie.Released, icon: <Schedule /> },
                  { label: 'Language', value: movie.Language, icon: <LanguageIcon /> },
                  { label: 'Country', value: movie.Country, icon: <Public /> },
                  { label: 'Box Office', value: movie.BoxOffice !== 'N/A' ? movie.BoxOffice : null, icon: <Star /> },
                  { label: 'Production', value: movie.Production !== 'N/A' ? movie.Production : null, icon: <Star /> },
                ]
                  .filter((item) => item.value && item.value !== 'N/A')
                  .map((item, idx) => (
                    <Grid item xs={12} sm={6} key={idx}>
                      <Box
                        sx={{
                          p: 2.2,
                          borderRadius: '16px',
                          backgroundColor: 'rgba(255, 255, 255, 0.01)',
                          border: '1px solid rgba(255, 255, 255, 0.04)',
                          height: '100%',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          backdropFilter: 'blur(8px)',
                          WebkitBackdropFilter: 'blur(8px)',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.03)',
                            borderColor: 'rgba(255, 255, 255, 0.08)',
                            transform: 'translateY(-3px)',
                          },
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            display: 'block',
                            color: '#9CA3AF',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            fontWeight: 700,
                            mb: 0.8,
                            fontSize: '0.72rem',
                          }}
                        >
                          {item.label}
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            fontFamily: '"Inter", sans-serif',
                            fontWeight: 500,
                            color: '#F3F4F6',
                            lineHeight: 1.5,
                            fontSize: '0.98rem',
                          }}
                        >
                          {item.value}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
              </Grid>

              {/* Gold Shimmering Trophy Awards Spotlight */}
              {movie.Awards && movie.Awards !== 'N/A' && (
                <Box
                  sx={{
                    p: 3,
                    borderRadius: '24px',
                    background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.07) 0%, rgba(255, 140, 0, 0.03) 100%)',
                    border: '1px solid rgba(255, 215, 0, 0.25)',
                    boxShadow: '0 12px 32px rgba(255, 215, 0, 0.03)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3.5,
                    position: 'relative',
                    overflow: 'hidden',
                    mb: 5.5,
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '50%',
                      height: '100%',
                      background: 'linear-gradient(90deg, rgba(255, 215, 0, 0) 0%, rgba(255, 215, 0, 0.12) 50%, rgba(255, 215, 0, 0) 100%)',
                      animation: 'shimmerSweep 4.5s infinite ease-in-out',
                    },
                    '@keyframes shimmerSweep': {
                      '0%': { left: '-100%' },
                      '100%': { left: '200%' },
                    },
                  }}
                >
                  <EmojiEvents
                    sx={{
                      fontSize: '3.6rem',
                      color: '#FFD700',
                      filter: 'drop-shadow(0 0 12px rgba(255, 215, 0, 0.55))',
                    }}
                  />
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: '"Outfit", sans-serif',
                        fontWeight: 800,
                        color: '#FFD700',
                        mb: 0.5,
                        fontSize: '1.15rem',
                      }}
                    >
                      Awards Spotlight
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: '#E5E7EB',
                        fontFamily: '"Inter", sans-serif',
                        fontWeight: 500,
                        lineHeight: 1.5,
                        fontSize: '0.96rem',
                      }}
                    >
                      {movie.Awards}
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* Premium CineLog Review / Notes Panel */}
              <Box
                sx={{
                  p: 3.5,
                  borderRadius: '24px',
                  backgroundColor: 'rgba(22, 26, 36, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  boxShadow: '0 12px 32px rgba(0, 0, 0, 0.25)',
                  mb: 5.5,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: '"Outfit", sans-serif',
                    fontWeight: 800,
                    color: '#00F2FE',
                    mb: 2.2,
                    fontSize: '1.25rem',
                    letterSpacing: '0.25px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <span>✍️</span> My CineLog Diary Entry
                </Typography>

                {/* Stars Rating Selector */}
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 1, fontWeight: 600 }}>
                  Personal Rating
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.6, mb: 3.5 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      onMouseEnter={() => setHoverStar(star)}
                      onMouseLeave={() => setHoverStar(-1)}
                      onClick={() => setUserRating(star)}
                      sx={{
                        fontSize: '2.1rem',
                        cursor: 'pointer',
                        color: (hoverStar >= star || (hoverStar === -1 && userRating >= star))
                          ? '#FFD700'
                          : 'rgba(255, 255, 255, 0.12)',
                        filter: (hoverStar >= star || (hoverStar === -1 && userRating >= star))
                          ? 'drop-shadow(0px 0px 8px rgba(255, 215, 0, 0.4))'
                          : 'none',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'scale(1.2)',
                        },
                      }}
                    />
                  ))}
                </Box>

                {/* Notes Input Field */}
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Share your thoughts, viewing environment, or a quick summary review of this film..."
                  value={userNotes}
                  onChange={(e) => setUserNotes(e.target.value)}
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(8, 9, 12, 0.35)',
                      borderRadius: '16px',
                      color: 'white',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      transition: 'border 0.3s ease',
                      fontFamily: '"Inter", sans-serif',
                      fontSize: '0.96rem',
                      '& fieldset': { border: 'none' },
                      '&:hover': {
                        border: '1px solid rgba(0, 242, 254, 0.25)',
                      },
                      '&.Mui-focused': {
                        border: '1px solid #00F2FE',
                      },
                    },
                    '& .MuiInputBase-input': {
                      '&::placeholder': {
                        color: 'rgba(255, 255, 255, 0.35)',
                        opacity: 1,
                      },
                    },
                  }}
                />

                {/* Save and Delete CTA Controls */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    onClick={handleSaveJournal}
                    disabled={userRating === 0 && !userNotes.trim()}
                    sx={{
                      borderRadius: '12px',
                      px: 3.5,
                      py: 1.2,
                      fontWeight: 700,
                      background: isSaved 
                        ? 'linear-gradient(135deg, #00FF87 0%, #60EFFF 100%)' 
                        : 'linear-gradient(135deg, #00F2FE 0%, #4FACFE 100%)',
                      color: isSaved ? '#08090C' : 'white',
                      '&:hover': {
                        boxShadow: '0 4px 15px rgba(0, 242, 254, 0.35)',
                        transform: 'translateY(-1px)',
                      },
                      '&:disabled': {
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: 'rgba(255, 255, 255, 0.2)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                    startIcon={isSaved ? <CheckCircleIcon /> : undefined}
                  >
                    {isSaved ? 'Logged!' : 'Save Entry'}
                  </Button>

                  {(userRating > 0 || userNotes.trim().length > 0) && (
                    <Button
                      onClick={handleDeleteJournal}
                      startIcon={<DeleteIcon />}
                      sx={{
                        borderRadius: '12px',
                        px: 3,
                        py: 1.2,
                        color: 'rgba(255, 51, 102, 0.8)',
                        border: '1px solid rgba(255, 51, 102, 0.2)',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 51, 102, 0.08)',
                          borderColor: '#FF3366',
                          color: '#FF3366',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      Delete
                    </Button>
                  )}
                </Box>
              </Box>
            </Grid>
          </Grid>

          {/* Related Recommendations Slider Section */}
          {(relatedLoading || relatedMovies.length > 0) && (
            <Box sx={{ mt: 10, pt: 6, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <Typography
                variant="h4"
                sx={{
                  fontFamily: '"Outfit", sans-serif',
                  fontWeight: 900,
                  color: 'white',
                  mb: 4,
                  fontSize: { xs: '1.65rem', sm: '2.1rem' },
                  letterSpacing: '-0.5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <Typography component="span" sx={{ fontSize: '2rem', filter: 'drop-shadow(0 0 8px rgba(0,242,254,0.4))' }}>✨</Typography>
                More Like This
              </Typography>

              {relatedLoading ? (
                <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
                  <CircularProgress size={32} sx={{ color: '#00F2FE' }} />
                </Box>
              ) : (
                <Box
                  sx={{
                    display: 'flex',
                    gap: 3,
                    overflowX: 'auto',
                    pb: 3,
                    pt: 1.2,
                    '&::-webkit-scrollbar': {
                      height: '6px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: 'rgba(0, 242, 254, 0.25)',
                      borderRadius: '3px',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 242, 254, 0.5)',
                      },
                    },
                  }}
                >
                  {relatedMovies.map((m) => (
                    <Box
                      key={m.imdbID}
                      component={Link}
                      to={`/movie/${m.imdbID}`}
                      sx={{
                        flex: '0 0 170px',
                        textDecoration: 'none',
                        color: 'inherit',
                        '&:hover .related-poster': {
                          transform: 'translateY(-6px) scale(1.03)',
                          boxShadow: '0 12px 30px rgba(0, 242, 254, 0.25)',
                          borderColor: 'rgba(0, 242, 254, 0.4)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <Paper
                        className="related-poster"
                        sx={{
                          width: '100%',
                          height: '240px',
                          borderRadius: '16px',
                          overflow: 'hidden',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          backgroundImage: `url(${m.Poster !== 'N/A' ? m.Poster : '/movie-placeholder.svg'})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          mb: 1.8,
                          transition: 'all 0.3s ease',
                          boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: '"Outfit", sans-serif',
                          fontWeight: 700,
                          color: '#F3F4F6',
                          fontSize: '0.88rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          lineHeight: 1.3,
                        }}
                      >
                        {m.Title}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: 'rgba(255, 255, 255, 0.45)', mt: 0.5, display: 'block', fontWeight: 500 }}
                      >
                        {m.Year}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </Container>
      </Fade>

      {/* Trailer Glassmorphic Lightbox Overlay Modal */}
      {isTrailerOpen && (
        <Box
          onClick={() => setIsTrailerOpen(false)}
          sx={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(5, 7, 10, 0.88)',
            backdropFilter: 'blur(35px)',
            WebkitBackdropFilter: 'blur(35px)',
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            p: { xs: 2, sm: 4, md: 8 },
            animation: 'fadeIn 0.3s ease',
            '@keyframes fadeIn': {
              from: { opacity: 0 },
              to: { opacity: 1 },
            },
          }}
        >
          <Box
            onClick={(e) => e.stopPropagation()}
            sx={{
              position: 'relative',
              width: '100%',
              maxWidth: '960px',
              aspectRatio: '16/9',
              borderRadius: '24px',
              overflow: 'hidden',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 24px 64px rgba(0, 0, 0, 0.8), 0 0 50px rgba(0, 242, 254, 0.15)',
              backgroundColor: '#000000',
              animation: 'zoomIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              '@keyframes zoomIn': {
                from: { transform: 'scale(0.9)', opacity: 0 },
                to: { transform: 'scale(1)', opacity: 1 },
              },
            }}
          >
            {/* Close trigger button inside iframe container */}
            <IconButton
              onClick={() => setIsTrailerOpen(false)}
              sx={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                color: 'white',
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                zIndex: 10,
                '&:hover': {
                  backgroundColor: 'rgba(255, 51, 102, 0.8)',
                  transform: 'rotate(90deg) scale(1.1)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <CloseIcon />
            </IconButton>

            <iframe
              title={`${movie.Title} Official Trailer`}
              src={`https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(
                movie.Title + ' official trailer'
              )}&autoplay=1`}
              allow="autoplay; encrypted-media"
              allowFullScreen
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
              }}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default MovieDetail;