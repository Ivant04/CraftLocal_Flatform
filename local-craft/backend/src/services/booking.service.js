const Booking = require('../models/Booking');
const Workshop = require('../models/Workshop');
const Artisan = require('../models/Artisan');
const ApiError = require('../utils/apiError');

class BookingService {
  async createBooking(userId, { workshopId, bookingDate, quantity = 1 }) {
    const workshop = await Workshop.findById(workshopId);
    if (!workshop) {
      throw new ApiError(404, 'Workshop not found');
    }

    if (workshop.status !== 'ACTIVE') {
      throw new ApiError(400, 'Workshop is currently not available for booking');
    }

    if (workshop.availableSlots < quantity) {
      throw new ApiError(400, `Only ${workshop.availableSlots} slots available`);
    }

    const totalAmount = workshop.price * quantity;

    const booking = await Booking.create({
      customer: userId,
      workshop: workshopId,
      bookingDate,
      quantity,
      totalAmount,
      status: 'PENDING',
      paymentStatus: 'UNPAID'
    });

    // Decrement available slots
    workshop.availableSlots -= quantity;
    await workshop.save();

    return booking;
  }

  async getUserBookings(userId) {
    return await Booking.find({ customer: userId })
      .populate({
        path: 'workshop',
        populate: { path: 'artisan', select: 'studioName' }
      })
      .populate('payment')
      .sort({ createdAt: -1 });
  }

  async getArtisanBookings(userId) {
    const artisan = await Artisan.findOne({ user: userId });
    if (!artisan) {
      throw new ApiError(403, 'Artisan profile required');
    }

    const workshops = await Workshop.find({ artisan: artisan._id }).select('_id');
    const workshopIds = workshops.map((w) => w._id);

    return await Booking.find({ workshop: { $in: workshopIds } })
      .populate('customer', 'name email phone avatar')
      .populate('workshop', 'title price duration')
      .sort({ createdAt: -1 });
  }

  async getAllBookings(query = {}) {
    const filter = {};
    if (query.status) filter.status = query.status;
    return await Booking.find(filter)
      .populate('customer', 'name email phone')
      .populate('workshop', 'title price')
      .sort({ createdAt: -1 });
  }

  async getBookingById(id, userId, userRole) {
    const booking = await Booking.findById(id)
      .populate('customer', 'name email phone avatar')
      .populate({
        path: 'workshop',
        populate: { path: 'artisan' }
      })
      .populate('payment');

    if (!booking) {
      throw new ApiError(404, 'Booking not found');
    }

    if (userRole !== 'ADMIN' && booking.customer._id.toString() !== userId.toString()) {
      throw new ApiError(403, 'Access denied to this booking');
    }

    return booking;
  }

  async updateBookingStatus(id, status) {
    const booking = await Booking.findByIdAndUpdate(id, { status }, { new: true });
    if (!booking) {
      throw new ApiError(404, 'Booking not found');
    }
    return booking;
  }
}

module.exports = new BookingService();
