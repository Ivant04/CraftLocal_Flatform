const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Booking must belong to a Customer']
    },
    workshop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workshop',
      required: [true, 'Booking must be for a Workshop']
    },
    bookingDate: {
      type: Date,
      required: [true, 'Please provide booking date']
    },
    quantity: {
      type: Number,
      required: [true, 'Please provide number of participants'],
      min: [1, 'Quantity must be at least 1'],
      default: 1
    },
    totalAmount: {
      type: Number,
      required: [true, 'Please provide total amount'],
      min: [0, 'Total amount cannot be negative']
    },
    status: {
      type: String,
      enum: {
        values: ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'],
        message: 'Status must be PENDING, CONFIRMED, COMPLETED, or CANCELLED'
      },
      default: 'PENDING'
    },
    paymentStatus: {
      type: String,
      enum: {
        values: ['UNPAID', 'PAID', 'REFUNDED'],
        message: 'Payment status must be UNPAID, PAID, or REFUNDED'
      },
      default: 'UNPAID'
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Booking', bookingSchema);
