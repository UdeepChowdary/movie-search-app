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
    let filteredMovies = activeTab === 'watchLater' 
      ? [...watchLater]
      : activeTab === 'favorites'
        ? [...favorites]
        : [...movies];
    
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
        backgroundColor: '#141414',
        color: 'white',
        paddingBottom: 4,
      }}
    >
      <Box
        sx={{
          background: 'radial-gradient(circle at top, #1f1f1f 0, #000000 45%, #141414 100%)',
          padding: { xs: '32px 16px 16px', md: '48px 24px 24px' },
          textAlign: 'center',
          marginBottom: 4,
          position: 'relative',
        }}
      >
        <Container maxWidth="md">
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            textColor="primary"
            indicatorColor="primary"
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              mb: 3,
              '& .MuiTabs-flexContainer': {
                justifyContent: 'center',
              },
            }}
          >
            <Tab label="Search Movies" value="search" />
            <Tab 
              label={`Favorites ${favorites.length > 0 ? `(${favorites.length})` : ''}`} 
              value="favorites" 
              disabled={favorites.length === 0}
            />
            <Tab 
              label={`Watch Later ${watchLater.length > 0 ? `(${watchLater.length})` : ''}`}
              value="watchLater"
            />
          </Tabs>
          
          <Fade in={activeTab === 'search'} timeout={300}>
            <Box>
              <Typography
                variant="h3"
                component="h1"
                sx={{
                  marginBottom: 3,
                  fontWeight: 'bold',
                  background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Movie Search
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{
                  mb: 3,
                  color: 'rgba(255, 255, 255, 0.8)',
                  maxWidth: 520,
                  mx: 'auto',
                }}
              >
                Discover movies, series, and episodes. Filter by year and type, and save your favorites to revisit later.
              </Typography>
              <SearchBar onSearch={handleSearch} initialValue={query} />
              {recentSearches.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      mb: 1,
                      color: 'rgba(255, 255, 255, 0.6)',
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
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.16)',
                          },
                        }}
                      />
                    ))}
                  </Stack>
                </Box>
              )}
              
              <Box sx={{ mt: 3, mb: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<FilterListIcon />}
                  onClick={() => setShowFilters(!showFilters)}
                  sx={{ mr: 2, color: 'white', borderColor: 'rgba(255, 255, 255, 0.23)' }}
                >
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </Button>
                
                {showFilters && (
                  <Box
                    sx={{
                      mt: 2,
                      p: { xs: 2, md: 3 },
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: 2,
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{
                        mb: 2,
                        textAlign: 'left',
                        textTransform: 'uppercase',
                        letterSpacing: 1,
                        color: 'rgba(255, 255, 255, 0.7)',
                      }}
                    >
                      Filters
                    </Typography>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth size="small">
                          <InputLabel id="year-filter-label" sx={{ color: 'white' }}>Year</InputLabel>
                          <Select
                            labelId="year-filter-label"
                            name="year"
                            value={filters.year}
                            onChange={handleFilterChange}
                            label="Year"
                            sx={{ color: 'white', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.23)' } }}
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
                          <InputLabel id="type-filter-label" sx={{ color: 'white' }}>Type</InputLabel>
                          <Select
                            labelId="type-filter-label"
                            name="type"
                            value={filters.type}
                            onChange={handleFilterChange}
                            label="Type"
                            sx={{ color: 'white', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.23)' } }}
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
                          <InputLabel id="sort-by-label" sx={{ color: 'white' }}>Sort By</InputLabel>
                          <Select
                            labelId="sort-by-label"
                            name="sortBy"
                            value={filters.sortBy}
                            onChange={handleFilterChange}
                            label="Sort By"
                            sx={{ color: 'white', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.23)' } }}
                          >
                            <MenuItem value="">None</MenuItem>
                            <MenuItem value="year">Year</MenuItem>
                            <MenuItem value="title">Title</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Tooltip title={`Sort ${filters.sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}>
                          <IconButton 
                            onClick={() => setFilters(prev => ({
                              ...prev,
                              sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc'
                            }))}
                            sx={{ color: 'white' }}
                          >
                            <SortIcon style={{
                              transform: filters.sortOrder === 'desc' ? 'scaleY(-1)' : 'none',
                              transition: 'transform 0.3s'
                            }} />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                    </Grid>
                    <Box sx={{ mt: 2, textAlign: 'right' }}>
                      <Button
                        size="small"
                        color="inherit"
                        onClick={handleClearFilters}
                        disabled={!filters.year && !filters.type && !filters.sortBy && filters.sortOrder === 'asc'}
                      >
                        Clear filters
                      </Button>
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          </Fade>

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