const express = require('express');
const router = express.Router();
const ApiResponse = require('../utils/apiResponse');

// Import sub-routes
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const artisanRoutes = require('./artisan.routes');
const categoryRoutes = require('./category.routes');
const workshopRoutes = require('./workshop.routes');
const productRoutes = require('./product.routes');
const bookingRoutes = require('./booking.routes');
const orderRoutes = require('./order.routes');
const reviewRoutes = require('./review.routes');
const paymentRoutes = require('./payment.routes');

// Health Check Endpoint
router.get('/health', (req, res) => {
  return ApiResponse.success(res, 200, 'Local Craft API is running healthy', {
    service: 'Local Craft Backend API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/artisans', artisanRoutes);
router.use('/categories', categoryRoutes);
router.use('/workshops', workshopRoutes);
router.use('/products', productRoutes);
router.use('/bookings', bookingRoutes);
router.use('/orders', orderRoutes);
router.use('/reviews', reviewRoutes);
router.use('/payments', paymentRoutes);

module.exports = router;
