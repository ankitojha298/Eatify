import mongoose from 'mongoose';

const restaurantSchema = mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    address: { type: String, required: true },
    pinCode: { type: String, required: true },
    imageUrl: { type: String, required: true },
    categories: [{ type: String }], // 'veg', 'non-veg', 'fast food', 'dessert'
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
}, { timestamps: true });

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

export default Restaurant;
