import React, { useState, ChangeEvent, FormEvent, useEffect, useRef, useMemo } from 'react';
import { TextField, IconButton, InputAdornment, Paper, Box, Typography, CircularProgress } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { useNavigate } from 'react-router-dom';
import { searchMovies } from '../services/api';
import { Movie } from '../types/Movie';
import debounce from 'lodash/debounce';

interface SearchBarProps {
  onSearch: (query: string) => void;
  initialValue?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, initialValue = '' }) => {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<Movie[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLFormElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced autocomplete search
  const fetchSuggestions = useMemo(
    () =>
      debounce(async (value: string) => {
        const cleanValue = value.trim();
        if (cleanValue.length < 3) {
          setSuggestions([]);
          setSuggestionLoading(false);
          return;
        }
        setSuggestionLoading(true);
        try {
          const response = await searchMovies(cleanValue, 1);
          if (response.Response === 'True') {
            setSuggestions((response.Search || []).slice(0, 6)); // limit to 6 for sleek aesthetic
          } else {
            setSuggestions([]);
          }
        } catch (err) {
          console.error('Autocomplete suggestions fetch error:', err);
          setSuggestions([]);
        } finally {
          setSuggestionLoading(false);
        }
      }, 350),
    []
  );

  // Clean up debounce on unmount
  useEffect(() => {
    return () => {
      fetchSuggestions.cancel();
    };
  }, [fetchSuggestions]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setQuery(value);
    onSearch(value); // parent search updates live
    setFocusedIndex(-1);
    setShowDropdown(true);
    fetchSuggestions(value);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
    setSuggestions([]);
    setShowDropdown(false);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setShowDropdown(false);
    onSearch(query);
  };

  const handleSuggestionClick = (imdbID: string) => {
    setShowDropdown(false);
    navigate(`/movie/${imdbID}`);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!showDropdown || suggestions.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setFocusedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setFocusedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (event.key === 'Enter') {
      if (focusedIndex >= 0) {
        event.preventDefault();
        handleSuggestionClick(suggestions[focusedIndex].imdbID);
      }
    } else if (event.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  return (
    <form
      ref={dropdownRef}
      onSubmit={handleSubmit}
      style={{ width: '100%', maxWidth: '650px', margin: '0 auto', position: 'relative' }}
    >
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search for movies..."
        value={query}
        onChange={handleChange}
        onFocus={() => setShowDropdown(true)}
        onKeyDown={handleKeyDown}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ transition: 'color 0.3s ease' }} />
            </InputAdornment>
          ),
          endAdornment: query && (
            <InputAdornment position="end">
              <IconButton
                onClick={handleClear}
                edge="end"
                sx={{
                  color: 'rgba(255, 255, 255, 0.5)',
                  '&:hover': {
                    color: '#FF3366',
                    transform: 'rotate(90deg) scale(1.15)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'rgba(22, 26, 36, 0.5)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            color: 'white',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.2)',
            paddingLeft: '8px',
            '& fieldset': {
              border: 'none',
            },
            '&:hover': {
              backgroundColor: 'rgba(22, 26, 36, 0.7)',
              border: '1px solid rgba(0, 242, 254, 0.3)',
              boxShadow: '0 8px 32px 0 rgba(0, 242, 254, 0.08)',
            },
            '&.Mui-focused': {
              backgroundColor: 'rgba(22, 26, 36, 0.85)',
              border: '1px solid #FF3366',
              boxShadow: '0 0 25px 0 rgba(255, 51, 102, 0.25)',
              transform: 'scale(1.015)',
              '& .MuiInputAdornment-root .MuiSvgIcon-root': {
                color: '#FF3366',
              },
            },
          },
          '& .MuiInputBase-input': {
            color: '#F3F4F6',
            padding: '16px 14px',
            fontFamily: '"Inter", sans-serif',
            fontSize: '1.05rem',
            fontWeight: 500,
            '&::placeholder': {
              color: 'rgba(255, 255, 255, 0.45)',
              opacity: 1,
            },
          },
          '& .MuiInputAdornment-root .MuiSvgIcon-root': {
            color: 'rgba(255, 255, 255, 0.4)',
            marginLeft: '8px',
          },
        }}
      />

      {showDropdown && (suggestions.length > 0 || suggestionLoading) && (
        <Paper
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
            marginTop: '8px',
            borderRadius: '16px',
            backgroundColor: 'rgba(15, 18, 25, 0.95)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            maxHeight: '350px',
            overflowY: 'auto',
            boxShadow: '0 12px 40px 0 rgba(0, 0, 0, 0.6)',
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(0, 242, 254, 0.2)',
              borderRadius: '3px',
            },
          }}
        >
          {suggestionLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
              <CircularProgress size={24} sx={{ color: '#00F2FE' }} />
            </Box>
          ) : (
            suggestions.map((movie, index) => (
              <Box
                key={movie.imdbID}
                onClick={() => handleSuggestionClick(movie.imdbID)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 1.5,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  backgroundColor: focusedIndex === index ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
                  borderLeft: focusedIndex === index ? '4px solid #FF3366' : '4px solid transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    borderLeft: '4px solid #00F2FE',
                  },
                }}
              >
                <img
                  src={movie.Poster !== 'N/A' ? movie.Poster : 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=100'}
                  alt={movie.Title}
                  style={{ width: '40px', height: '55px', borderRadius: '6px', objectFit: 'cover' }}
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 600,
                      color: focusedIndex === index ? '#FF3366' : 'white',
                      fontFamily: '"Outfit", sans-serif',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {movie.Title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', mt: 0.5 }}>
                    {movie.Year} • {movie.Type.charAt(0).toUpperCase() + movie.Type.slice(1)}
                  </Typography>
                </Box>
              </Box>
            ))
          )}
        </Paper>
      )}
    </form>
  );
};

export default SearchBar;