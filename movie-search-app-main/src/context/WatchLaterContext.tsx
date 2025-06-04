import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Movie } from '../types/Movie';

interface WatchLaterContextType {
  watchLater: Movie[];
  addToWatchLater: (movie: Movie) => void;
  removeFromWatchLater: (imdbID: string) => void;
  isInWatchLater: (imdbID: string) => boolean;
}

const WatchLaterContext = createContext<WatchLaterContextType | undefined>(undefined);

const WATCH_LATER_KEY = 'movie-search-app-watch-later';

export const WatchLaterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [watchLater, setWatchLater] = useState<Movie[]>([]);

  // Load watch later list from localStorage on mount
  useEffect(() => {
    try {
      const storedWatchLater = localStorage.getItem(WATCH_LATER_KEY);
      if (storedWatchLater) {
        setWatchLater(JSON.parse(storedWatchLater));
      }
    } catch (error) {
      console.error('Failed to load watch later list from localStorage', error);
    }
  }, []);

  // Save watch later list to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(WATCH_LATER_KEY, JSON.stringify(watchLater));
    } catch (error) {
      console.error('Failed to save watch later list to localStorage', error);
    }
  }, [watchLater]);

  const addToWatchLater = (movie: Movie) => {
    setWatchLater(prev => [...prev, movie]);
  };

  const removeFromWatchLater = (imdbID: string) => {
    setWatchLater(prev => prev.filter(movie => movie.imdbID !== imdbID));
  };

  const isInWatchLater = (imdbID: string) => {
    return watchLater.some(movie => movie.imdbID === imdbID);
  };

  return (
    <WatchLaterContext.Provider 
      value={{ 
        watchLater, 
        addToWatchLater, 
        removeFromWatchLater, 
        isInWatchLater 
      }}
    >
      {children}
    </WatchLaterContext.Provider>
  );
};

export const useWatchLater = (): WatchLaterContextType => {
  const context = useContext(WatchLaterContext);
  if (context === undefined) {
    throw new Error('useWatchLater must be used within a WatchLaterProvider');
  }
  return context;
};
