const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, unique: true, sparse: true },
    password: { type: String },
    authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
    firebaseUid: { type: String, unique: true, sparse: true },
    role: {
        type: String,
        enum: ['admin', 'seller', 'buyer'],
        default: 'buyer'
    },
    avatar: { type: String, default: '' },
    bio: { type: String, default: 'Exploring the best tastes in town 🍕✨' },
    expoPushToken: { type: String, default: null },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
