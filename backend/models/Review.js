import mongoose from 'mongoose';

const reviewSchema = mongoose.Schema({
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
}, { timestamps: true });

const Review = mongoose.model('Review', reviewSchema);

export default Review;
