import { v4 as uuidv4 } from 'uuid';
import Payment from '../models/payment.model';
import Booking from '../models/booking.model';
import Order from '../models/order.model';
import Product from '../models/product.model';
import Timeslot from '../models/timeslot.model';
import Workshop from '../models/workshop.model';
import { QRService } from './qr.service';
import { env } from '../config/env';

export class PaymentService {
  /**
   * Tạo payment URL (mock)
   */
  static async createPaymentUrl(data: { userId: string; bookingId?: string; orderId?: string; amount: number; method?: string }) {
    const paymentCode = `PAY-${Date.now()}-${uuidv4().slice(0, 6).toUpperCase()}`;
    const payment = await Payment.create({
      paymentCode,
      userId: data.userId,
      bookingId: data.bookingId,
      orderId: data.orderId,
      amount: data.amount,
      method: data.method || 'VNPAY',
      paymentStatus: 'PENDING',
      paymentUrl: `${env.PAYMENT_RETURN_URL}?paymentId=${paymentCode}&status=success`,
    });

    // Gắn paymentId vào booking hoặc order
    if (data.bookingId) {
      await Booking.findByIdAndUpdate(data.bookingId, { paymentId: payment._id });
    }
    if (data.orderId) {
      await Order.findByIdAndUpdate(data.orderId, { paymentId: payment._id });
    }

    return payment;
  }

  /**
   * Mock payment thành công
   */
  static async mockSuccess(paymentId: string) {
    const payment = await Payment.findById(paymentId);
    if (!payment) throw new Error('Payment không tồn tại');
    if (payment.paymentStatus === 'SUCCESS') throw new Error('Thanh toán đã hoàn tất trước đó');

    payment.paymentStatus = 'SUCCESS';
    payment.paidAt = new Date();
    payment.transactionCode = `TXN-${uuidv4().slice(0, 8).toUpperCase()}`;
    await payment.save();

    // Xử lý booking
    if (payment.bookingId) {
      const booking = await Booking.findById(payment.bookingId);
      if (!booking) throw new Error('Booking không tồn tại');
      if (booking.bookingStatus !== 'PENDING') throw new Error('Booking không ở trạng thái chờ thanh toán');

      const timeslot = await Timeslot.findById(booking.timeslotId);
      if (!timeslot) throw new Error('Khung giờ không tồn tại');
      if (timeslot.availableSlots < booking.quantity) {
        throw new Error('Khung giờ không đủ chỗ trống');
      }

      // Giảm chỗ trống của khung giờ
      timeslot.bookedSlots += booking.quantity;
      timeslot.availableSlots -= booking.quantity;
      if (timeslot.availableSlots <= 0) {
        timeslot.availableSlots = 0;
        timeslot.status = 'FULL';
      }
      await timeslot.save();

      booking.bookingStatus = 'PAID';
      await booking.save();

      // Tăng totalBookings cho workshop
      await Workshop.findByIdAndUpdate(booking.workshopId, {
        $inc: { totalBookings: booking.quantity },
      });

      // Tạo ticket QR
      await QRService.createTicket(payment.bookingId.toString());
    }

    // Xử lý order
    if (payment.orderId) {
      const order = await Order.findByIdAndUpdate(payment.orderId, {
        orderStatus: 'CONFIRMED',
        confirmedAt: new Date(),
      }, { new: true });

      // Trừ stock sản phẩm
      if (order) {
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { stock: -item.quantity, sold: item.quantity },
          });
        }
      }
    }

    return payment;
  }
}

