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

const Home: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { movies, loading, error, totalResults, currentPage, search, changePage } = useMovieSearch();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();
  const { watchLater, isInWatchLater, addToWatchLater, removeFromWatchLater } = useWatchLater();
  
  const [activeTab, setActiveTab] = useState<'search' | 'favorites' | 'watchLater'>(() => {
    return (searchParams.get('tab') as 'search' | 'favorites' | 'watchLater') || 'search';
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const query = searchParams.get('q') || '';
  
  const [filters, setFilters] = useState<Filters>(() => ({
    year: searchParams.get('y') || '',
    type: (searchParams.get('type') as 'movie' | 'series' | 'episode') || '',
    sortBy: (searchParams.get('sortBy') as 'year' | 'title') || '',
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'asc',
  }));

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
        ? movies.filter(movie => isFavorite(movie.imdbID))
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
  }, [movies, activeTab, filters, isFavorite, watchLater]);
  
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

  // Handle watch later toggle
  const handleWatchLaterToggle = useCallback((movie: Movie) => {
    if (isInWatchLater(movie.imdbID)) {
      removeFromWatchLater(movie.imdbID);
    } else {
      addToWatchLater(movie);
    }
  }, [addToWatchLater, isInWatchLater, removeFromWatchLater]);

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
          background: 'linear-gradient(to bottom, #000000, #141414)',
          padding: '40px 20px 20px',
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
              label="Watch Later"
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
              <SearchBar onSearch={handleSearch} initialValue={query} />
              
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
                  <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 1 }}>
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
                onFavoriteToggle={toggleFavorite}
                onWatchLaterToggle={handleWatchLaterToggle}
                isFavorite={isFavorite}
                isInWatchLater={isInWatchLater}
                showWatchLater={activeTab !== 'watchLater'}
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