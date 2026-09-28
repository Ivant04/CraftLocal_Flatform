const bookingService = require('../services/booking.service');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

class BookingController {
  createBooking = asyncHandler(async (req, res) => {
    const booking = await bookingService.createBooking(req.user._id, req.body);
    return ApiResponse.success(res, 201, 'Booking created successfully', booking);
  });

  getMyBookings = asyncHandler(async (req, res) => {
    const bookings = await bookingService.getUserBookings(req.user._id);
    return ApiResponse.success(res, 200, 'User bookings retrieved successfully', bookings);
  });

  getArtisanBookings = asyncHandler(async (req, res) => {
    const bookings = await bookingService.getArtisanBookings(req.user._id);
    return ApiResponse.success(res, 200, 'Artisan bookings retrieved successfully', bookings);
  });

  getAllBookings = asyncHandler(async (req, res) => {
    const bookings = await bookingService.getAllBookings(req.query);
    return ApiResponse.success(res, 200, 'All bookings retrieved successfully', bookings);
  });

  getBookingById = asyncHandler(async (req, res) => {
    const booking = await bookingService.getBookingById(req.params.id, req.user._id, req.user.role);
    return ApiResponse.success(res, 200, 'Booking retrieved successfully', booking);
  });

  updateStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const booking = await bookingService.updateBookingStatus(req.params.id, status);
    return ApiResponse.success(res, 200, 'Booking status updated successfully', booking);
  });
}

module.exports = new BookingController();
