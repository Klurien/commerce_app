const Hotel = require('../models/Hotel');
const Dish = require('../models/Dish');
const Order = require('../models/Order');
const Comment = require('../models/Comment');

// @desc    Create a new hotel
// @route   POST /api/seller/hotels
// @access  Private/Seller
exports.createHotel = async (req, res) => {
    try {
        const { name, description, category, logo, image, pricePerNight, location, address } = req.body;

        const hotel = await Hotel.create({
            name,
            description,
            sellerId: req.user.id,
            category,
            logo,
            image,
            pricePerNight,
            location,
            address
        });

        res.status(201).json(hotel);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get seller's hotels
// @route   GET /api/seller/hotels
// @access  Private/Seller
exports.getHotels = async (req, res) => {
    try {
        const hotels = await Hotel.find({ sellerId: req.user.id });
        res.json(hotels);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a hotel (business profile)
// @route   PUT /api/seller/hotels/:id
// @access  Private/Seller
exports.updateHotel = async (req, res) => {
    try {
        const { name, description, category, logo, image, pricePerNight, location, address } = req.body;

        let hotel = await Hotel.findById(req.params.id);

        if (!hotel) {
            return res.status(404).json({ message: 'Store not found' });
        }

        // Ensure user owns this hotel
        if (hotel.sellerId.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        hotel = await Hotel.findByIdAndUpdate(
            req.params.id,
            {
                name,
                description,
                category,
                logo,
                image,
                pricePerNight,
                location: location, // Expecting the full location object with type: 'Point' and coordinates []
                address
            },
            { new: true, runValidators: true }
        );

        res.json(hotel);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new dish
// @route   POST /api/seller/dishes
// @access  Private/Seller
exports.createDish = async (req, res) => {
    try {
        const { name, description, price, hotelId, image } = req.body;

        const dishData = {
            name,
            description,
            price: Number(price),
            sellerId: req.user.id,
            image
        };

        // Only add hotelId if it's a valid truthy string
        if (hotelId && hotelId.trim() !== "") {
            dishData.hotelId = hotelId;
        }

        const dish = await Dish.create(dishData);

        res.status(201).json(dish);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get seller's dishes
// @route   GET /api/seller/dishes
// @access  Private/Seller
exports.getDishes = async (req, res) => {
    try {
        const dishes = await Dish.find({ sellerId: req.user.id });
        res.json(dishes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get seller's orders
// @route   GET /api/seller/orders
// @access  Private/Seller
exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find({ sellerId: req.user.id })
            .populate('buyerId', 'name image')
            .populate('items.dishId', 'name image')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a seller's dish
// @route   PUT /api/seller/dishes/:id
// @access  Private/Seller
exports.updateDish = async (req, res) => {
    try {
        const dish = await Dish.findOne({ _id: req.params.id, sellerId: req.user.id });
        if (!dish) return res.status(404).json({ message: 'Product not found or unauthorized.' });

        const { name, description, price, image } = req.body;
        if (name) dish.name = name;
        if (description) dish.description = description;
        if (price !== undefined) dish.price = Number(price);
        if (image) dish.image = image;

        await dish.save();
        res.json(dish);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a seller's dish
// @route   DELETE /api/seller/dishes/:id
// @access  Private/Seller
exports.deleteDish = async (req, res) => {
    try {
        const dish = await Dish.findOneAndDelete({ _id: req.params.id, sellerId: req.user.id });
        if (!dish) return res.status(404).json({ message: 'Product not found or unauthorized.' });
        res.json({ message: 'Product deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get aggregated analytics for the seller
// @route   GET /api/seller/analytics
// @access  Private/Seller
exports.getAnalytics = async (req, res) => {
    try {
        const sellerId = req.user.id;

        // 1. Total Active Hotels
        const activeHotelsCount = await Hotel.countDocuments({ sellerId });

        // 2. Orders and Revenue
        const orders = await Order.find({ sellerId });
        const totalOrders = orders.length;
        
        // Sum revenue (excluding cancelled orders)
        const revenue = orders.reduce((sum, order) => {
            if (order.status !== 'cancelled') {
                return sum + (order.totalAmount || 0);
            }
            return sum;
        }, 0);

        // 3. Average Rating
        const comments = await Comment.find({ sellerId });
        let averageRating = 0;
        if (comments.length > 0) {
            const sumRating = comments.reduce((sum, comment) => sum + (comment.rating || 0), 0);
            averageRating = sumRating / comments.length;
        }

        res.json({
            activeHotels: activeHotelsCount,
            orders: totalOrders,
            revenue: Number(revenue.toFixed(2)),
            rating: comments.length > 0 ? Number(averageRating.toFixed(1)) : 5.0
        });

    } catch (error) {
        console.error('Analytics Error:', error);
        res.status(500).json({ message: 'Error fetching analytics' });
    }
};
