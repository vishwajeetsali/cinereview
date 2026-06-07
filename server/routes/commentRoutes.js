import express from 'express';
import { getComments, deleteComment, addComment } from '../controllers/commentController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:reviewId', getComments);
router.post('/:reviewId', authMiddleware, addComment);
router.delete('/:id', authMiddleware, deleteComment);

export default router;