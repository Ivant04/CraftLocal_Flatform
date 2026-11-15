import Payment, { IPayment } from '../models/payment.model';
import Booking from '../models/booking.model';
import Order from '../models/order.model';
import Product from '../models/product.model';
import Timeslot from '../models/timeslot.model';
import Workshop from '../models/workshop.model';
import User from '../models/user.model';
import { QRService } from './qr.service';
import { MailService } from './mail.service';

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
    let createdTicket: any = null;
    try {
      createdTicket = await QRService.createTicket(payment.bookingId!.toString());
      console.log(`[PaymentSuccess] Ticket ${createdTicket._id} đã tạo cho booking ${booking._id}`);
    } catch (err: any) {
      console.error(`[PaymentSuccess] Lỗi tạo ticket: ${err.message}`);
    }

    // Gửi email thông báo cho du khách và chủ xưởng (bất đồng bộ)
    (async () => {
      try {
        const [tourist, host, ws] = await Promise.all([
          User.findById(booking.touristId),
          User.findById(booking.hostId),
          Workshop.findById(booking.workshopId),
        ]);

        const timeslotDate = timeslot.startTime
          ? new Date(timeslot.startTime).toLocaleDateString('vi-VN')
          : 'Sắp tới';
        const timeslotTime = timeslot.startTime && timeslot.endTime
          ? `${new Date(timeslot.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - ${new Date(timeslot.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`
          : 'Khung giờ tiêu chuẩn';

        if (tourist?.email) {
          MailService.sendBookingConfirmationToTourist({
            touristEmail: tourist.email,
            touristName: tourist.fullName || 'Quý khách',
            bookingCode: booking.bookingCode,
            ticketCode: createdTicket?.ticketCode || `TCK-${booking.bookingCode}`,
            workshopTitle: ws?.title || 'Workshop thủ công',
            workshopAddress: ws?.address?.fullAddress || ws?.locationLabel || 'Địa chỉ xưởng',
            timeslotDate,
            timeslotTime,
            guests: booking.quantity,
            totalAmount: booking.totalPrice,
            bookingId: booking._id.toString(),
          }).catch((e) => console.error('[Mail Error - Tourist Booking]', e.message));
        }

        if (host?.email) {
          MailService.sendNewBookingAlertToHost({
            hostEmail: host.email,
            hostName: host.fullName || (host as any).hostProfile?.ownerName || 'Quý Chủ xưởng',
            workshopTitle: ws?.title || 'Workshop thủ công',
            bookingCode: booking.bookingCode,
            touristName: tourist?.fullName || 'Khách hàng',
            touristPhone: tourist?.phone || '',
            touristEmail: tourist?.email || '',
            timeslotDate,
            timeslotTime,
            guests: booking.quantity,
            totalAmount: booking.totalPrice,
          }).catch((e) => console.error('[Mail Error - Host Booking]', e.message));
        }
      } catch (err: any) {
        console.error('[Mail Error - Booking Payment Notification]', err.message);
      }
    })();
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

    // Gửi email thông báo cho du khách và chủ xưởng (bất đồng bộ)
    (async () => {
      try {
        const [tourist, host] = await Promise.all([
          User.findById(order.touristId),
          User.findById(order.hostId),
        ]);

        const fullShippingAddress = typeof order.shippingAddress === 'object'
          ? (order.shippingAddress as any).fullAddress || (order.shippingAddress as any).addressLine || 'Địa chỉ giao hàng'
          : String(order.shippingAddress || 'Địa chỉ giao hàng');

        if (tourist?.email) {
          MailService.sendOrderConfirmationToTourist({
            touristEmail: tourist.email,
            touristName: tourist.fullName || 'Quý khách',
            orderCode: order.orderCode,
            items: order.items,
            shippingAddress: fullShippingAddress,
            shippingFee: order.shippingFee || 0,
            totalAmount: order.totalAmount,
          }).catch((e) => console.error('[Mail Error - Tourist Order]', e.message));
        }

        if (host?.email) {
          MailService.sendNewOrderAlertToHost({
            hostEmail: host.email,
            hostName: host.fullName || (host as any).hostProfile?.ownerName || 'Chủ xưởng',
            orderCode: order.orderCode,
            touristName: tourist?.fullName || 'Khách hàng',
            touristPhone: tourist?.phone || '',
            shippingAddress: fullShippingAddress,
            items: order.items,
            totalAmount: order.totalAmount,
          }).catch((e) => console.error('[Mail Error - Host Order]', e.message));
        }
      } catch (err: any) {
        console.error('[Mail Error - Order Payment Notification]', err.message);
      }
    })();
  }
}
