import mongoose from 'mongoose';

const menuSchema = mongoose.Schema({
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    imageUrl: { type: String, required: true },
    isVeg: { type: Boolean, required: true },
    isAvailable: { type: Boolean, default: true },
}, { timestamps: true });

const Menu = mongoose.model('Menu', menuSchema);

export default Menu;
