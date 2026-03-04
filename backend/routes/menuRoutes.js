import express from 'express';
const router = express.Router();
import {
    getMenusByRestaurant,
    createMenu,
    updateMenu,
    deleteMenu,
} from '../controllers/menuController.js';
import { protect, owner } from '../middlewares/authMiddleware.js';

router.route('/:restaurantId').get(getMenusByRestaurant).post(protect, owner, createMenu);
router.route('/:id').put(protect, owner, updateMenu).delete(protect, owner, deleteMenu);

export default router;
