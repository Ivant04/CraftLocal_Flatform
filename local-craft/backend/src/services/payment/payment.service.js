const Payment = require('../../models/Payment');
const Order = require('../../models/Order');
const Booking = require('../../models/Booking');
const payosService = require('./payos.service');
const ApiError = require('../../utils/apiError');

class PaymentService {
  /**
   * Create payment for an Order
   */
  async createOrderPayment(userId, orderId, returnUrl, cancelUrl) {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    if (order.customer.toString() !== userId.toString()) {
      throw new ApiError(403, 'You are not authorized to pay for this order');
    }

    if (order.paymentStatus === 'PAID') {
      throw new ApiError(400, 'Order has already been paid');
    }

    const orderCode = Number(String(Date.now()).slice(-6));
    const payosData = await payosService.createPaymentLink({
      orderCode,
      amount: order.totalAmount,
      description: `Thanh toan don hang #${order._id.toString().slice(-6)}`,
      returnUrl: returnUrl || `${process.env.CLIENT_URL || 'http://localhost:5173'}/orders?payment=success`,
      cancelUrl: cancelUrl || `${process.env.CLIENT_URL || 'http://localhost:5173'}/orders?payment=cancelled`
    });

    const payment = await Payment.create({
      user: userId,
      order: order._id,
      amount: order.totalAmount,
      paymentMethod: 'PAYOS',
      payosOrderCode: orderCode,
      checkoutUrl: payosData.checkoutUrl,
      paymentStatus: 'PENDING',
      metadata: payosData
    });

    order.payment = payment._id;
    await order.save();

    return {
      payment,
      checkoutUrl: payosData.checkoutUrl
    };
  }

  /**
   * Create payment for a Workshop Booking
   */
  async createBookingPayment(userId, bookingId, returnUrl, cancelUrl) {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new ApiError(404, 'Booking not found');
    }

    if (booking.customer.toString() !== userId.toString()) {
      throw new ApiError(403, 'You are not authorized to pay for this booking');
    }

    if (booking.paymentStatus === 'PAID') {
      throw new ApiError(400, 'Booking has already been paid');
    }

    const orderCode = Number(String(Date.now()).slice(-6));
    const payosData = await payosService.createPaymentLink({
      orderCode,
      amount: booking.totalAmount,
      description: `Dat workshop #${booking._id.toString().slice(-6)}`,
      returnUrl: returnUrl || `${process.env.CLIENT_URL || 'http://localhost:5173'}/booking?payment=success`,
      cancelUrl: cancelUrl || `${process.env.CLIENT_URL || 'http://localhost:5173'}/booking?payment=cancelled`
    });

    const payment = await Payment.create({
      user: userId,
      booking: booking._id,
      amount: booking.totalAmount,
      paymentMethod: 'PAYOS',
      payosOrderCode: orderCode,
      checkoutUrl: payosData.checkoutUrl,
      paymentStatus: 'PENDING',
      metadata: payosData
    });

    booking.payment = payment._id;
    await booking.save();

    return {
      payment,
      checkoutUrl: payosData.checkoutUrl
    };
  }

  /**
   * Handle Webhook from PayOS
   */
  async handleWebhook(webhookBody) {
    const verifiedData = payosService.verifyPaymentWebhookData(webhookBody);
    const { orderCode, code } = verifiedData.data || verifiedData;

    const payment = await Payment.findOne({ payosOrderCode: orderCode });
    if (!payment) {
      throw new ApiError(404, `Payment with order code ${orderCode} not found`);
    }

    if (code === '00' || code === 0) {
      payment.paymentStatus = 'SUCCESS';
      await payment.save();

      if (payment.order) {
        await Order.findByIdAndUpdate(payment.order, {
          paymentStatus: 'PAID',
          orderStatus: 'CONFIRMED'
        });
      }

      if (payment.booking) {
        await Booking.findByIdAndUpdate(payment.booking, {
          paymentStatus: 'PAID',
          status: 'CONFIRMED'
        });
      }
    } else {
      payment.paymentStatus = 'FAILED';
      await payment.save();
    }

    return { status: payment.paymentStatus };
  }

  /**
   * Get payment details
   */
  async getPaymentById(paymentId) {
    const payment = await Payment.findById(paymentId)
      .populate('user', 'name email')
      .populate('order')
      .populate('booking');
    if (!payment) {
      throw new ApiError(404, 'Payment record not found');
    }
    return payment;
  }
}

module.exports = new PaymentService();
