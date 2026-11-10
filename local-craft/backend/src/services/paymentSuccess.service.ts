import Payment, { IPayment } from '../models/payment.model';
import Booking from '../models/booking.model';
import Order from '../models/order.model';
import Product from '../models/product.model';
import Timeslot from '../models/timeslot.model';
import Workshop from '../models/workshop.model';
import { QRService } from './qr.service';

export class PaymentSuccessService {
  /**
   * Xử lý khi thanh toán booking thành công
   * Idempotent: không xử lý lại nếu booking đã PAID
   */
  static async handleSuccessfulBookingPayment(payment: IPayment) {
    const booking = await Booking.findById(payment.bookingId);
    if (!booking) {
      console.error(`[PaymentSuccess] Booking ${payment.bookingId} không tồn tại`);
      return;
    }

    // Idempotent: skip nếu booking đã xử lý
    if (['PAID', 'CHECKED_IN', 'COMPLETED'].includes(booking.bookingStatus)) {
      console.log(`[PaymentSuccess] Booking ${booking._id} đã ở trạng thái ${booking.bookingStatus}, bỏ qua`);
      return;
    }

    const timeslot = await Timeslot.findById(booking.timeslotId);
    if (!timeslot) {
      console.error(`[PaymentSuccess] Timeslot ${booking.timeslotId} không tồn tại`);
      return;
    }

    if (timeslot.availableSlots < booking.quantity) {
      console.error(`[PaymentSuccess] Timeslot ${timeslot._id} không đủ chỗ (cần ${booking.quantity}, còn ${timeslot.availableSlots})`);
      return;
    }

    // Update booking status
    booking.bookingStatus = 'PAID';
    booking.paymentId = payment._id as any;
    await booking.save();

    // Update timeslot slots
    timeslot.bookedSlots += booking.quantity;
    timeslot.availableSlots -= booking.quantity;
    if (timeslot.availableSlots <= 0) {
      timeslot.availableSlots = 0;
      timeslot.status = 'FULL';
    }
    await timeslot.save();

    // Tăng totalBookings cho workshop
    await Workshop.findByIdAndUpdate(booking.workshopId, {
      $inc: { totalBookings: booking.quantity },
    });

    // Tạo ticket QR nếu chưa có
    try {
      const ticket = await QRService.createTicket(payment.bookingId!.toString());
      console.log(`[PaymentSuccess] Ticket ${ticket._id} đã tạo cho booking ${booking._id}`);
    } catch (err: any) {
      console.error(`[PaymentSuccess] Lỗi tạo ticket: ${err.message}`);
    }
  }

  /**
   * Xử lý khi thanh toán order thành công
   * Idempotent: không xử lý lại nếu order đã CONFIRMED
   */
  static async handleSuccessfulOrderPayment(payment: IPayment) {
    const order = await Order.findById(payment.orderId);
    if (!order) {
      console.error(`[PaymentSuccess] Order ${payment.orderId} không tồn tại`);
      return;
    }

    // Idempotent: skip nếu order đã xử lý
    if (['CONFIRMED', 'PACKING', 'SHIPPING', 'COMPLETED'].includes(order.orderStatus)) {
      console.log(`[PaymentSuccess] Order ${order._id} đã ở trạng thái ${order.orderStatus}, bỏ qua`);
      return;
    }

    // Trừ stock sản phẩm
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity, sold: item.quantity },
      });
    }

    // Update order status
    order.orderStatus = 'CONFIRMED';
    order.paymentId = payment._id as any;
    order.confirmedAt = new Date();
    await order.save();
  }
}
