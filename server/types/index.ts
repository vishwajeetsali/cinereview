import mongoose from 'mongoose';

export interface IComment {
    userId: mongoose.Types.ObjectId;
    reviewId: mongoose.Types.ObjectId;
    text: string;
    createdAt?: Date
}

export type Sentiment = "positive" | "negative" | "mixed";

export interface IReview {
    userId: mongoose.Types.ObjectId;
    tmdbId: number;
    movieTitle: string;
    moviePoster?: string;
    rating: number;
    text: string;
    sentiment?: Sentiment;
    sentimentScore?: number;
    likes: mongoose.Types.ObjectId[];
    createdAt?: Date
};

export type Type = "like" | "comment";

export interface INotification {
    userId: mongoose.Types.ObjectId;
    fromUserId: mongoose.Types.ObjectId;
    type: Type;
    reviewId: mongoose.Types.ObjectId;
    read?: boolean;
    createdAt?: Date;
}

export type Role = "user" | "mod" | "admin";

export interface IWatchlistItem {
    tmdbId: number,
    movieTitle?: string,
    moviePoster?: string,
    addedAt?: Date
}

export interface IUser {
    name: string;

    email: string;

    password?: string;

    googleId?: string;

    avatar?: string

    role: Role;

    refreshToken?: string;

    following: mongoose.Types.ObjectId[];

    followers: mongoose.Types.ObjectId[];

    watchlist: IWatchlistItem[];

    createdAt?: Date;
};




export interface IVerdict {
    tmdbId: number,

    verdictText?: string,

    sentimentBreakdown?: {
        positive: number;
        negative: number;
        mixed: number;
    },
    averageRating?: number;
    totalReviews?: number;
    lastUpdated?: Date;
}

export interface AuthUser {
    userId?: string;
    _id?: any;
    name?: string;
    role?: Role;
    [key: string]: any;
}

declare global {
    namespace Express {
        interface User extends AuthUser { }
    }
}