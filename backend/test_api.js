import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import axios from 'axios';

dotenv.config();

const testAPI = async () => {
    try {
        const token = jwt.sign({ id: '69a7508253f06436ae790891' }, process.env.JWT_SECRET || 'secret123', {
            expiresIn: '30d',
        });

        console.log('Token created:', token);

        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };

        const ordersRes = await axios.get('http://localhost:5000/api/orders', config);
        console.log('Orders response:', ordersRes.data.length, 'orders');

        const restRes = await axios.get('http://localhost:5000/api/restaurants', config);
        console.log('Restaurants response:', restRes.data.restaurants.length, 'restaurants');

    } catch (e) {
        console.log('Error:', e.response?.data || e.message);
    }
};

testAPI();
