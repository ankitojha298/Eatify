import mongoose from 'mongoose';
import Order from './models/Order.js';
import Restaurant from './models/Restaurant.js';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/localbite';

mongoose.connect(MONGO_URI).then(async () => {
    const orders = await Order.find().populate('restaurant', 'name owner');
    let data = [];

    if (orders.length > 0) {
        for (const order of orders) {
            data.push({
                orderId: order._id,
                restaurantName: order.restaurant ? order.restaurant.name : 'NULL',
                restaurantId: order.restaurant ? order.restaurant._id : order.restaurant,
                ownerId: order.restaurant ? order.restaurant.owner : null,
                itemsCount: order.orderItems.length
            });
        }
    }

    fs.writeFileSync('orders_debug.json', JSON.stringify(data, null, 2));
    console.log('Saved to orders_debug.json');
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
