const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Dish = require('./models/Dish');
const Hotel = require('./models/Hotel');

async function checkData() {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/multivendor';
        console.log(`Searching for data at: ${uri.replace(/:([^:@]{4,})@/, ':****@')}`);
        await mongoose.connect(uri);
        const sellers = await User.find({ role: 'seller' }).limit(5);
        const dishes = await Dish.find({}).limit(5);
        const hotels = await Hotel.find({}).limit(5);

        console.log('--- SELLERS ---');
        sellers.forEach(s => console.log(`${s.name}: ${s._id}`));
        console.log('--- DISHES ---');
        dishes.forEach(d => console.log(`${d.name}: ${d._id}`));
        console.log('--- HOTELS ---');
        hotels.forEach(h => console.log(`${h.name}: ${h._id}`));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkData();
