import express from 'express';
const router = express.Router();
import { createReview, getReviews } from '../controllers/reviewController.js';
import { protect } from '../middlewares/authMiddleware.js';

router.route('/:restaurantId').post(protect, createReview).get(getReviews);

export default router;
