import mongoose from "mongoose";
import { IComment } from '../types/index.js';

const commentSchema = new mongoose.Schema<IComment>({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reviewId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review',
        required: true
    },
    text: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const Comment = mongoose.model<IComment>("Comment", commentSchema);

export default Comment