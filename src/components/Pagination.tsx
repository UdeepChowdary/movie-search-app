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
        gap: 1.5,
        marginTop: 6,
        marginBottom: 2,
      }}
    >
      <Button
        variant="outlined"
        startIcon={<NavigateBeforeIcon />}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        sx={{
          borderRadius: '20px',
          color: currentPage === 1 ? 'rgba(255,255,255,0.2)' : '#F3F4F6',
          backgroundColor: 'rgba(22, 26, 36, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          backdropFilter: 'blur(8px)',
          padding: '8px 18px',
          '&:hover': {
            backgroundColor: 'rgba(22, 26, 36, 0.6)',
            borderColor: '#00F2FE',
            color: '#00F2FE',
            transform: 'translateX(-2px)',
          },
          '&.Mui-disabled': {
            borderColor: 'rgba(255, 255, 255, 0.03)',
            backgroundColor: 'rgba(255, 255, 255, 0.01)',
          }
        }}
      >
        Prev
      </Button>

      {getVisiblePages().map((page) => {
        const isActive = currentPage === page;
        return (
          <Button
            key={page}
            onClick={() => onPageChange(page)}
            sx={{
              width: '40px',
              height: '40px',
              minWidth: '40px',
              borderRadius: '50%',
              fontFamily: '"Outfit", sans-serif',
              fontWeight: 600,
              fontSize: '0.95rem',
              color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
              background: isActive 
                ? 'linear-gradient(135deg, #FF3366 0%, #FF5E36 100%)' 
                : 'rgba(22, 26, 36, 0.3)',
              border: isActive 
                ? 'none' 
                : '1px solid rgba(255, 255, 255, 0.06)',
              boxShadow: isActive ? '0 4px 15px 0 rgba(255, 51, 102, 0.35)' : 'none',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'scale(1.15)',
                background: isActive 
                  ? 'linear-gradient(135deg, #FF5E36 0%, #FF3366 100%)' 
                  : 'rgba(22, 26, 36, 0.6)',
                borderColor: isActive ? 'none' : '#00F2FE',
                color: isActive ? '#ffffff' : '#00F2FE',
                boxShadow: isActive ? '0 6px 20px 0 rgba(255, 51, 102, 0.5)' : 'none',
              },
            }}
          >
            {page}
          </Button>
        );
      })}

      <Button
        variant="outlined"
        endIcon={<NavigateNextIcon />}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        sx={{
          borderRadius: '20px',
          color: currentPage === totalPages ? 'rgba(255,255,255,0.2)' : '#F3F4F6',
          backgroundColor: 'rgba(22, 26, 36, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          backdropFilter: 'blur(8px)',
          padding: '8px 18px',
          '&:hover': {
            backgroundColor: 'rgba(22, 26, 36, 0.6)',
            borderColor: '#00F2FE',
            color: '#00F2FE',
            transform: 'translateX(2px)',
          },
          '&.Mui-disabled': {
            borderColor: 'rgba(255, 255, 255, 0.03)',
            backgroundColor: 'rgba(255, 255, 255, 0.01)',
          }
        }}
      >
        Next
      </Button>
    </Box>
  );
};

export default Pagination; 