const express = require('express');
const router = express.Router();
const {
    getAllHotels,
    getNearbyHotels,
    getHotelDetails,
    getAllDishes,
    getDishDetails, // Add this
    addDishComment, // Add this
    createBooking,
    createOrder,
    getMyOrders
} = require('../controllers/buyerController');
const { protect, authorize } = require('../middleware/auth');

// Public routes (or could be protected depending on needs)
router.get('/hotels', getAllHotels);
router.get('/hotels/nearby', getNearbyHotels);
router.get('/hotels/:id', getHotelDetails);
router.get('/dishes', getAllDishes);
router.get('/dishes/:id', getDishDetails);

// Protected routes
router.use(protect);
router.use(authorize('buyer', 'admin'));

router.post('/dishes/:id/comments', addDishComment);

router.post('/bookings', createBooking);
router.post('/orders', createOrder);
router.get('/orders', getMyOrders);

module.exports = router;
