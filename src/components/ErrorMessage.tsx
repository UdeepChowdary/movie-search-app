import React from 'react';
import { Alert, AlertTitle } from '@mui/material';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  if (!message) return null;

  return (
    <Alert
      severity="error"
      sx={{
        margin: '20px 0',
        backgroundColor: 'rgba(211, 47, 47, 0.1)',
        color: '#f44336',
        '& .MuiAlert-icon': {
          color: '#f44336',
        },
      }}
    >
      <AlertTitle>Error</AlertTitle>
      {message}
    </Alert>
  );
};

export default ErrorMessage; 