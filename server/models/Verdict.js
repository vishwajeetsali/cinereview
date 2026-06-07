import mongoose from 'mongoose';

const verdictSchema = new mongoose.Schema({
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

const Verdict = mongoose.model('Verdict', verdictSchema);

export default Verdict