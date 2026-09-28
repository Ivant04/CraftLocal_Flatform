const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Payment must belong to a User']
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0, 'Amount cannot be negative']
    },
    paymentMethod: {
      type: String,
      enum: {
        values: ['PAYOS', 'CASH', 'BANK_TRANSFER'],
        message: 'Payment method must be PAYOS, CASH, or BANK_TRANSFER'
      },
      default: 'PAYOS'
    },
    transactionId: {
      type: String,
      default: null
    },
    paymentStatus: {
      type: String,
      enum: {
        values: ['PENDING', 'SUCCESS', 'FAILED', 'CANCELLED'],
        message: 'Payment status must be PENDING, SUCCESS, FAILED, or CANCELLED'
      },
      default: 'PENDING'
    },
    payosOrderCode: {
      type: Number,
      default: null
    },
    checkoutUrl: {
      type: String,
      default: null
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Payment', paymentSchema);
