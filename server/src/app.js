require('express-async-errors');
const express = require('express');
const cors = require('cors');
const { errorHandler } = require('./middleware/errorHandler');

// Route imports
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/user', userRoutes);
app.use('/api/product', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/order', orderRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('E-Commerce API is running...');
});

// Error Handler
app.use(errorHandler);

module.exports = app;
