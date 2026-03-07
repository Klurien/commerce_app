const mongoose = require('mongoose');
const User = require('./models/User');
const Dish = require('./models/Dish');
const Hotel = require('./models/Hotel');
const bcrypt = require('bcryptjs');

async function seed() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/multivendor');

        // Clear existing (just in case)
        await User.deleteMany({ email: 'demo_seller@example.com' });

        // Create Seller
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        const seller = await User.create({
            name: 'Demo Seller',
            email: 'demo_seller@example.com',
            password: hashedPassword,
            role: 'seller',
            phone: '1234567890'
        });

        console.log('Seller created:', seller._id);

        // Create Hotel
        const hotel = await Hotel.create({
            name: 'Bolt Kitchen',
            address: '123 Innovation Way',
            sellerId: seller._id,
            pricePerNight: 0,
            logo: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=100&q=80',
            image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&q=80',
            category: 'Premium Selection',
            rating: 4.9,
            ratingCount: 128,
            location: {
                type: 'Point',
                coordinates: [-122.4194, 37.7749]
            }
        });

        console.log('Hotel created:', hotel._id);

        // Create Dishes
        const dishes = await Dish.insertMany([
            { name: 'Bolt Burger', description: 'Juicy beef burger with fresh lettuce', price: 12, category: 'Fast Food', sellerId: seller._id, hotelId: hotel._id, image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&q=80' },
            { name: 'Quick Pizza', description: 'Hot and cheesy pepperoni pizza', price: 15, category: 'Pizza', sellerId: seller._id, hotelId: hotel._id, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80' }
        ]);

        console.log('Dishes created:', dishes.map(d => d._id));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seed();
