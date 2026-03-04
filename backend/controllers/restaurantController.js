import asyncHandler from 'express-async-handler';
import Restaurant from '../models/Restaurant.js';

// @desc    Fetch all restaurants
// @route   GET /api/restaurants
// @access  Public
const getRestaurants = asyncHandler(async (req, res) => {
    const pageSize = 10;
    const page = Number(req.query.pageNumber) || 1;

    const keyword = req.query.keyword
        ? {
            name: {
                $regex: req.query.keyword,
                $options: 'i',
            },
        }
        : {};

    const category = req.query.category ? { categories: req.query.category } : {};

    const ownerFilter = req.query.owner ? { owner: req.query.owner } : {};

    const count = await Restaurant.countDocuments({ ...keyword, ...category, ...ownerFilter });
    const restaurants = await Restaurant.find({ ...keyword, ...category, ...ownerFilter })
        .limit(pageSize)
        .skip(pageSize * (page - 1));

    res.json({ restaurants, page, pages: Math.ceil(count / pageSize) });
});

// @desc    Fetch single restaurant
// @route   GET /api/restaurants/:id
// @access  Public
const getRestaurantById = asyncHandler(async (req, res) => {
    const restaurant = await Restaurant.findById(req.params.id);

    if (restaurant) {
        res.json(restaurant);
    } else {
        res.status(404);
        throw new Error('Restaurant not found');
    }
});

// @desc    Create a restaurant
// @route   POST /api/restaurants
// @access  Private/Admin or Owner
const createRestaurant = asyncHandler(async (req, res) => {
    const { name, description, address, pinCode, imageUrl, categories } = req.body;

    const restaurant = new Restaurant({
        name: name || 'New Restaurant',
        owner: req.user._id, // Will attach whoever called the API (admin or owner)
        imageUrl: imageUrl || '/images/sample.jpg',
        description: description || 'Add a description',
        address: address || 'Add an address',
        pinCode: pinCode || '000000',
        categories: categories || ['veg'],
    });

    const createdRestaurant = await restaurant.save();
    res.status(201).json(createdRestaurant);
});

// @desc    Update a restaurant
// @route   PUT /api/restaurants/:id
// @access  Private/Admin or Owner
const updateRestaurant = asyncHandler(async (req, res) => {
    const { name, description, address, pinCode, imageUrl, categories } = req.body;

    const restaurant = await Restaurant.findById(req.params.id);

    if (restaurant) {
        // Enforce that only the logged-in owner of this restaurant, or an admin, can update it
        if (restaurant.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            res.status(403);
            throw new Error('Not authorized to update this restaurant');
        }

        restaurant.name = name;
        restaurant.description = description;
        restaurant.address = address;
        restaurant.pinCode = pinCode;
        restaurant.imageUrl = imageUrl;
        restaurant.categories = categories;

        const updatedRestaurant = await restaurant.save();
        res.json(updatedRestaurant);
    } else {
        res.status(404);
        throw new Error('Restaurant not found');
    }
});

// @desc    Delete a restaurant
// @route   DELETE /api/restaurants/:id
// @access  Private/Admin or Owner
const deleteRestaurant = asyncHandler(async (req, res) => {
    const restaurant = await Restaurant.findById(req.params.id);

    if (restaurant) {
        // Enforce that only the logged-in owner of this restaurant, or an admin, can delete it
        if (restaurant.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            res.status(403);
            throw new Error('Not authorized to delete this restaurant');
        }

        await restaurant.deleteOne();
        res.json({ message: 'Restaurant removed' });
    } else {
        res.status(404);
        throw new Error('Restaurant not found');
    }
});

// @desc    Fetch logged in owner's restaurants
// @route   GET /api/restaurants/myrestaurants
// @access  Private/Owner
const getMyRestaurants = asyncHandler(async (req, res) => {
    const restaurants = await Restaurant.find({ owner: req.user._id });
    res.json(restaurants);
});

export {
    getRestaurants,
    getRestaurantById,
    createRestaurant,
    updateRestaurant,
    deleteRestaurant,
    getMyRestaurants,
};
