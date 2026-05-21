import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface JournalEntry {
  imdbID: string;
  title: string;
  poster: string;
  rating: number; // 1-5 stars
  notes: string;
  createdAt: string;
}

interface JournalContextType {
  journalEntries: JournalEntry[];
  addOrUpdateEntry: (imdbID: string, title: string, poster: string, rating: number, notes: string) => void;
  deleteEntry: (imdbID: string) => void;
  getEntry: (imdbID: string) => JournalEntry | undefined;
}

const JournalContext = createContext<JournalContextType | undefined>(undefined);

const JOURNAL_KEY = 'movie-search-app-journal';

export const JournalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);

  // Load journal entries from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(JOURNAL_KEY);
      if (stored) {
        setJournalEntries(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load journal entries from localStorage', error);
    }
  }, []);

  // Save journal entries to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(JOURNAL_KEY, JSON.stringify(journalEntries));
    } catch (error) {
      console.error('Failed to save journal entries to localStorage', error);
    }
  }, [journalEntries]);

  const addOrUpdateEntry = (imdbID: string, title: string, poster: string, rating: number, notes: string) => {
    setJournalEntries(prev => {
      const filtered = prev.filter(entry => entry.imdbID !== imdbID);
      const newEntry: JournalEntry = {
        imdbID,
        title,
        poster,
        rating,
        notes,
        createdAt: new Date().toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      };
      return [newEntry, ...filtered];
    });
  };

  const deleteEntry = (imdbID: string) => {
    setJournalEntries(prev => prev.filter(entry => entry.imdbID !== imdbID));
  };

  const getEntry = (imdbID: string) => {
    return journalEntries.find(entry => entry.imdbID === imdbID);
  };

  return (
    <JournalContext.Provider value={{ journalEntries, addOrUpdateEntry, deleteEntry, getEntry }}>
      {children}
    </JournalContext.Provider>
  );
};

export const useJournal = (): JournalContextType => {
  const context = useContext(JournalContext);
  if (context === undefined) {
    throw new Error('useJournal must be used within a JournalProvider');
  }
  return context;
};
