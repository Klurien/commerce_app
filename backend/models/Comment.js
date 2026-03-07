const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Store owner
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' },
    dishId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dish' },
    text: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Comment', commentSchema);
