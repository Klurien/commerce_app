const Hotel = require('../models/Hotel');
const Dish = require('../models/Dish');
const Booking = require('../models/Booking');
const Order = require('../models/Order');
const User = require('../models/User');
const { Expo } = require('expo-server-sdk');

// Create a new Expo SDK client
const expo = new Expo();

// @desc    Get all hotels
// @route   GET /api/buyer/hotels
// @access  Public or Private/Buyer
exports.getAllHotels = async (req, res) => {
    try {
        const hotels = await Hotel.find({}).sort({ rating: -1 });
        res.json(hotels);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get hotel details and dishes
// @route   GET /api/buyer/hotels/:id
// @access  Public
exports.getHotelDetails = async (req, res) => {
    try {
        const hotel = await Hotel.findById(req.params.id);
        if (!hotel) {
            return res.status(404).json({ message: 'Store not found' });
        }
        const dishes = await Dish.find({ hotelId: req.params.id });
        res.json({ hotel, dishes });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all dishes
// @route   GET /api/buyer/dishes
// @access  Public
exports.getAllDishes = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const dishes = await Dish.find({})
            .populate('hotelId', 'name image logo')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Dish.countDocuments({});

        res.json({
            dishes,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            hasMore: page * limit < total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get hotels by location (geo query)
// @route   GET /api/buyer/hotels/nearby?lng=x&lat=y&distance=z
// @access  Public or Private/Buyer
exports.getNearbyHotels = async (req, res) => {
    try {
        const { lng, lat, distance } = req.query; // distance in meters

        const hotels = await Hotel.find({
            location: {
                $near: {
                    $maxDistance: parseInt(distance) || 10000, // default 10km
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    }
                }
            }
        });

        res.json(hotels);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a booking
// @route   POST /api/buyer/bookings
// @access  Private/Buyer
exports.createBooking = async (req, res) => {
    try {
        const { hotelId, checkInDate, checkOutDate, totalPrice } = req.body;

        const booking = await Booking.create({
            hotelId,
            buyerId: req.user.id,
            checkInDate,
            checkOutDate,
            totalPrice
        });

        res.status(201).json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a food order
// @route   POST /api/buyer/orders
// @access  Private/Buyer
exports.createOrder = async (req, res) => {
    try {
        const { sellerId, items, totalAmount, deliveryAddress, deliveryLocation, recipientName } = req.body;

        const order = await Order.create({
            buyerId: req.user.id,
            sellerId,
            items,
            totalAmount,
            deliveryAddress,
            deliveryLocation,
            recipientName
        });

        // Fetch seller to check for expoPushToken
        const seller = await User.findById(sellerId);
        if (seller && seller.expoPushToken && Expo.isExpoPushToken(seller.expoPushToken)) {
            const messages = [{
                to: seller.expoPushToken,
                sound: 'default',
                title: 'New Order Received! 🛍️',
                body: `You received a new order for ${totalAmount} from ${recipientName}`,
                data: { orderId: order._id },
            }];

            try {
                let chunks = expo.chunkPushNotifications(messages);
                for (let chunk of chunks) {
                    await expo.sendPushNotificationsAsync(chunk);
                }
            } catch (error) {
                console.error('Error sending push notification:', error);
            }
        }

        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get my orders
// @route   GET /api/buyer/orders
// @access  Private/Buyer
exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ buyerId: req.user.id })
            .populate('sellerId', 'name address')
            .populate('items.dishId', 'name image')
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get dish details, hotel info, and comments
// @route   GET /api/buyer/dishes/:id
// @access  Public
exports.getDishDetails = async (req, res) => {
    try {
        const dish = await Dish.findById(req.params.id).populate('hotelId', 'name image logo address rating');
        if (!dish) {
            return res.status(404).json({ message: 'Dish not found' });
        }

        const Comment = require('../models/Comment');
        const comments = await Comment.find({ dishId: req.params.id })
            .populate('userId', 'name avatar')
            .sort({ createdAt: -1 });

        res.json({ dish, comments });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a comment/rating to a dish
// @route   POST /api/buyer/dishes/:id/comments
// @access  Private/Buyer
exports.addDishComment = async (req, res) => {
    try {
        const { text, rating } = req.body;
        const Comment = require('../models/Comment');
        const dish = await Dish.findById(req.params.id);

        if (!dish) {
            return res.status(404).json({ message: 'Dish not found' });
        }

        const comment = await Comment.create({
            userId: req.user.id,
            sellerId: dish.sellerId,
            dishId: dish._id,
            hotelId: dish.hotelId,
            text,
            rating
        });

        res.status(201).json(comment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
