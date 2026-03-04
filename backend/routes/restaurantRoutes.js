import express from 'express';
const router = express.Router();
import {
    getRestaurants,
    getRestaurantById,
    createRestaurant,
    updateRestaurant,
    deleteRestaurant,
    getMyRestaurants
} from '../controllers/restaurantController.js';
import { protect, owner } from '../middlewares/authMiddleware.js';

router.route('/').get(getRestaurants).post(protect, owner, createRestaurant);
router.route('/myrestaurants').get(protect, owner, getMyRestaurants);
router.route('/:id')
    .get(getRestaurantById)
    .put(protect, owner, updateRestaurant)
    .delete(protect, owner, deleteRestaurant);

export default router;
