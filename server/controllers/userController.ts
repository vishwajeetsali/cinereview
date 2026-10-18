import User from '../models/User.js';
import Review from '../models/Review.js';
import { sendFollowNotification } from '../services/emailService.js';
import sanitizeHtml from 'sanitize-html';
import { Request, Response } from 'express';

export const getPublicProfile = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId)
            .select('-password -refreshToken -email')
            .populate('following', 'name avatar')
            .populate('followers', 'name avatar');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const reviews = await Review.find({ userId }).sort({ createdAt: -1 }).limit(10);
        const reviewCount = await Review.countDocuments({ userId });

        return res.json({ user, reviews, reviewCount });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Something went wrong. Please try again.' });
    }
};

export const toggleFollow = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user!.userId;

        if (!currentUserId || userId === currentUserId.toString()) {
            return res.status(400).json({ message: "Cannot follow Yourself" });
        }

        const targetUser = await User.findById(userId);
        if (!targetUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const isFollowing = targetUser.followers.some(id => id.toString() === currentUserId);
        if (isFollowing) {
            await User.findByIdAndUpdate(userId, { $pull: { followers: currentUserId } });
            await User.findByIdAndUpdate(currentUserId, { $pull: { following: userId } });
        } else {
            await User.findByIdAndUpdate(userId, { $addToSet: { followers: currentUserId } });
            await User.findByIdAndUpdate(currentUserId, { $addToSet: { following: userId } });
        }

        if (!isFollowing) {
            try {
                const currentUser = await User.findById(currentUserId).select('name');
                if (currentUser) {
                    await sendFollowNotification(targetUser.email, targetUser.name, currentUser.name);
                }
            } catch {
                // email failure shouldn't break follow
            }
        }

        return res.json({ following: !isFollowing, message: !isFollowing ? 'Followed' : 'Unfollowed' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Something went wrong. Please try again.' });
    }
};

export const getFeed = async (req: Request, res: Response) => {
    try {
        const currentUser = await User.findById(req.user!.userId).select('following');
        if (!currentUser) return res.status(404).json({ message: 'User not found' });

        const page = parseInt(req.query.page as string) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        const reviews = await Review.find({ userId: { $in: currentUser.following } })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('userId', 'name avatar');

        const totalCount = await Review.countDocuments({ userId: { $in: currentUser.following } });

        return res.json({ reviews, totalCount, page, totalPages: Math.ceil(totalCount / limit) });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Something went wrong. Please try again.' });
    }
};

export const searchUsers = async (req: Request, res: Response) => {
    try {
        const q = req.query.q as string;
        if (!q) return res.status(200).json([]);

        const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const users = await User.find({ name: { $regex: escaped, $options: 'i' } })
            .select('name avatar _id')
            .limit(10);

        return res.status(200).json(users);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Something went wrong. Please try again.' });
    }
};

export const updateProfile = async (req: Request, res: Response) => {
    try {
        const updates: Record<string, any> = {};
        if (req.body.name) {
            const cleanName = sanitizeHtml(req.body.name, { allowedTags: [], allowedAttributes: {} }).trim();
            if (!cleanName) return res.status(400).json({ message: 'Invalid name' });
            updates.name = cleanName;
        }
        if (req.file) updates.avatar = req.file.path;

        const user = await User.findByIdAndUpdate(
            req.user!.userId,
            updates,
            { new: true }
        ).select('-password -refreshToken');

        return res.json(user);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Something went wrong. Please try again.' });
    }
};

export const toggleWatchlist = async (req: Request, res: Response) => {
    try {
        const { tmdbId, movieTitle, moviePoster } = req.body;
        const user = await User.findById(req.user!.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
        const alreadyInList = user.watchlist.some(item => item.tmdbId === Number(tmdbId));

        if (alreadyInList) {
            await User.findByIdAndUpdate(req.user!.userId, {
                $pull: { watchlist: { tmdbId: Number(tmdbId) } }
            });
        } else {
            await User.findByIdAndUpdate(req.user!.userId, {
                $push: { watchlist: { tmdbId: Number(tmdbId), movieTitle, moviePoster, addedAt: new Date() } }
            });
        }

        return res.json({ inWatchlist: !alreadyInList });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Something went wrong. Please try again.' });
    }
};

export const getWatchlist = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.user!.userId).select('watchlist');
        if (!user) return res.status(404).json({ message: 'User not found' });
        const sorted = user.watchlist.sort((a, b) => new Date(b.addedAt || 0).getTime() - new Date(a.addedAt || 0).getTime());
        return res.json(sorted);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Something went wrong. Please try again.' });
    }
};