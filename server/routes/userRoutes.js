import express from 'express';
import { getWatchlist, toggleWatchlist, updateProfile, searchUsers, getPublicProfile, getFeed, toggleFollow } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/feed', authMiddleware, getFeed);
router.get('/search', searchUsers);
router.get('/watchlist', authMiddleware, getWatchlist);
router.post('/watchlist/toggle', authMiddleware, toggleWatchlist);
router.put('/profile', authMiddleware, upload.single('avatar'), updateProfile);
router.post('/follow/:userId', authMiddleware, toggleFollow);
router.get('/:userId', getPublicProfile);

export default router;