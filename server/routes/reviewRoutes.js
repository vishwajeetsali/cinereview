import express from 'express';
import { getUserReviews, createReview, getMovieReview, deleteReview, editReview, toggleLike } from '../controllers/reviewController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { rateLimitMiddleware } from '../middleware/rateLimiter.js';

const router = express.Router();

router.get('/user/me', authMiddleware, getUserReviews);
router.post('/', authMiddleware, rateLimitMiddleware, createReview);
router.get('/:tmdbId', getMovieReview);
router.delete('/:id', authMiddleware, deleteReview);
router.put('/:id', authMiddleware, editReview);
router.post('/:id/like', authMiddleware, toggleLike);

export default router;