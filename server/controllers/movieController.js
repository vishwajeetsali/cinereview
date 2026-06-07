import { getPersonCredits as tmdbPersonCredits, getPersonDetails as tmdbPersonDetails, getSimilarMovies as tmdbSimilarMovies, getMovieCredits as tmdbCredits, getTrendingMovies as tmdbTrendingMovies, getMoviesByGenre as tmdbMoviesByGenre, getPopularMovies as tmdbPopular, getNowPlayingMovies as tmdbNowPlaying, searchMovies as tmdbSearch, getMovieDetails as tmdbGetDetails } from "../services/tmdbService.js";

export const searchMovies = async (req, res) => {
    try {
        const { q, page = 1 } = req.query;
        if (!q) return res.status(400).json({ message: 'Query required' });
        const movies = await tmdbSearch(q, page);
        return res.status(200).json(movies);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Something went wrong. Please try again.' });
    }
};

export const getMovieDetails = async (req, res) => {
    try {
        const { tmdbId } = req.params;
        const movie = await tmdbGetDetails(tmdbId);
        return res.status(200).json(movie);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Something went wrong. Please try again.' });
    }
};

export const getPopularMovies = async (req, res) => {
    try {
        const { page = 1 } = req.query;
        const movies = await tmdbPopular(page);
        return res.status(200).json(movies);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Something went wrong. Please try again.' });
    }
};

export const getNowPlayingMovies = async (req, res) => {
    try {
        const { page = 1 } = req.query;
        const movies = await tmdbNowPlaying(page);
        return res.status(200).json(movies);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Something went wrong. Please try again.' });
    }
};

export const getMoviesByGenre = async (req, res) => {
    try {
        const { genreId } = req.params;
        const { page = 1, sort = 'popularity.desc' } = req.query;
        const movies = await tmdbMoviesByGenre(genreId, page, sort);
        return res.status(200).json(movies);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Something went wrong. Please try again.' });
    }
};

export const getTrendingMovies = async (req, res) => {
    try {
        const { page = 1 } = req.query;
        const movies = await tmdbTrendingMovies(page);
        return res.status(200).json(movies);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Something went wrong. Please try again.' });
    }
};

export const getMovieCredits = async (req, res) => {
    try {
        const { tmdbId } = req.params;
        const credits = await tmdbCredits(tmdbId);
        return res.status(200).json(credits);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Something went wrong. Please try again.' });
    }
};

export const getSimilarMovies = async (req, res) => {
    try {
        const { tmdbId } = req.params;
        const movies = await tmdbSimilarMovies(tmdbId);
        return res.status(200).json(movies);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Something went wrong. Please try again.' });
    }
};

export const getPersonDetails = async (req, res) => {
    try {
        const { personId } = req.params;
        const details = await tmdbPersonDetails(personId);
        return res.status(200).json(details);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Something went wrong. Please try again.' });
    }
};

export const getPersonCredits = async (req, res) => {
    try {
        const { personId } = req.params;
        const credits = await tmdbPersonCredits(personId);
        return res.status(200).json({
            cast: credits.cast.sort((a, b) => b.popularity - a.popularity),
            crew: credits.crew
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Something went wrong. Please try again.' });
    }
};