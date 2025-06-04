import axios from 'axios';
import { SearchResponse, MovieDetail } from '../types/Movie';

// Corrected API configuration for OMDB
const OMDB_API_KEY = '904c9a0d'; // Hardcoded API key for testing
const OMDB_BASE_URL = 'http://www.omdbapi.com/';

// Debug: Log the API key to ensure it's loaded
console.log('OMDB API Key:', OMDB_API_KEY);

// The following TMDB related constants are not used for OMDB functionality as per README
// const API_KEY = process.env.REACT_APP_TMDB_API_KEY;
// const BASE_URL = 'https://api.themoviedb.org/3';

// Cache for storing search results
const searchCache = new Map<string, SearchResponse>();
const detailCache = new Map<string, MovieDetail>();

export interface SearchOptions {
  year?: string;
  type?: 'movie' | 'series' | 'episode';
  sortBy?: 'year' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export const searchMovies = async (
  query: string, 
  page: number = 1, 
  options: SearchOptions = {}
): Promise<SearchResponse> => {
  const { year, type, sortBy, sortOrder = 'asc' } = options;
  const cacheKey = `${query}-${page}-${year || ''}-${type || ''}-${sortBy || ''}-${sortOrder}`;
  
  if (searchCache.has(cacheKey)) {
    return searchCache.get(cacheKey)!;
  }

  try {
    const params: Record<string, any> = {
      apikey: OMDB_API_KEY,
      s: query,
      page,
    };

    if (year) params.y = year;
    if (type) params.type = type;

    const response = await axios.get<SearchResponse>(OMDB_BASE_URL, { params });

    // Apply sorting if specified
    if (response.data.Search && sortBy) {
      response.data.Search.sort((a, b) => {
        let compareResult = 0;
        if (sortBy === 'year') {
          compareResult = parseInt(a.Year) - parseInt(b.Year);
        } else if (sortBy === 'title') {
          compareResult = a.Title.localeCompare(b.Title);
        }
        return sortOrder === 'asc' ? compareResult : -compareResult;
      });
    }

    if (response.data.Response === 'True') {
      searchCache.set(cacheKey, response.data);
    }

    return response.data;
  } catch (error) {
    console.error('Error searching movies:', error);
    throw error;
  }
};

export const getMovieDetails = async (imdbID: string): Promise<MovieDetail> => {
  if (detailCache.has(imdbID)) {
    return detailCache.get(imdbID)!;
  }

  try {
    const response = await axios.get<MovieDetail>(OMDB_BASE_URL, {
      params: {
        apikey: OMDB_API_KEY,
        i: imdbID,
        plot: 'full',
      },
    });

    if (response.data.Response === 'True') {
      detailCache.set(imdbID, response.data);
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching movie details:', error);
    throw error;
  }
}; 