import React from 'react';
import { Box, Button } from '@mui/material';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const maxVisiblePages = 5;

  const getVisiblePages = () => {
    if (totalPages <= maxVisiblePages) {
      return pages;
    }

    const halfVisible = Math.floor(maxVisiblePages / 2);
    let start = Math.max(currentPage - halfVisible, 1);
    let end = Math.min(start + maxVisiblePages - 1, totalPages);

    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(end - maxVisiblePages + 1, 1);
    }

    return pages.slice(start - 1, end);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 1,
        marginTop: 4,
      }}
    >
      <Button
        variant="outlined"
        startIcon={<NavigateBeforeIcon />}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        sx={{
          color: 'white',
          borderColor: 'rgba(255, 255, 255, 0.3)',
          '&:hover': {
            borderColor: 'white',
          },
        }}
      >
        Previous
      </Button>

      {getVisiblePages().map((page) => (
        <Button
          key={page}
          variant={currentPage === page ? 'contained' : 'outlined'}
          onClick={() => onPageChange(page)}
          sx={{
            minWidth: '40px',
            color: currentPage === page ? 'white' : 'rgba(255, 255, 255, 0.7)',
            borderColor: 'rgba(255, 255, 255, 0.3)',
            '&:hover': {
              borderColor: 'white',
            },
          }}
        >
          {page}
        </Button>
      ))}

      <Button
        variant="outlined"
        endIcon={<NavigateNextIcon />}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        sx={{
          color: 'white',
          borderColor: 'rgba(255, 255, 255, 0.3)',
          '&:hover': {
            borderColor: 'white',
          },
        }}
      >
        Next
      </Button>
    </Box>
  );
};

export default Pagination; 