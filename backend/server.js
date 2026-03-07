const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health Check & Root Routes
app.get('/', (req, res) => {
  res.json({ message: 'Commerce API is running', status: 'healthy' });
});

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// DB Connection
// DB Connection
const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/multivendor';
console.log(`Connecting to MongoDB: ${mongoURI.replace(/:([^@]+)@/, ':****@')}`);

mongoose.connect(mongoURI, {
  // Explicitly ensuring no legacy options are passed if people add them to ENV
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error!!', err);
  process.exit(1); // Exit if DB fails
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/seller', require('./routes/sellerRoutes'));
app.use('/api/buyer', require('./routes/buyerRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
