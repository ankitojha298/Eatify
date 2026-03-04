import asyncHandler from 'express-async-handler';
import Menu from '../models/Menu.js';
import Restaurant from '../models/Restaurant.js';

// @desc    Fetch all menu items for a restaurant
// @route   GET /api/menus/:restaurantId
// @access  Public
const getMenusByRestaurant = asyncHandler(async (req, res) => {
    const menus = await Menu.find({ restaurant: req.params.restaurantId });
    res.json(menus);
});

// @desc    Create a menu item
// @route   POST /api/menus/:restaurantId
// @access  Private/Admin or Owner
const createMenu = asyncHandler(async (req, res) => {
    const restaurant = await Restaurant.findById(req.params.restaurantId);

    if (restaurant) {
        // Enforce that only the owner of the restaurant or an admin can add menu items
        if (restaurant.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            res.status(403);
            throw new Error('Not authorized to add menu items to this restaurant');
        }

        const { name, description, price, imageUrl, isVeg, isAvailable } = req.body;

        const menu = new Menu({
            restaurant: req.params.restaurantId,
            name: name || 'New Menu Item',
            description: description || 'Add a description',
            price: price || 0,
            imageUrl: imageUrl || '/images/sample-menu.jpg',
            isVeg: isVeg !== undefined ? isVeg : true,
            isAvailable: isAvailable !== undefined ? isAvailable : true,
        });

        const createdMenu = await menu.save();
        res.status(201).json(createdMenu);
    } else {
        res.status(404);
        throw new Error('Restaurant not found');
    }
});

// @desc    Update a menu item
// @route   PUT /api/menus/:id
// @access  Private/Admin
const updateMenu = asyncHandler(async (req, res) => {
    const { name, description, price, imageUrl, isVeg, isAvailable } = req.body;

    const menu = await Menu.findById(req.params.id);

    if (menu) {
        menu.name = name;
        menu.description = description;
        menu.price = price;
        menu.imageUrl = imageUrl;
        menu.isVeg = isVeg;
        menu.isAvailable = isAvailable;

        const updatedMenu = await menu.save();
        res.json(updatedMenu);
    } else {
        res.status(404);
        throw new Error('Menu item not found');
    }
});

// @desc    Delete a menu item
// @route   DELETE /api/menus/:id
// @access  Private/Admin
const deleteMenu = asyncHandler(async (req, res) => {
    const menu = await Menu.findById(req.params.id);

    if (menu) {
        await menu.remove();
        res.json({ message: 'Menu item removed' });
    } else {
        res.status(404);
        throw new Error('Menu item not found');
    }
});

export { getMenusByRestaurant, createMenu, updateMenu, deleteMenu };
