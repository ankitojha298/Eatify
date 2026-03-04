import mongoose from 'mongoose';
import User from './models/User.js';
import Restaurant from './models/Restaurant.js';
import dotenv from 'dotenv';
dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("--- All Owners ---");
        const owners = await User.find({ role: 'owner' });
        owners.forEach(o => {
            console.log(`Name: '${o.name}', Email: '${o.email}', ID: '${o._id}'`);
        });

        console.log("\n--- All Restaurants ---");
        const restros = await Restaurant.find({});
        restros.forEach(r => {
            console.log(`Name: '${r.name}', Owner ID: '${r.owner}'`);
        });

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

connectDB();
