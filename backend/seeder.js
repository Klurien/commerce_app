const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Hotel = require('./models/Hotel');
const Dish = require('./models/Dish');
const bcrypt = require('bcryptjs');

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/multivendor');

const importData = async () => {
    try {
        await User.deleteMany();
        await Hotel.deleteMany();
        await Dish.deleteMany();

        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash('123456', salt);

        const usersToCreate = [
            { name: 'Admin User', email: 'admin@email.com', password, role: 'admin' },
            { name: 'Seller User', email: 'seller@email.com', password, role: 'seller' },
            { name: 'Buyer User', email: 'buyer@email.com', password, role: 'buyer' }
        ];

        const createdUsers = await User.insertMany(usersToCreate);
        const seller = createdUsers[1]._id;

        const hotels = [
            {
                name: 'Grand Plaza Hotel',
                description: 'Luxury hotel in the city center',
                sellerId: seller,
                location: { type: 'Point', coordinates: [-73.935242, 40.730610] }, // NYC
                address: '123 Main St, New York, NY',
                image: 'https://via.placeholder.com/400x300.png?text=Grand+Plaza',
                pricePerNight: 200
            },
            {
                name: 'Oceanview Resort',
                description: 'Beautiful beachside resort',
                sellerId: seller,
                location: { type: 'Point', coordinates: [-118.243685, 34.052235] }, // LA
                address: '456 Beach Way, Los Angeles, CA',
                image: 'https://via.placeholder.com/400x300.png?text=Oceanview+Resort',
                pricePerNight: 150
            }
        ];

        const createdHotels = await Hotel.insertMany(hotels);

        const dishes = [
            {
                name: 'Margherita Pizza',
                description: 'Classic cheese and tomato pizza',
                price: 15,
                sellerId: seller,
                hotelId: createdHotels[0]._id, // First hotel's restaurant
                image: 'https://via.placeholder.com/200.png?text=Pizza'
            },
            {
                name: 'Burger & Fries',
                description: 'Beef patty with fries',
                price: 12,
                sellerId: seller,
                hotelId: createdHotels[0]._id,
                image: 'https://via.placeholder.com/200.png?text=Burger'
            }
        ];

        await Dish.insertMany(dishes);

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

importData();
