import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, CircularProgress, Box } from '@mui/material';
import { FavoritesProvider } from './context/FavoritesContext';
import { WatchLaterProvider } from './context/WatchLaterContext';
import { JournalProvider } from './context/JournalContext';
import BackToTop from './components/BackToTop';

// Lazy loaded components
const Home = lazy(() => import('./pages/Home'));
const MovieDetail = lazy(() => import('./pages/MovieDetail'));

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#FF3366', // Electric Coral / Sunset
      light: '#FF5E36',
    },
    secondary: {
      main: '#00F2FE', // Cyber Teal
      light: '#4FACFE',
    },
    background: {
      default: '#08090C', // Obsidian midnight
      paper: 'rgba(22, 26, 36, 0.6)', // Glassmorphic card backdrops
    },
    text: {
      primary: '#F3F4F6',
      secondary: '#9CA3AF',
    },
  },
  typography: {
    fontFamily: '"Inter", "Outfit", -apple-system, BlinkMacSystemFont, sans-serif',
    h1: {
      fontFamily: '"Outfit", sans-serif',
      fontWeight: 800,
    },
    h2: {
      fontFamily: '"Outfit", sans-serif',
      fontWeight: 700,
    },
    h3: {
      fontFamily: '"Outfit", sans-serif',
      fontWeight: 700,
    },
    h4: {
      fontFamily: '"Outfit", sans-serif',
      fontWeight: 600,
    },
    h5: {
      fontFamily: '"Outfit", sans-serif',
      fontWeight: 600,
    },
    h6: {
      fontFamily: '"Outfit", sans-serif',
      fontWeight: 600,
    },
    subtitle1: {
      fontFamily: '"Inter", sans-serif',
    },
    subtitle2: {
      fontFamily: '"Inter", sans-serif',
    },
    body1: {
      fontFamily: '"Inter", sans-serif',
    },
    body2: {
      fontFamily: '"Inter", sans-serif',
    },
    button: {
      fontFamily: '"Outfit", sans-serif',
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#08090C',
          backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(255, 51, 102, 0.05) 0%, rgba(0, 242, 254, 0.02) 50%, rgba(8, 9, 12, 0) 100%)',
          backgroundAttachment: 'fixed',
          color: '#F3F4F6',
          scrollbarColor: 'rgba(0, 242, 254, 0.3) rgba(8, 9, 12, 0.5)',
          '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            width: 8,
            height: 8,
            backgroundColor: 'rgba(8, 9, 12, 0.5)',
          },
          '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
            borderRadius: 8,
            backgroundColor: 'rgba(0, 242, 254, 0.3)',
            minHeight: 24,
            border: '2px solid #08090C',
            transition: 'background-color 0.3s ease',
          },
          '&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover': {
            backgroundColor: 'rgba(0, 242, 254, 0.6)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(22, 26, 36, 0.6)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          padding: '8px 20px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #FF3366 0%, #FF5E36 100%)',
          boxShadow: '0 4px 14px 0 rgba(255, 51, 102, 0.3)',
          border: 'none',
          color: '#ffffff',
          '&:hover': {
            background: 'linear-gradient(135deg, #FF5E36 0%, #FF3366 100%)',
            boxShadow: '0 6px 20px 0 rgba(255, 51, 102, 0.5)',
            transform: 'translateY(-2px)',
          },
        },
        outlinedPrimary: {
          border: '1px solid rgba(255, 51, 102, 0.5)',
          color: '#FF3366',
          '&:hover': {
            border: '1px solid #FF3366',
            backgroundColor: 'rgba(255, 51, 102, 0.06)',
            transform: 'translateY(-2px)',
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
          <JournalProvider>
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
          </JournalProvider>
        </WatchLaterProvider>
      </FavoritesProvider>
    </ThemeProvider>
  );
};

export default App;
