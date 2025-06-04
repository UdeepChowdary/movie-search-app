import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, CircularProgress, Box } from '@mui/material';
import { FavoritesProvider } from './context/FavoritesContext';
import { WatchLaterProvider } from './context/WatchLaterContext';
import BackToTop from './components/BackToTop';

// Lazy loaded components
const Home = lazy(() => import('./pages/Home'));
const MovieDetail = lazy(() => import('./pages/MovieDetail'));

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#FF6B6B',
    },
    secondary: {
      main: '#4ECDC4',
    },
    background: {
      default: '#141414',
      paper: '#1a1a1a',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: '#6b6b6b #2b2b2b',
          '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            backgroundColor: '#2b2b2b',
          },
          '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
            borderRadius: 8,
            backgroundColor: '#6b6b6b',
            minHeight: 24,
            border: '3px solid #2b2b2b',
          },
          '&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus': {
            backgroundColor: '#959595',
          },
        },
      },
    },
  },
});

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <FavoritesProvider>
        <WatchLaterProvider>
          <BrowserRouter>
            <Suspense
              fallback={
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
              }
            >
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/movie/:id" element={<MovieDetail />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
          <BackToTop />
        </WatchLaterProvider>
      </FavoritesProvider>
    </ThemeProvider>
  );
};

export default App;
