import mongoose from 'mongoose';
import { IUser } from '../types/index.js';

const userSchema = new mongoose.Schema<IUser>({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
    },
    googleId: {
        type: String,
        index: true
    },
    avatar: {
        type: String
    },
    role: {
        type: String,
        enum: ["user", "mod", "admin"],
        default: "user"
    },
    refreshToken: {
        type: String
    },
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    watchlist: [{
        tmdbId: { type: Number, required: true },
        movieTitle: { type: String },
        moviePoster: { type: String },
        addedAt: { type: Date, default: Date.now }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const User = mongoose.model<IUser>('User', userSchema);

export default User;