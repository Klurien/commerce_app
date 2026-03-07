const express = require('express');
const router = express.Router();
const { getUsers, getMetrics } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// Require authentication and 'admin' role for all admin routes
router.use(protect);
router.use(authorize('admin'));

router.get('/users', getUsers);
router.get('/metrics', getMetrics);

module.exports = router;
