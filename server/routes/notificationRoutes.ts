import express from 'express';
import { getNotifications, getUnreadCount, markAsRead } from '../controllers/notificationController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/unread', authMiddleware, getUnreadCount);
router.put('/read', authMiddleware, markAsRead);
router.get('/', authMiddleware, getNotifications);

export default router;