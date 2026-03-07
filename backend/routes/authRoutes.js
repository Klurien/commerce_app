const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    googleAuth,
    getMe,
    updateProfile,
    updatePushToken,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleAuth);
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);
router.put('/push-token', protect, updatePushToken);

module.exports = router;
