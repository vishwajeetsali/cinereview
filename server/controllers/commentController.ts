import xss from 'xss';
import User from '../models/User.js';
import Comment from '../models/Comment.js';
import Review from '../models/Review.js';
import Notification from '../models/Notification.js';
import mongoose from 'mongoose';
import { Request, Response } from 'express';


let io: any;
export const setIO = (ioInstance: any) => { io = ioInstance; };

export const getComments = async (req: Request, res: Response) => {
    try {
        const reviewId = req.params.reviewId as string;
        if (!mongoose.Types.ObjectId.isValid(reviewId)) {
            return res.status(400).json({ message: 'Invalid review ID format' });
        }

        const comments = await Comment.find({ reviewId })
            .populate('userId', 'name avatar')
            .sort({ createdAt: 1 });
        return res.status(200).json(comments);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Something went wrong. Please try again.' });
    }
};

export const addComment = async (req: Request, res: Response) => {
    try {
        const reviewId = req.params.reviewId as string;
        if (!mongoose.Types.ObjectId.isValid(reviewId)) {
            return res.status(400).json({ message: 'Invalid review ID format' });
        }

        const userId = req.user!.userId;
        const text = req.body.text;
        if (!text || typeof text !== 'string' || !text.trim()) {
            return res.status(400).json({ message: 'Comment text is required.' });
        }

        const sanitizedText = xss(text.trim());
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

export const deleteComment = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        if (!id || typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid comment ID format' });
        }

        const comment = await Comment.findById(id);
        if (!comment) return res.status(404).json({ message: 'Not Found' });

        const user = await User.findById(req.user!.userId);
        if (comment.userId.toString() === req.user!.userId || user?.role === 'admin' || user?.role === 'mod') {
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