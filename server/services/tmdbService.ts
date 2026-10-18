import axios from 'axios';
import { cacheGet, cacheSet } from '../config/redis.js';

const BASE_URL = 'https://api.themoviedb.org/3';

const tmdbAxios = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
    headers: { 'User-Agent': 'Mozilla/5.0' }
});

type ID = number | string;

export const searchMovies = async (query: string, page = 1): Promise<any> => {
    try {
        const cacheKey = `tmdb:search:${query}:${page}`;
        const cached = await cacheGet(cacheKey);
        if (cached) return cached;

        const response = await tmdbAxios.get('/search/movie', {
            params: { api_key: process.env.TMDB_API_KEY, query, page }
        });

        await cacheSet(cacheKey, response.data, { ex: 600 });
        return response.data;
    } catch (error: any) {
        throw new Error(`TMDB search failed: ${error.message}`);
    }
};

export const getMovieDetails = async (tmdbId: ID, retries = 3): Promise<any> => {
    try {
        const cached = await cacheGet(`tmdb:movie:${tmdbId}`);
        if (cached) return cached;

        const response = await tmdbAxios.get(`/movie/${tmdbId}`, {
            params: { api_key: process.env.TMDB_API_KEY }
        });

        await cacheSet(`tmdb:movie:${tmdbId}`, response.data, { ex: 3600 });
        return response.data;
    } catch (error: any) {
        if (retries > 0 && error.code === 'ECONNRESET') {
            await new Promise(r => setTimeout(r, 500));
            return getMovieDetails(tmdbId, retries - 1);
        }
        throw new Error(`TMDB details failed: ${error.message}`);
    }
};

export const getPopularMovies = async (page = 1, retries = 3): Promise<any> => {
    try {
        const cached = await cacheGet(`tmdb:popular:${page}`);
        if (cached) return cached;

        const response = await tmdbAxios.get('/movie/popular', {
            params: { api_key: process.env.TMDB_API_KEY, page }
        });

        await cacheSet(`tmdb:popular:${page}`, response.data, { ex: 600 });
        return response.data;
    } catch (error: any) {
        if (retries > 0 && error.code === 'ECONNRESET') {
            await new Promise(r => setTimeout(r, 500));
            return getPopularMovies(page, retries - 1);
        }
        throw new Error(`TMDB popular failed: ${error.message}`);
    }
};

export const getNowPlayingMovies = async (page = 1, retries = 3): Promise<any> => {
    try {
        const cached = await cacheGet(`tmdb:now_playing:${page}`);
        if (cached) return cached;

        const response = await tmdbAxios.get('/movie/now_playing', {
            params: { api_key: process.env.TMDB_API_KEY, page }
        });

        await cacheSet(`tmdb:now_playing:${page}`, response.data, { ex: 600 });
        return response.data;
    } catch (error: any) {
        if (retries > 0 && error.code === 'ECONNRESET') {
            await new Promise(r => setTimeout(r, 500));
            return getNowPlayingMovies(page, retries - 1);
        }
        throw new Error(`TMDB Now playing failed: ${error.message}`);
    }
};

export const getMoviesByGenre = async (genreId: ID, page = 1, sort_by = 'popularity.desc', retries = 3): Promise<any> => {
    try {
        const cached = await cacheGet(`tmdb:genre:${genreId}:${page}:${sort_by}`);
        if (cached) return cached;

        const response = await tmdbAxios.get('/discover/movie', {
            params: { api_key: process.env.TMDB_API_KEY, with_genres: genreId, page, sort_by }
        });

        await cacheSet(`tmdb:genre:${genreId}:${page}:${sort_by}`, response.data, { ex: 600 });
        return response.data;
    } catch (error: any) {
        if (retries > 0 && error.code === 'ECONNRESET') {
            await new Promise(r => setTimeout(r, 500));
            return getMoviesByGenre(genreId, page, sort_by, retries - 1);
        }
        throw new Error(`TMDB Movies By genre failed: ${error.message}`);
    }
};

export const getTrendingMovies = async (page = 1, retries = 3): Promise<any> => {
    try {
        const cached = await cacheGet(`tmdb:trending:${page}`);
        if (cached) return cached;

        const response = await tmdbAxios.get('/trending/movie/week', {
            params: { api_key: process.env.TMDB_API_KEY, page }
        });

        await cacheSet(`tmdb:trending:${page}`, response.data, { ex: 600 });
        return response.data;
    } catch (error: any) {
        if (retries > 0 && error.code === 'ECONNRESET') {
            await new Promise(r => setTimeout(r, 500));
            return getTrendingMovies(page, retries - 1);
        }
        throw new Error(`TMDB trending failed: ${error.message}`);
    }
};

export const getMovieCredits = async (tmdbId: ID, retries = 3): Promise<any> => {
    try {
        const cached = await cacheGet(`tmdb:credits:${tmdbId}`);
        if (cached) return cached;

        const response = await tmdbAxios.get(`/movie/${tmdbId}/credits`, {
            params: { api_key: process.env.TMDB_API_KEY }
        });

        await cacheSet(`tmdb:credits:${tmdbId}`, response.data, { ex: 3600 });
        return response.data;
    } catch (error: any) {
        if (retries > 0 && error.code === 'ECONNRESET') {
            await new Promise(r => setTimeout(r, 500));
            return getMovieCredits(tmdbId, retries - 1);
        }
        throw new Error(`TMDB credits failed: ${error.message}`);
    }
};

export const getSimilarMovies = async (tmdbId: ID, retries = 3): Promise<any> => {
    try {
        const cached = await cacheGet(`tmdb:similar:${tmdbId}`);
        if (cached) return cached;

        const response = await tmdbAxios.get(`/movie/${tmdbId}/similar`, {
            params: { api_key: process.env.TMDB_API_KEY }
        });

        await cacheSet(`tmdb:similar:${tmdbId}`, response.data, { ex: 3600 });
        return response.data;
    } catch (error: any) {
        if (retries > 0 && error.code === 'ECONNRESET') {
            await new Promise(r => setTimeout(r, 500));
            return getSimilarMovies(tmdbId, retries - 1);
        }
        throw new Error(`TMDB Similar Movies failed: ${error.message}`);
    }
};

export const getPersonDetails = async (personId: ID, retries = 3): Promise<any> => {
    try {
        const cached = await cacheGet(`tmdb:person:${personId}`);
        if (cached) return cached;

        const response = await tmdbAxios.get(`/person/${personId}`, {
            params: { api_key: process.env.TMDB_API_KEY }
        });

        await cacheSet(`tmdb:person:${personId}`, response.data, { ex: 86400 });
        return response.data;
    } catch (error: any) {
        if (retries > 0 && error.code === 'ECONNRESET') {
            await new Promise(r => setTimeout(r, 500));
            return getPersonDetails(personId, retries - 1);
        }
        throw new Error(`TMDB person details failed: ${error.message}`);
    }
};

export const getPersonCredits = async (personId: ID, retries = 3): Promise<any> => {
    try {
        const cached = await cacheGet(`tmdb:person:${personId}:credits`);
        if (cached) return cached;

        const response = await tmdbAxios.get(`/person/${personId}/combined_credits`, {
            params: { api_key: process.env.TMDB_API_KEY }
        });

        await cacheSet(`tmdb:person:${personId}:credits`, response.data, { ex: 86400 });
        return response.data;
    } catch (error: any) {
        if (retries > 0 && error.code === 'ECONNRESET') {
            await new Promise(r => setTimeout(r, 500));
            return getPersonCredits(personId, retries - 1);
        }
        throw new Error(`TMDB person credits failed: ${error.message}`);
    }
};