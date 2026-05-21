import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Tabs, 
  Tab, 
  Fade, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  SelectChangeEvent, 
  Grid, 
  Button,
  IconButton,
  Tooltip,
  Chip,
  Stack,
} from '@mui/material';

import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import { useFavorites } from '../context/FavoritesContext';
import { useWatchLater } from '../context/WatchLaterContext';
import { Movie } from '../types/Movie';
import SearchBar from '../components/SearchBar';
import MovieGrid from '../components/MovieGrid';
import Pagination from '../components/Pagination';
import ErrorMessage from '../components/ErrorMessage';
import { useMovieSearch } from '../hooks/useMovieSearch';

interface Filters {
  year: string;
  type: 'movie' | 'series' | 'episode' | '';
  sortBy: 'year' | 'title' | '';
  sortOrder: 'asc' | 'desc';
}

const RECENT_SEARCHES_KEY = 'movie-search-app-recent-searches';
const MAX_RECENT_SEARCHES = 5;

const Home: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { movies, loading, totalResults, currentPage, search, changePage } = useMovieSearch();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();
  
  const { watchLater, isInWatchLater, addToWatchLater, removeFromWatchLater } = useWatchLater();
  
  const [activeTab, setActiveTab] = useState<'search' | 'favorites' | 'watchLater'>(() => {
    return (searchParams.get('tab') as 'search' | 'favorites' | 'watchLater') || 'search';
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const query = searchParams.get('q') || '';
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  const [filters, setFilters] = useState<Filters>(() => ({
    year: searchParams.get('y') || '',
    type: (searchParams.get('type') as 'movie' | 'series' | 'episode') || '',
    sortBy: (searchParams.get('sortBy') as 'year' | 'title') || '',
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'asc',
  }));

  // Load recent searches from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load recent searches from localStorage', error);
    }
  }, []);

  // Persist recent searches to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recentSearches));
    } catch (error) {
      console.error('Failed to save recent searches to localStorage', error);
    }
  }, [recentSearches]);

  // Handle search when query or filters change
  useEffect(() => {
    if (query && activeTab === 'search') {
      search(query, 1, {
        year: filters.year || undefined,
        type: filters.type || undefined,
        sortBy: filters.sortBy || undefined,
        sortOrder: filters.sortOrder
      });
    }
  }, [query, search, filters, activeTab]);

  // Update URL when tab changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', activeTab);
    setSearchParams(params);
  }, [activeTab, searchParams, setSearchParams]);

  // Filter and sort movies based on active tab and filters
  const displayMovies = useMemo(() => {
    if (activeTab === 'search') {
      return [...movies];
    }

    let filteredMovies = activeTab === 'watchLater' 
      ? [...watchLater]
      : [...favorites];
    
    // Apply filters
    if (filters.year) {
      filteredMovies = filteredMovies.filter(movie => movie.Year === filters.year);
    }
    
    if (filters.type) {
      filteredMovies = filteredMovies.filter(movie => 
        movie.Type.toLowerCase() === filters.type.toLowerCase()
      );
    }
    
    // Apply sorting
    if (filters.sortBy) {
      filteredMovies.sort((a, b) => {
        if (filters.sortBy === 'year') {
          return (parseInt(a.Year) - parseInt(b.Year)) * (filters.sortOrder === 'asc' ? 1 : -1);
        } else if (filters.sortBy === 'title') {
          return a.Title.localeCompare(b.Title) * (filters.sortOrder === 'asc' ? 1 : -1);
        }
        return 0;
      });
    }
    
    return filteredMovies;
  }, [movies, activeTab, filters, favorites, watchLater]);
  
  const displayLoading = activeTab === 'search' && loading;
  const displayNoResults = (activeTab === 'favorites' || activeTab === 'watchLater') && displayMovies.length === 0;
  const showPagination = activeTab === 'search' && totalResults > 0;
  const totalPages = Math.ceil(totalResults / 10);

  // Handle tab change
  const handleTabChange = useCallback((_: React.SyntheticEvent, newValue: 'search' | 'favorites' | 'watchLater') => {
    setActiveTab(newValue);
  }, []);

  // Handle filter changes
  const handleFilterChange = useCallback((e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    if (name) {
      setFilters(prev => ({
        ...prev,
        [name]: value
      }));
      
      // Update URL with filter params
      const params = new URLSearchParams(searchParams);
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      setSearchParams(params);
    }
  }, [searchParams, setSearchParams]);

  const handleClearFilters = useCallback(() => {
    setFilters(prev => ({
      ...prev,
      year: '',
      type: '',
      sortBy: '',
      sortOrder: 'asc',
    }));

    const params = new URLSearchParams(searchParams);
    params.delete('y');
    params.delete('type');
    params.delete('sortBy');
    params.set('sortOrder', 'asc');
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  // Handle watch later toggle
  const handleWatchLaterToggle = useCallback((movie: Movie) => {
    if (isInWatchLater(movie.imdbID)) {
      removeFromWatchLater(movie.imdbID);
    } else {
      addToWatchLater(movie);
    }
  }, [addToWatchLater, isInWatchLater, removeFromWatchLater]);

  const handleFavoriteToggle = useCallback((movie: Movie) => {
    toggleFavorite(movie);
  }, [toggleFavorite]);

  // Handle search
  const handleSearch = useCallback((newQuery: string) => {
    const params = new URLSearchParams({
      q: newQuery,
      page: '1',
      ...(filters.year && { y: filters.year }),
      ...(filters.type && { type: filters.type }),
      ...(filters.sortBy && { sortBy: filters.sortBy }),
      sortOrder: filters.sortOrder
    });
    setSearchParams(params);
    if (newQuery.trim()) {
      setRecentSearches(prev => {
        const withoutCurrent = prev.filter(q => q.toLowerCase() !== newQuery.toLowerCase());
        return [newQuery, ...withoutCurrent].slice(0, MAX_RECENT_SEARCHES);
      });
    }
  }, [filters, setSearchParams, setRecentSearches]);

  const handleRecentSearchClick = useCallback((value: string) => {
    const params = new URLSearchParams({
      q: value,
      page: '1',
      ...(filters.year && { y: filters.year }),
      ...(filters.type && { type: filters.type }),
      ...(filters.sortBy && { sortBy: filters.sortBy }),
      sortOrder: filters.sortOrder
    });
    setSearchParams(params);
  }, [filters, setSearchParams]);

  // Handle page change
  const handlePageChange = useCallback((newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
    changePage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [changePage, searchParams, setSearchParams]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#08090C',
        color: '#F3F4F6',
        paddingBottom: 6,
        backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(0, 242, 254, 0.03) 0%, rgba(8, 9, 12, 0) 80%)',
      }}
    >
      <Box
        sx={{
          background: 'radial-gradient(circle at 50% -10%, rgba(255, 51, 102, 0.12) 0%, rgba(0, 242, 254, 0.04) 40%, rgba(8, 9, 12, 0) 70%)',
          padding: { xs: '40px 16px 24px', md: '64px 24px 32px' },
          textAlign: 'center',
          marginBottom: 2,
          position: 'relative',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 5 }}>
            <Box
              sx={{
                backgroundColor: 'rgba(22, 26, 36, 0.65)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '30px',
                padding: '5px',
                display: 'inline-flex',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
              }}
            >
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  minHeight: 'auto',
                  '& .MuiTabs-flexContainer': {
                    gap: 0.5,
                  },
                  '& .MuiTabs-indicator': {
                    height: '100%',
                    borderRadius: '24px',
                    background: 'linear-gradient(135deg, #FF3366 0%, #FF5E36 100%)',
                    zIndex: 0,
                    boxShadow: '0 4px 15px rgba(255, 51, 102, 0.35)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  },
                }}
              >
                <Tab 
                  label="Search Movies" 
                  value="search" 
                  sx={{
                    fontFamily: '"Outfit", sans-serif',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    borderRadius: '24px',
                    padding: '8px 20px',
                    minHeight: '36px',
                    zIndex: 1,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      color: '#ffffff',
                    },
                    '&.Mui-selected': {
                      color: '#ffffff !important',
                    },
                  }}
                />
                <Tab 
                  label={`Favorites ${favorites.length > 0 ? `(${favorites.length})` : ''}`} 
                  value="favorites" 
                  disabled={favorites.length === 0}
                  sx={{
                    fontFamily: '"Outfit", sans-serif',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    borderRadius: '24px',
                    padding: '8px 20px',
                    minHeight: '36px',
                    zIndex: 1,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      color: '#ffffff',
                    },
                    '&.Mui-selected': {
                      color: '#ffffff !important',
                    },
                    '&.Mui-disabled': {
                      color: 'rgba(255, 255, 255, 0.25)',
                    }
                  }}
                />
                <Tab 
                  label={`Watch Later ${watchLater.length > 0 ? `(${watchLater.length})` : ''}`}
                  value="watchLater"
                  sx={{
                    fontFamily: '"Outfit", sans-serif',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    borderRadius: '24px',
                    padding: '8px 20px',
                    minHeight: '36px',
                    zIndex: 1,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      color: '#ffffff',
                    },
                    '&.Mui-selected': {
                      color: '#ffffff !important',
                    },
                  }}
                />
              </Tabs>
            </Box>
          </Box>
          
          <Fade in={activeTab === 'search'} timeout={300}>
            <Box sx={{ display: activeTab === 'search' ? 'block' : 'none' }}>
              <Typography
                variant="h2"
                component="h1"
                sx={{
                  marginBottom: 2,
                  fontFamily: '"Outfit", sans-serif',
                  fontWeight: 900,
                  fontSize: { xs: '2.5rem', md: '3.8rem' },
                  letterSpacing: '-1px',
                  background: 'linear-gradient(135deg, #FF3366 0%, #FF5E36 40%, #00F2FE 80%, #4FACFE 100%)',
                  backgroundSize: '200% auto',
                  animation: 'gradientFlow 6s ease infinite',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  '@keyframes gradientFlow': {
                    '0%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                    '100%': { backgroundPosition: '0% 50%' }
                  }
                }}
              >
                CINEWAVE
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{
                  mb: 4,
                  fontFamily: '"Inter", sans-serif',
                  color: '#9CA3AF',
                  fontSize: { xs: '0.95rem', md: '1.1rem' },
                  maxWidth: 540,
                  mx: 'auto',
                  lineHeight: 1.6,
                }}
              >
                Discover movies, series, and episodes. Filter by year and type, and save your favorites to revisit later.
              </Typography>
              <SearchBar onSearch={handleSearch} initialValue={query} />
              
              {recentSearches.length > 0 && (
                <Box sx={{ mt: 3, mb: 1 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      mb: 1.5,
                      fontFamily: '"Outfit", sans-serif',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      color: 'rgba(255, 255, 255, 0.45)',
                    }}
                  >
                    Recent searches
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={1}
                    justifyContent="center"
                    flexWrap="wrap"
                    sx={{ gap: 1 }}
                  >
                    {recentSearches.map(term => (
                      <Chip
                        key={term}
                        label={term}
                        size="small"
                        onClick={() => handleRecentSearchClick(term)}
                        sx={{
                          backgroundColor: 'rgba(0, 242, 254, 0.04)',
                          color: '#00F2FE',
                          border: '1px solid rgba(0, 242, 254, 0.15)',
                          borderRadius: '8px',
                          padding: '4px 8px',
                          fontSize: '0.8rem',
                          fontWeight: 500,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            backgroundColor: 'rgba(0, 242, 254, 0.12)',
                            borderColor: '#00F2FE',
                            transform: 'translateY(-1px)',
                          },
                        }}
                      />
                    ))}
                  </Stack>
                </Box>
              )}
              
              <Box sx={{ mt: 4, mb: 3 }}>
                <Button
                  variant="outlined"
                  startIcon={<FilterListIcon />}
                  onClick={() => setShowFilters(!showFilters)}
                  sx={{ 
                    borderRadius: '24px',
                    color: '#00F2FE', 
                    borderColor: 'rgba(0, 242, 254, 0.3)',
                    backgroundColor: 'rgba(0, 242, 254, 0.02)',
                    padding: '8px 24px',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      borderColor: '#00F2FE',
                      backgroundColor: 'rgba(0, 242, 254, 0.1)',
                      boxShadow: '0 0 15px rgba(0, 242, 254, 0.2)',
                      transform: 'translateY(-1px)',
                    }
                  }}
                >
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </Button>
                
                {showFilters && (
                  <Box
                    sx={{
                      mt: 3,
                      p: { xs: 2.5, md: 4 },
                      backgroundColor: 'rgba(22, 26, 36, 0.45)',
                      backdropFilter: 'blur(24px)',
                      WebkitBackdropFilter: 'blur(24px)',
                      borderRadius: '20px',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      boxShadow: '0 12px 40px 0 rgba(0, 0, 0, 0.4)',
                      textAlign: 'left',
                      animation: 'slideDown 0.35s cubic-bezier(0.4, 0, 0.2, 1) forwards',
                      '@keyframes slideDown': {
                        '0%': { opacity: 0, transform: 'translateY(-10px)' },
                        '100%': { opacity: 1, transform: 'translateY(0)' }
                      }
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{
                        mb: 3,
                        fontFamily: '"Outfit", sans-serif',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: 1.5,
                        color: '#00F2FE',
                      }}
                    >
                      Refine Your Journey
                    </Typography>
                    <Grid container spacing={3} alignItems="center">
                      <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth size="small">
                          <InputLabel id="year-filter-label" sx={{ color: 'rgba(255,255,255,0.6)', '&.Mui-focused': { color: '#00F2FE' } }}>Year</InputLabel>
                          <Select
                            labelId="year-filter-label"
                            name="year"
                            value={filters.year}
                            onChange={handleFilterChange}
                            label="Year"
                            sx={{ 
                              color: 'white', 
                              borderRadius: '12px',
                              backgroundColor: 'rgba(255, 255, 255, 0.03)',
                              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.08)' },
                              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0, 242, 254, 0.4)' },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#FF3366' }
                            }}
                          >
                            <MenuItem value="">Any Year</MenuItem>
                            {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map(year => (
                              <MenuItem key={year} value={year.toString()}>
                                {year}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth size="small">
                          <InputLabel id="type-filter-label" sx={{ color: 'rgba(255,255,255,0.6)', '&.Mui-focused': { color: '#00F2FE' } }}>Type</InputLabel>
                          <Select
                            labelId="type-filter-label"
                            name="type"
                            value={filters.type}
                            onChange={handleFilterChange}
                            label="Type"
                            sx={{ 
                              color: 'white', 
                              borderRadius: '12px',
                              backgroundColor: 'rgba(255, 255, 255, 0.03)',
                              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.08)' },
                              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0, 242, 254, 0.4)' },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#FF3366' }
                            }}
                          >
                            <MenuItem value="">Any Type</MenuItem>
                            <MenuItem value="movie">Movie</MenuItem>
                            <MenuItem value="series">TV Series</MenuItem>
                            <MenuItem value="episode">Episode</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth size="small">
                          <InputLabel id="sort-by-label" sx={{ color: 'rgba(255,255,255,0.6)', '&.Mui-focused': { color: '#00F2FE' } }}>Sort By</InputLabel>
                          <Select
                            labelId="sort-by-label"
                            name="sortBy"
                            value={filters.sortBy}
                            onChange={handleFilterChange}
                            label="Sort By"
                            sx={{ 
                              color: 'white', 
                              borderRadius: '12px',
                              backgroundColor: 'rgba(255, 255, 255, 0.03)',
                              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.08)' },
                              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0, 242, 254, 0.4)' },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#FF3366' }
                            }}
                          >
                            <MenuItem value="">None</MenuItem>
                            <MenuItem value="year">Year</MenuItem>
                            <MenuItem value="title">Title</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Tooltip title={`Sort ${filters.sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}>
                          <IconButton 
                            onClick={() => setFilters(prev => ({
                              ...prev,
                              sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc'
                            }))}
                            sx={{ 
                              color: '#00F2FE',
                              backgroundColor: 'rgba(0, 242, 254, 0.05)',
                              border: '1px solid rgba(0, 242, 254, 0.2)',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                backgroundColor: 'rgba(0, 242, 254, 0.15)',
                                borderColor: '#00F2FE',
                                transform: 'scale(1.1)'
                              }
                            }}
                          >
                            <SortIcon style={{
                              transform: filters.sortOrder === 'desc' ? 'scaleY(-1)' : 'none',
                              transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                            }} />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                    </Grid>
                    <Box sx={{ mt: 3, textAlign: 'right' }}>
                      <Button
                        size="small"
                        color="inherit"
                        onClick={handleClearFilters}
                        disabled={!filters.year && !filters.type && !filters.sortBy && filters.sortOrder === 'asc'}
                        sx={{
                          borderRadius: '8px',
                          color: '#FF3366',
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 51, 102, 0.08)',
                            color: '#FF5E36',
                          },
                          '&.Mui-disabled': {
                            color: 'rgba(255, 255, 255, 0.25)',
                          }
                        }}
                      >
                        Clear filters
                      </Button>
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          </Fade>

          {activeTab !== 'search' && (
            <Box sx={{ mt: 4, mb: 4, textAlign: 'left' }}>
              <Typography 
                variant="h4" 
                component="h2" 
                sx={{ 
                  fontFamily: '"Outfit", sans-serif', 
                  fontWeight: 800, 
                  color: '#F3F4F6',
                  mb: 1
                }}
              >
                {activeTab === 'favorites' ? 'Your Favorites' : 'Watch Later list'}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontFamily: '"Inter", sans-serif', 
                  color: '#9CA3AF',
                  mb: 3
                }}
              >
                {activeTab === 'favorites' 
                  ? 'Keep track of the movies and series you loved the most.' 
                  : 'Your personalized watchlist of items you plan to screen next.'}
              </Typography>
            </Box>
          )}

          {displayNoResults ? (
            <ErrorMessage
              message={
                activeTab === 'favorites'
                  ? "You haven't added any movies to your favorites yet."
                  : activeTab === 'watchLater'
                  ? "You haven't added any movies to watch later yet."
                  : 'No movies found. Try a different search term.'
              }
            />
          ) : (
            <>
              <MovieGrid
                movies={displayMovies}
                loading={displayLoading}
                onFavoriteToggle={
                  activeTab === 'search' || activeTab === 'favorites'
                    ? handleFavoriteToggle
                    : undefined
                }
                onWatchLaterToggle={
                  activeTab === 'search' || activeTab === 'watchLater'
                    ? handleWatchLaterToggle
                    : undefined
                }
                isFavorite={isFavorite}
                isInWatchLater={isInWatchLater}
                showWatchLater={activeTab === 'search' || activeTab === 'watchLater'}
              />

              {showPagination && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default Home; 