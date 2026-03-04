import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Restaurant from './models/Restaurant.js';
import Menu from './models/Menu.js';
import connectDB from './config/db.js';
import bcrypt from 'bcryptjs';

dotenv.config();
connectDB();

const foodNames = [
    "Margherita Pizza", "Pepperoni Pizza", "BBQ Chicken Pizza", "Hawaiian Pizza", "Veggie Supreme Pizza",
    "Cheeseburger", "Double Bacon Burger", "Mushroom Swiss Burger", "Crispy Chicken Sandwich", "Spicy Fish Filet",
    "Caesar Salad", "Greek Salad", "Cobb Salad", "Caprese Salad", "Spinach & Goat Cheese Salad",
    "Spaghetti Bolognese", "Fettuccine Alfredo", "Penne Arrabbiata", "Lasagna", "Pesto Pasta",
    "Chicken Tikka Masala", "Butter Chicken", "Palak Paneer", "Chana Masala", "Lamb Rogan Josh",
    "Pad Thai", "Green Curry", "Red Curry", "Tom Yum Soup", "Massaman Curry",
    "Sushi Platter", "California Roll", "Spicy Tuna Roll", "Dragon Roll", "Sashimi Deluxe",
    "Beef Tacos", "Chicken Fajitas", "Cheese Enchiladas", "Pork Carnitas", "Steak Quesadilla",
    "Chicken Wings", "Mozzarella Sticks", "Onion Rings", "Nachos Supreme", "Jalapeno Poppers",
    "Chocolate Lava Cake", "New York Cheesecake", "Tiramisu", "Apple Pie", "Ice Cream Sundae",
    "French Fries", "Sweet Potato Fries", "Garlic Bread", "Coleslaw", "Mashed Potatoes",
    "Grilled Salmon", "Fish and Chips", "Shrimp Scampi", "Lobster Tail", "Crab Cakes",
    "Pancakes", "Waffles", "French Toast", "Eggs Benedict", "Omelette",
    "Tomato Soup", "Chicken Noodle Soup", "French Onion Soup", "Minestrone", "Clam Chowder",
    "Chicken Teriyaki", "Beef and Broccoli", "Sweet and Sour Pork", "Kung Pao Chicken", "General Tso's Chicken",
    "Burrito Bowl", "Chicken Shawarma", "Falafel Wrap", "Gyro", "Hummus & Pita",
    "Pork Chops", "Ribeye Steak", "Filet Mignon", "BBQ Ribs", "Roast Chicken",
    "Macaroni and Cheese", "Baked Ziti", "Eggplant Parmesan", "Chicken Parmesan", "Meatballs",
    "Vegetable Stir Fry", "Tofu Scramble", "Vegan Burger", "Quinoa Salad", "Acai Bowl",
    "Smoothie", "Milkshake", "Iced Coffee", "Lemonade", "Iced Tea"
];

const foodDescriptions = [
    "A classic dish made with the freshest ingredients.",
    "Savory and delicious, a fan favorite.",
    "Hearty and filling, perfect for a big appetite.",
    "Light and refreshing, great for a quick bite.",
    "Rich in flavor and cooked to perfection.",
    "A perfect blend of spices and herbs.",
    "Creamy, cheesy, and absolutely delightful.",
    "Crispy on the outside, tender on the inside.",
    "Sweet and satisfying, a great way to end a meal.",
    "A healthy choice packed with nutrients.",
    "A traditional recipe passed down through generations.",
    "A modern twist on a classic favorite.",
    "Locally sourced ingredients for the best taste.",
    "A comforting classic that never disappoints.",
    "An adventurous option for those looking to try something new."
];

const foodImages = [
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1499028344343-cd173ffc68a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1552539618-7eec9b4d1796?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1528669826296-bdfa27b409cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1565958011703-44f9829ba187?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
];

const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];
const getRandomPrice = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

const importData = async () => {
    try {
        await User.deleteMany();
        await Restaurant.deleteMany();
        await Menu.deleteMany();

        const createdUsers = await User.insertMany([
            {
                name: 'Admin User',
                email: 'admin@example.com',
                password: await bcrypt.hash('123456', 10),
                role: 'admin',
            },
            {
                name: 'John Doe',
                email: 'john@example.com',
                password: await bcrypt.hash('123456', 10),
                role: 'user',
            }
        ]);

        const adminUser = createdUsers[0]._id;

        const sampleRestaurants = [
            {
                name: 'The Grand Feast',
                imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                description: 'A premium dining experience with a vast multi-cuisine menu.',
                address: '101 Fine Dine Blvd, Gourmet City',
                categories: ['veg', 'non-veg', 'dessert'],
                owner: adminUser,
                rating: 4.8,
                numReviews: 45,
            },
            {
                name: 'Quick Bite Diner',
                imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                description: 'Your stop for the fastest and tastiest comfort food.',
                address: '222 Fast Lane, Speedy Town',
                categories: ['fast food', 'non-veg'],
                owner: adminUser,
                rating: 4.3,
                numReviews: 89,
            },
            {
                name: 'Spicy Grill',
                imageUrl: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                description: 'Best grilled food in town with authentic spices.',
                address: '123 Main Street, Cityville',
                categories: ['non-veg', 'fast food'],
                owner: adminUser,
                rating: 4.5,
                numReviews: 12,
            },
            {
                name: 'Green Leaf Cafe',
                imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                description: 'Fresh and organic vegetarian meals for a healthy lifestyle.',
                address: '456 Green Avenue, Veggie Town',
                categories: ['veg'],
                owner: adminUser,
                rating: 4.8,
                numReviews: 8,
            },
            {
                name: 'Sweet Tooth Bakery',
                imageUrl: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                description: 'Delicious desserts, cakes, and pastries out of the oven.',
                address: '789 Sugar Lane, Candyland',
                categories: ['dessert'],
                owner: adminUser,
                rating: 4.2,
                numReviews: 5,
            }
        ];

        const createdRestaurants = await Restaurant.insertMany(sampleRestaurants);

        const generatedMenus = [];

        // Distribute 100 items across all restaurants
        for (let i = 0; i < 100; i++) {
            // Pick a random restaurant ID
            const restaurantId = getRandomElement(createdRestaurants)._id;

            generatedMenus.push({
                restaurant: restaurantId,
                name: getRandomElement(foodNames),
                description: getRandomElement(foodDescriptions),
                price: getRandomPrice(100, 800),
                imageUrl: getRandomElement(foodImages),
                isVeg: Math.random() > 0.5,
                isAvailable: true,
            });
        }

        await Menu.insertMany(generatedMenus);

        console.log('100 Food items and restaurants Imported!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

importData();
