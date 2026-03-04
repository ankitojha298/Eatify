import mongoose from 'mongoose';
import Order from './models/Order.js';
import Restaurant from './models/Restaurant.js';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/localbite';

mongoose.connect(MONGO_URI).then(async () => {
    console.log('Connected to MongoDB');

    const orders = await Order.find().populate('restaurant', 'name owner');
    console.log(`Found ${orders.length} total orders in database.`);

    if (orders.length > 0) {
        for (const order of orders) {
            console.log(`Order ID: ${order._id}`);
            console.log(`  Restaurant: ${order.restaurant ? order.restaurant.name : 'NULL'} (ID: ${order.restaurant ? order.restaurant._id : order.restaurant})`);
            if (order.restaurant) {
                console.log(`  Owner ID: ${order.restaurant.owner}`);
            }
            console.log(`  Order Items: ${order.orderItems.length}`);
        }
    }

    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
