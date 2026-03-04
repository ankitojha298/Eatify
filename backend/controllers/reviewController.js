import asyncHandler from 'express-async-handler';
import Review from '../models/Review.js';
import Restaurant from '../models/Restaurant.js';

// @desc    Create new review
// @route   POST /api/reviews/:restaurantId
// @access  Private
const createReview = asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;
    const restaurantId = req.params.restaurantId;

    const restaurant = await Restaurant.findById(restaurantId);

    if (restaurant) {
        const alreadyReviewed = await Review.findOne({
            restaurant: restaurantId,
            user: req.user._id,
        });

        if (alreadyReviewed) {
            res.status(400);
            throw new Error('Restaurant already reviewed');
        }

        const review = new Review({
            name: req.user.name,
            rating: Number(rating),
            comment,
            user: req.user._id,
            restaurant: restaurantId,
        });

        await review.save();

        // Update restaurant rating
        const reviews = await Review.find({ restaurant: restaurantId });
        restaurant.numReviews = reviews.length;
        restaurant.rating =
            reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

        await restaurant.save();

        res.status(201).json({ message: 'Review added' });
    } else {
        res.status(404);
        throw new Error('Restaurant not found');
    }
});

// @desc    Get all reviews for a restaurant
// @route   GET /api/reviews/:restaurantId
// @access  Public
const getReviews = asyncHandler(async (req, res) => {
    const reviews = await Review.find({ restaurant: req.params.restaurantId });
    res.json(reviews);
});

export { createReview, getReviews };
