import { useEffect, useState } from 'react';
import { Fab, Fade, useScrollTrigger, Zoom } from '@mui/material';
import { KeyboardArrowUp } from '@mui/icons-material';

const BackToTop = () => {
  const [showButton, setShowButton] = useState(false);
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100,
  });

  const handleClick = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowButton(true);
      } else {
        setShowButton(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Zoom in={trigger}>
      <Fade in={showButton}>
        <Fab
          color="primary"
          onClick={handleClick}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1000,
          }}
          aria-label="Back to top"
        >
          <KeyboardArrowUp />
        </Fab>
      </Fade>
    </Zoom>
  );
};

export default BackToTop;
