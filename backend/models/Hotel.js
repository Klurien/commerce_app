const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        }
    },
    address: { type: String, required: true },
    image: { type: String }, // Main display image
    logo: { type: String }, // Rounded profile pic
    businessImages: [{ type: String }], // Array of business photos
    category: { type: String, default: 'General' },
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    pricePerNight: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});

// Create geospatial index for location-based searches
hotelSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Hotel', hotelSchema);
