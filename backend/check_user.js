import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import User from './models/User.js';
import Restaurant from './models/Restaurant.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const users = await User.find({ email: /rishi/i });
    const out = [];
    out.push(`Found users: ${users.length}`);
    for (let u of users) {
        const rests = await Restaurant.find({ owner: u._id });
        out.push(`User: ${u.name} | Email: ${u.email} | ID: ${u._id} | Role: ${u.role}`);
        out.push(` - Restaurants owned: ${rests.length}`);
    }
    fs.writeFileSync('result.json', JSON.stringify(out, null, 2));
    process.exit(0);
});
