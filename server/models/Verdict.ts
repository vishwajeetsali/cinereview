import mongoose from 'mongoose';
import { IVerdict } from '../types/index.js';
const verdictSchema = new mongoose.Schema<IVerdict>({
    tmdbId: {
        type: Number,
        required: true,
        unique: true
    },
    verdictText: String,
    sentimentBreakdown: {
        positive: { type: Number, default: 0 },
        negative: { type: Number, default: 0 },
        mixed: { type: Number, default: 0 }
    },
    averageRating: {
        type: Number
    },
    totalReviews: {
        type: Number,
        default: 0
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
})

const Verdict = mongoose.model<IVerdict>('Verdict', verdictSchema);

export default Verdict