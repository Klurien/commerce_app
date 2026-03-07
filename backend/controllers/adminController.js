const User = require('../models/User');
const Hotel = require('../models/Hotel');
const Booking = require('../models/Booking');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get system metrics (total users, hotels, bookings)
// @route   GET /api/admin/metrics
// @access  Private/Admin
exports.getMetrics = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({});
        const totalHotels = await Hotel.countDocuments({});
        const totalBookings = await Booking.countDocuments({});

        res.json({
            users: totalUsers,
            hotels: totalHotels,
            bookings: totalBookings
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
