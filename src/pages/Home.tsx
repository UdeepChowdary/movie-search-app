import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Container, Typography, Box } from '@mui/material';
import SearchBar from '../components/SearchBar';
import MovieGrid from '../components/MovieGrid';
import Pagination from '../components/Pagination';
import ErrorMessage from '../components/ErrorMessage';
import { useMovieSearch } from '../hooks/useMovieSearch';

const Home: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { movies, loading, error, totalResults, currentPage, search, changePage } = useMovieSearch();

  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    if (query) {
      search(query);
    }
  }, [query, search]);

  const handleSearch = (newQuery: string) => {
    setSearchParams({ q: newQuery, page: '1' });
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams({ q: query, page: newPage.toString() });
    changePage(newPage);
  };

  const totalPages = Math.ceil(totalResults / 10);

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
          padding: '40px 20px',
          textAlign: 'center',
          marginBottom: 4,
        }}
      >
        <Container maxWidth="md">
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
        </Container>
      </Box>

      <Container maxWidth="lg">
        <ErrorMessage message={error || ''} />
        <MovieGrid movies={movies} loading={loading} />
        {totalPages > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </Container>
    </Box>
  );
};

export default Home; 