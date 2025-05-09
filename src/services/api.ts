import axios from 'axios';
import { MovieResponse } from '../types/Movie';

const API_KEY = process.env.REACT_APP_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

// Cache for storing search results
const searchCache = new Map<string, SearchResponse>();
const detailCache = new Map<string, MovieDetail>();

export const searchMovies = async (query: string, page: number = 1): Promise<SearchResponse> => {
  const cacheKey = `${query}-${page}`;
  
  if (searchCache.has(cacheKey)) {
    return searchCache.get(cacheKey)!;
  }

  try {
    const response = await axios.get<SearchResponse>(OMDB_API_URL, {
      params: {
        apikey: OMDB_API_KEY,
        s: query,
        page,
      },
    });

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
    const response = await axios.get<MovieDetail>(OMDB_API_URL, {
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