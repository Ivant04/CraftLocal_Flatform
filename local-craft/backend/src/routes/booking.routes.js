const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

router.post('/', authenticate, bookingController.createBooking);
router.get('/my', authenticate, bookingController.getMyBookings);
router.get('/artisan', authenticate, authorize('ARTISAN', 'ADMIN'), bookingController.getArtisanBookings);
router.get('/', authenticate, authorize('ADMIN'), bookingController.getAllBookings);
router.get('/:id', authenticate, bookingController.getBookingById);
router.patch('/:id/status', authenticate, authorize('ARTISAN', 'ADMIN'), bookingController.updateStatus);

module.exports = router;
