import { getPersonCredits as tmdbPersonCredits, getPersonDetails as tmdbPersonDetails, getSimilarMovies as tmdbSimilarMovies, getMovieCredits as tmdbCredits, getTrendingMovies as tmdbTrendingMovies, getMoviesByGenre as tmdbMoviesByGenre, getPopularMovies as tmdbPopular, getNowPlayingMovies as tmdbNowPlaying, searchMovies as tmdbSearch, getMovieDetails as tmdbGetDetails } from "../services/tmdbService.js";
import { Request, Response } from "express";

export const searchMovies = async (req: Request, res: Response) => {
    try {
        const q = (req.query.q || req.query.query) as string;
        const page = req.query.page || 1;
        if (!q) return res.status(400).json({ message: 'Query required' });
        const movies = await tmdbSearch(q, Number(page));
        return res.status(200).json(movies);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Something went wrong. Please try again.' });
    }
};

export const getMovieDetails = async (req: Request, res: Response) => {
    try {
        const tmdbId = req.params.tmdbId as string;
        const movie = await tmdbGetDetails(tmdbId);
        return res.status(200).json(movie);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Something went wrong. Please try again.' });
    }
};

export const getPopularMovies = async (req: Request, res: Response) => {
    try {
        const { page = 1 } = req.query;
        const movies = await tmdbPopular(Number(page));
        return res.status(200).json(movies);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Something went wrong. Please try again.' });
    }
};

export const getNowPlayingMovies = async (req: Request, res: Response) => {
    try {
        const { page = 1 } = req.query;
        const movies = await tmdbNowPlaying(Number(page));
        return res.status(200).json(movies);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Something went wrong. Please try again.' });
    }
};

export const getMoviesByGenre = async (req: Request, res: Response) => {
    try {
        const genreId = req.params.genreId as string;
        const { page = 1, sort = 'popularity.desc' } = req.query;
        const movies = await tmdbMoviesByGenre(genreId, Number(page), sort as string);
        return res.status(200).json(movies);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Something went wrong. Please try again.' });
    }
};

export const getTrendingMovies = async (req: Request, res: Response) => {
    try {
        const { page = 1 } = req.query;
        const movies = await tmdbTrendingMovies(Number(page));
        return res.status(200).json(movies);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Something went wrong. Please try again.' });
    }
};

export const getMovieCredits = async (req: Request, res: Response) => {
    try {
        const tmdbId = req.params.tmdbId as string;
        const credits = await tmdbCredits(tmdbId);
        return res.status(200).json(credits);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Something went wrong. Please try again.' });
    }
};

export const getSimilarMovies = async (req: Request, res: Response) => {
    try {
        const tmdbId = req.params.tmdbId as string;
        const movies = await tmdbSimilarMovies(tmdbId);
        return res.status(200).json(movies);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Something went wrong. Please try again.' });
    }
};

export const getPersonDetails = async (req: Request, res: Response) => {
    try {
        const personId = req.params.personId as string;
        const details = await tmdbPersonDetails(personId);
        return res.status(200).json(details);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Something went wrong. Please try again.' });
    }
};

export const getPersonCredits = async (req: Request, res: Response) => {
    try {
        const personId = req.params.personId as string;
        const credits = await tmdbPersonCredits(personId);
        return res.status(200).json({
            cast: credits.cast.sort((a: any, b: any) => b.popularity - a.popularity),
            crew: credits.crew
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Something went wrong. Please try again.' });
    }
};