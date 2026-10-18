export type Role = "user" | "mod" | "admin";

export interface User {
    id?: string;
    _id?: string;
    name: string;
    email: string;
    role: Role;
    avatar?: string | null;
    followers?: string[];
    following?: string[];
}

export interface Movie {
    id: number;
    title: string;
    poster_path?: string;
    backdrop_path?: string;
    overview?: string;
    release_date?: string;
    vote_average?: number;
    genre_ids?: number[];
    [key: string]: any;
}

export type Sentiment = "positive" | "negative" | "mixed";

export interface ReviewUser {
    _id: string;
    name: string;
    avatar?: string;
}

export interface Review {
    _id: string;
    userId: ReviewUser | string;
    tmdbId: number;
    movieTitle: string;
    moviePoster?: string;
    rating: number;
    text: string;
    sentiment?: Sentiment;
    sentimentScore?: number;
    likes: string[];
    createdAt: string;
}

export interface Comment {
    _id: string;
    userId: ReviewUser;
    reviewId: string;
    text: string;
    createdAt: string;
}
export type NotificationType = "like" | "comment";

export interface Notification {
    _id: string;
    userId: string;
    fromUserId: { _id: string; name: string; avatar?: string };
    type: NotificationType;
    reviewId: string;
    read: boolean;
    createdAt: string;
}

export interface Verdict {
    _id?: string;
    tmdbId: number;
    verdictText?: string;
    sentimentBreakdown?: {
        positive: number;
        negative: number;
        mixed: number;
    };
    averageRating?: number;
    totalReviews?: number;
    lastUpdated?: string;
}