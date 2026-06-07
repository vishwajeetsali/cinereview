import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tmdbId: {
        type: Number,
        required: true,
        index: true
    },
    movieTitle: {
        type: String,
        required: true
    },
    moviePoster: {
        type: String
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 10
    },
    text: {
        type: String,
        required: true
    },
    sentiment: {
        type: String,
        enum: ['positive', 'negative', 'mixed']
    },
    sentimentScore: {
        type: Number
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const Review = mongoose.model("Review", reviewSchema);

export default Review