import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/localbite').then(async () => {
    const user = await User.findOne({ email: 'rohit45@gmail.com' });
    if (!user) {
        console.log('User rohit45@gmail.com NOT FOUND in database.');
    } else {
        console.log('User found:', user.name, user.email, 'Role:', user.role);
        user.password = '123456';
        await user.save();
        console.log('Password has been reset to 123456');
    }
    process.exit();
}).catch(console.error);
