const express = require('express');
const router = express.Router();
const {
    createHotel,
    getHotels,
    updateHotel,
    createDish,
    getDishes,
    updateDish,
    deleteDish,
    getOrders,
    getAnalytics
} = require('../controllers/sellerController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('seller', 'admin')); // Admin can also manage

router.route('/hotels')
    .post(createHotel)
    .get(getHotels);

router.get('/analytics', getAnalytics);

router.route('/hotels/:id')
    .put(updateHotel);


router.route('/dishes')
    .post(createDish)
    .get(getDishes);

router.route('/dishes/:id')
    .put(updateDish)
    .delete(deleteDish);

router.route('/orders')
    .get(getOrders);

module.exports = router;
