import React from 'react';
import { Card, CardContent, Box } from '@mui/material';

const SkeletonLoader: React.FC = () => {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'rgba(22, 26, 36, 0.4)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        overflow: 'hidden',
        position: 'relative',
        '&::before': {
          content: '""',
          display: 'block',
          position: 'absolute',
          left: '-150%',
          top: 0,
          width: '150%',
          height: '100%',
          backgroundImage: 'linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.04) 50%, rgba(255, 255, 255, 0) 100%)',
          animation: 'shimmer 2.2s infinite linear',
        },
        '@keyframes shimmer': {
          '0%': {
            left: '-150%',
          },
          '100%': {
            left: '150%',
          }
        }
      }}
    >
      <Box
        sx={{
          height: 320,
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      />
      <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
        <Box
          sx={{
            height: 22,
            width: '80%',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '6px',
            marginBottom: 2,
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box
            sx={{
              height: 16,
              width: '25%',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '4px',
            }}
          />
          <Box
            sx={{
              height: 16,
              width: '35%',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '4px',
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default SkeletonLoader; 