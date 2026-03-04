import mongoose from 'mongoose';

const orderSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    orderItems: [
        {
            menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu', required: true },
            name: { type: String, required: true },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true },
        }
    ],
    totalAmount: { type: Number, required: true },
    paymentDetails: {
        id: { type: String },
        status: { type: String },
        update_time: { type: String },
        email_address: { type: String },
    },
    status: { type: String, enum: ['Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'], default: 'Preparing' },
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

export default Order;
