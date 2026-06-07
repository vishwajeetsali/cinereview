import express from 'express';
import { getVerdict, generateVerdict } from '../controllers/verdictController.js';
import { authMiddleware } from '../middleware/authMiddleware.js'
import requireRole from '../middleware/roleMiddleware.js'

const router = express.Router();

router.get('/:tmdbId', getVerdict);
router.post('/generate/:tmdbId', authMiddleware, requireRole('admin', 'mod'), generateVerdict);

export default router;