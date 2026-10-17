import express from 'express';
import { getMovieCredits, getTrendingMovies, getMoviesByGenre, getPopularMovies, getNowPlayingMovies, searchMovies, getMovieDetails, getSimilarMovies, getPersonDetails, getPersonCredits } from '../controllers/movieController.js';

const router = express.Router();

router.get('/search', searchMovies);
router.get('/popular', getPopularMovies);
router.get('/now-playing', getNowPlayingMovies);
router.get('/trending', getTrendingMovies);
router.get('/genre/:genreId', getMoviesByGenre);
router.get('/similar/:tmdbId', getSimilarMovies);
router.get('/person/:personId', getPersonDetails);
router.get('/person/:personId/credits', getPersonCredits);
router.get('/:tmdbId/credits', getMovieCredits);
router.get('/:tmdbId', getMovieDetails);

export default router;