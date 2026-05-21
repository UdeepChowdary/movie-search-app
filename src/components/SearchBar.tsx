import React, { useState, ChangeEvent, FormEvent } from 'react';
import { TextField, IconButton, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

interface SearchBarProps {
  onSearch: (query: string) => void;
  initialValue?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, initialValue = '' }) => {
  const [query, setQuery] = useState(initialValue);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setQuery(value);
    onSearch(value);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '650px', margin: '0 auto' }}>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search for movies..."
        value={query}
        onChange={handleChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ transition: 'color 0.3s ease' }} />
            </InputAdornment>
          ),
          endAdornment: query && (
            <InputAdornment position="end">
              <IconButton onClick={handleClear} edge="end" sx={{ color: 'rgba(255, 255, 255, 0.5)', '&:hover': { color: '#FF3366', transform: 'rotate(90deg) scale(1.15)' }, transition: 'all 0.3s ease' }}>
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
    </form>
  );
};

export default SearchBar; 