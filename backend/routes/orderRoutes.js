import express from 'express';
const router = express.Router();
import {
    addOrderItems,
    getOrderById,
    updateOrderStatus,
    getMyOrders,
    getOrders,
} from '../controllers/orderController.js';
import { protect, admin, owner } from '../middlewares/authMiddleware.js';

router.route('/').post(protect, addOrderItems).get(protect, owner, getOrders);
router.route('/myorders').get(protect, getMyOrders);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/status').put(protect, owner, updateOrderStatus);

export default router;
