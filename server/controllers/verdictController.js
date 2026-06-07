import Verdict from "../models/Verdict.js";
import Review from "../models/Review.js";
import { generateVerdict as aiGenerateVerdict } from '../services/aiService.js';
import redis from '../config/redis.js';

export const getVerdict = async (req, res) => {
    try {
        const { tmdbId } = req.params;

        const cached = await redis.get(`verdict:${tmdbId}`);
        if (cached) return res.status(200).json(cached);

        const verdict = await Verdict.findOne({ tmdbId });

        if (!verdict) {
            return res.status(404).json({ message: 'Verdict not found' });
        }

        await redis.set(`verdict:${tmdbId}`, verdict, { ex: 3600 });
        return res.status(200).json(verdict);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Something went wrong. Please try again.' });
    }
};

export const generateVerdict = async (req, res) => {
    try {
        const { tmdbId } = req.params;

        const reviews = await Review.find({ tmdbId });

        if (reviews.length < 1) {
            return res.status(400).json({ message: 'No reviews found for this movie' });
        }

        const verdictText = await aiGenerateVerdict(reviews);

        const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
        const averageRating = Number((totalRating / reviews.length).toFixed(1));

        const sentimentBreakdown = reviews.reduce(
            (acc, review) => {
                const sentiment = review.sentiment;
                if (sentiment === 'positive') acc.positive += 1;
                else if (sentiment === 'negative') acc.negative += 1;
                else if (sentiment === 'mixed') acc.mixed += 1;
                return acc;
            },
            { positive: 0, negative: 0, mixed: 0 }
        );

        const verdict = await Verdict.findOneAndUpdate(
            { tmdbId },
            { tmdbId, verdictText, averageRating, sentimentBreakdown, totalReviews: reviews.length },
            { new: true, upsert: true }
        );

        await redis.del(`verdict:${tmdbId}`);
        return res.status(200).json(verdict);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Something went wrong. Please try again.' });
    }
};