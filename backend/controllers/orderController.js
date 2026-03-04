import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import Restaurant from '../models/Restaurant.js';
import sendEmail from '../utils/sendEmail.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
    const { restaurant, orderItems, totalAmount, paymentDetails } = req.body;

    if (orderItems && orderItems.length === 0) {
        res.status(400);
        throw new Error('No order items');
    } else {
        const order = new Order({
            orderItems,
            user: req.user._id,
            restaurant,
            totalAmount,
            paymentDetails,
        });

        const createdOrder = await order.save();

        // Immediate Message/Notification to Restaurant Owner
        try {
            const restaurantDoc = await Restaurant.findById(restaurant).populate('owner', 'email name');
            if (restaurantDoc && restaurantDoc.owner && restaurantDoc.owner.email) {
                const ownerEmail = restaurantDoc.owner.email;

                const emailSubject = `New Order Placed: ₹${totalAmount}`;
                const emailHtml = `
                    <div style="font-family: Arial, sans-serif; padding: 20px;">
                        <h2 style="color: #ea580c;">Eatify: You have a new order!</h2>
                        <p><strong>Restaurant:</strong> ${restaurantDoc.name}</p>
                        <p><strong>Total Amount:</strong> ₹${totalAmount}</p>
                        <h3>Order Items:</h3>
                        <ul>
                            ${orderItems.map(item => `<li>${item.quantity}x ${item.name} - ₹${item.price}</li>`).join('')}
                        </ul>
                        <br/>
                        <p>Please check your Owner Dashboard for more details.</p>
                    </div>
                `;

                await sendEmail({
                    email: ownerEmail,
                    subject: emailSubject,
                    text: `You received a new order for ₹${totalAmount}. Please check your Eatify dashboard.`,
                    html: emailHtml
                });
            }
        } catch (emailError) {
            console.error('Failed to send owner notification email:', emailError);
            // We don't throw an error here to prevent failing the order creation if only the email fails
        }

        res.status(201).json(createdOrder);
    }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate('user', 'name email')
        .populate('restaurant', 'name');

    if (order) {
        res.json(order);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id });
    res.json(orders);
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        order.status = req.body.status || order.status;
        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Get all orders (Admin or Owner)
// @route   GET /api/orders
// @access  Private/Owner
const getOrders = asyncHandler(async (req, res) => {
    if (req.user.role === 'admin') {
        const orders = await Order.find({}).populate('user', 'id name');
        res.json(orders);
    } else if (req.user.role === 'owner') {
        const ownerRestaurants = await Restaurant.find({ owner: req.user._id });
        const restaurantIds = ownerRestaurants.map(r => r._id);

        const orders = await Order.find({ restaurant: { $in: restaurantIds } }).populate('user', 'id name');
        res.json(orders);
    } else {
        res.status(403);
        throw new Error('Not authorized to view orders');
    }
});

export { addOrderItems, getOrderById, updateOrderStatus, getMyOrders, getOrders };
