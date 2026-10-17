import Notification from '../models/Notification.js'
import { Request, Response } from 'express';


export const getNotifications = async (req: Request, res: Response) => {
    try {
        const notifications = await Notification
            .find({ userId: req.user.userId })
            .populate('fromUserId', 'name avatar')
            .sort({ createdAt: -1 })
            .limit(20);
        return res.status(200).json(notifications);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Something went wrong. Please try again.' });
    }
};

export const markAsRead = async (req: Request, res: Response) => {
    try {
        await Notification.updateMany(
            { userId: req.user.userId, read: false },
            { $set: { read: true } }
        );
        return res.status(200).json({ message: 'Marked all as read' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Something went wrong. Please try again.' });
    }
};

export const getUnreadCount = async (req: Request, res: Response) => {
    try {
        const count = await Notification.countDocuments({
            userId: req.user.userId,
            read: false
        });
        return res.status(200).json({ count });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Something went wrong. Please try again.' });
    }
};