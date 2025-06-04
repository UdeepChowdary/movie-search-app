import React from 'react';
import { Card, CardContent, Skeleton, Box } from '@mui/material';

const SkeletonLoader: React.FC = () => {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
      }}
    >
      <Skeleton
        variant="rectangular"
        height={300}
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
        }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Skeleton
          variant="text"
          height={32}
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            marginBottom: 1,
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Skeleton
            variant="text"
            width={60}
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            }}
          />
          <Skeleton
            variant="text"
            width={80}
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default SkeletonLoader; 