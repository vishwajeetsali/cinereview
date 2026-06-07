import xss from 'xss';
import User from '../models/User.js';
import Comment from '../models/Comment.js';
import Review from '../models/Review.js';
import Notification from '../models/Notification.js';
import mongoose from 'mongoose';

let io;
export const setIO = (ioInstance) => { io = ioInstance; };

export const getComments = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const comments = await Comment.find({ reviewId })
            .populate('userId', 'name avatar')
            .sort({ createdAt: 1 });
        return res.status(200).json(comments);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Something went wrong. Please try again.' });
    }
};

export const addComment = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { userId } = req.user;
        const sanitizedText = xss(req.body.text);

        if (!sanitizedText?.trim()) {
            return res.status(400).json({ message: 'Comment text is required.' });
        }

        const comment = await Comment.create({ reviewId, userId, text: sanitizedText });
        await comment.populate('userId', 'name avatar');

        const review = await Review.findById(reviewId);
        if (review && review.userId.toString() !== userId) {
            await Notification.create({
                userId: review.userId,
                fromUserId: userId,
                type: 'comment',
                reviewId: new mongoose.Types.ObjectId(reviewId)
            });
            if (io) io.to(`user_${review.userId}`).emit('newNotification');
        }

        if (io) io.to(`review_${reviewId}`).emit('newComment', comment);
        return res.status(200).json(comment);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Something went wrong. Please try again.' });
    }
};

export const deleteComment = async (req, res) => {
    try {
        const { id } = req.params;
        const comment = await Comment.findById(id);
        if (!comment) return res.status(404).json({ message: 'Not Found' });

        const user = await User.findById(req.user.userId);
        if (comment.userId.toString() === req.user.userId || user.role === 'admin' || user.role === 'mod') {
            await Comment.findByIdAndDelete(id);
        } else {
            return res.status(403).json({ message: 'Forbidden' });
        }

        return res.status(200).json({ message: 'Successfully deleted comment' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Something went wrong. Please try again.' });
    }
};