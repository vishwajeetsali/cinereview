import xss from 'xss';
import Review from '../models/Review.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import mongoose from 'mongoose';
import { analyzeSentiment, generateVerdict as aiGenerateVerdict } from '../services/aiService.js';
import Verdict from '../models/Verdict.js';
import { sendVerdictNotification } from '../services/emailService.js';

let io;

export const setIO = (socketIO) => {
    io = socketIO;
};

export const createReview = async (req, res) => {
    try {
        const { tmdbId, movieTitle, moviePoster, rating, text } = req.body;
        const { userId } = req.user;

        if (!tmdbId || !movieTitle || !rating || !text) {
            return res.status(400).json({ message: 'tmdbId, movieTitle, rating and text are required.' });
        }
        if (rating < 1 || rating > 10) {
            return res.status(400).json({ message: 'Rating must be between 1 and 10.' });
        }

        const sanitizedText = xss(text);

        const review = await Review.create({
            userId, tmdbId, movieTitle, moviePoster, rating, text: sanitizedText
        });

        const sentiment = await analyzeSentiment(sanitizedText);
        review.sentiment = sentiment.sentiment;
        review.sentimentScore = sentiment.score;
        await review.save();

        const populatedReview = await review.populate('userId', 'name avatar');
        if (io) io.to(`movie_${tmdbId}`).emit('newReview', populatedReview);

        const reviewCount = await Review.countDocuments({ tmdbId });
        if (reviewCount % 10 === 0) {
            const reviews = await Review.find({ tmdbId });
            const verdictText = await aiGenerateVerdict(reviews);
            const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
            const averageRating = Number((totalRating / reviews.length).toFixed(1));
            const sentimentBreakdown = reviews.reduce((acc, r) => {
                if (r.sentiment) acc[r.sentiment] += 1;
                return acc;
            }, { positive: 0, negative: 0, mixed: 0 });

            const updatedVerdict = await Verdict.findOneAndUpdate(
                { tmdbId },
                { tmdbId, verdictText, averageRating, sentimentBreakdown, totalReviews: reviewCount, lastUpdated: new Date() },
                { new: true, upsert: true }
            );
            if (io) io.to(`movie_${tmdbId}`).emit('verdictUpdated', updatedVerdict);

            const userIds = await Review.distinct('userId', { tmdbId });
            const users = await User.find({ _id: { $in: userIds } }).select('email name');
            for (const u of users) {
                await sendVerdictNotification(u.email, u.name, movieTitle);
            }
        }

        return res.status(201).json(review);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Something went wrong. Please try again.' });
    }
};

export const getMovieReview = async (req, res) => {
    try {
        const { tmdbId } = req.params;
        const reviews = await Review.find({ tmdbId }).populate('userId', 'name avatar');
        return res.status(200).json(reviews);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Something went wrong. Please try again.' });
    }
};

export const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const review = await Review.findById(id);
        if (!review) return res.status(404).json({ message: 'Not Found' });

        const user = await User.findById(req.user.userId);
        if (review.userId.toString() === req.user.userId || user.role === 'admin' || user.role === 'mod') {
            await Review.findByIdAndDelete(id);
        } else {
            return res.status(403).json({ message: 'Forbidden' });
        }

        return res.status(200).json({ message: 'Successfully deleted review' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Something went wrong. Please try again.' });
    }
};

export const getUserReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ userId: req.user.userId }).sort({ createdAt: -1 });
        return res.status(200).json(reviews);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Something went wrong. Please try again.' });
    }
};

export const editReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, text } = req.body;

        const review = await Review.findById(id);
        if (!review) return res.status(404).json({ message: 'Review not found' });
        if (review.userId.toString() !== req.user.userId) return res.status(403).json({ message: 'Forbidden' });

        const sanitizedText = xss(text);
        review.rating = rating;
        review.text = sanitizedText;

        const sentiment = await analyzeSentiment(sanitizedText);
        review.sentiment = sentiment.sentiment;
        review.sentimentScore = sentiment.score;

        await review.save();
        return res.status(200).json(review);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Something went wrong. Please try again.' });
    }
};

export const toggleLike = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) return res.status(404).json({ message: 'Review not found' });

        if (review.likes.includes(req.user.userId)) {
            await Review.findByIdAndUpdate(req.params.id, { $pull: { likes: req.user.userId } });
            return res.json({ liked: false, likeCount: review.likes.length - 1 });
        } else {
            await Review.findByIdAndUpdate(req.params.id, { $addToSet: { likes: req.user.userId } });
            if (review.userId.toString() !== req.user.userId) {
                await Notification.create({
                    userId: review.userId,
                    fromUserId: req.user.userId,
                    type: 'like',
                    reviewId: new mongoose.Types.ObjectId(req.params.id)
                });
                if (io) io.to(`user_${review.userId}`).emit('newNotification');
            }
            return res.json({ liked: true, likeCount: review.likes.length + 1 });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Something went wrong. Please try again.' });
    }
};