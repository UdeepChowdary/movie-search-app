import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Movie } from '../types/Movie';

interface FavoritesContextType {
  favorites: Movie[];
  toggleFavorite: (movie: Movie) => void;
  isFavorite: (imdbID: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const FAVORITES_KEY = 'movie-search-app-favorites';

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<Movie[]>([]);

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const storedFavorites = localStorage.getItem(FAVORITES_KEY);
      if (storedFavorites) {
        const parsed = JSON.parse(storedFavorites);

        if (Array.isArray(parsed)) {
          if (parsed.length === 0) {
            setFavorites([]);
          } else if (typeof parsed[0] === 'string') {
            // Legacy format (array of imdbIDs) – not compatible with Movie type, so reset
            setFavorites([]);
          } else {
            setFavorites(parsed as Movie[]);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load favorites from localStorage', error);
    }
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error('Failed to save favorites to localStorage', error);
    }
  }, [favorites]);

  const toggleFavorite = (movie: Movie) => {
    setFavorites(prev => {
      const exists = prev.some(item => item.imdbID === movie.imdbID);
      return exists
        ? prev.filter(item => item.imdbID !== movie.imdbID)
        : [...prev, movie];
    });
  };

  const isFavorite = (imdbID: string) => {
    return favorites.some(movie => movie.imdbID === imdbID);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = (): FavoritesContextType => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
