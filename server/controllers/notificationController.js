import Notification from '../models/Notification.js'

export const getNotifications = async (req, res) => {
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

export const markAsRead = async (req, res) => {
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

export const getUnreadCount = async (req, res) => {
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