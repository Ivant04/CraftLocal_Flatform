import { v4 as uuidv4 } from 'uuid';
import Ticket from '../models/ticket.model';
import Booking from '../models/booking.model';
import Timeslot from '../models/timeslot.model';
import { generateQRCode } from '../utils/generateQRCode';

export class QRService {
  /**
   * Tạo ticket QR sau khi thanh toán thành công
   */
  static async createTicket(bookingId: string) {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new Error('Booking không tồn tại');

    // Kiểm tra đã có ticket chưa
    const existingTicket = await Ticket.findOne({ bookingId });
    if (existingTicket) return existingTicket;

    const qrToken = `QR-${uuidv4()}`;
    const qrCodeImage = await generateQRCode(qrToken);

    const ticket = await Ticket.create({
      bookingId: booking._id,
      touristId: booking.touristId,
      workshopId: booking.workshopId,
      timeslotId: booking.timeslotId,
      qrToken,
      qrCodeImage,
      status: 'UNUSED',
    });

    // Gắn ticketId vào booking
    booking.ticketId = ticket._id as any;
    await booking.save();

    return ticket;
  }

  /**
   * Check-in bằng QR token
   */
  static async checkIn(qrToken: string, tourGuideId: string) {
    const ticket = await Ticket.findOne({ qrToken });
    if (!ticket) throw new Error('Vé không hợp lệ');
    if (ticket.status === 'USED') throw new Error('Vé đã được sử dụng');
    if (ticket.status === 'EXPIRED') throw new Error('Vé đã hết hạn');

    const booking = await Booking.findById(ticket.bookingId);
    if (!booking) throw new Error('Booking không tồn tại');
    if (booking.bookingStatus !== 'PAID') throw new Error('Vé chưa thanh toán hoặc trạng thái không hợp lệ');

    const timeslot = await Timeslot.findById(ticket.timeslotId);
    if (!timeslot) throw new Error('Khung giờ không tồn tại');
    if (!timeslot.tourGuideId || timeslot.tourGuideId.toString() !== tourGuideId) {
      throw new Error('Bạn không được phân công phụ trách khung giờ này, không thể check-in');
    }

    ticket.status = 'USED';
    ticket.usedAt = new Date();
    ticket.checkedBy = tourGuideId as any;
    await ticket.save();

    // Update booking status
    await Booking.findByIdAndUpdate(ticket.bookingId, {
      bookingStatus: 'CHECKED_IN',
      checkedInAt: new Date(),
      checkedInBy: tourGuideId,
    });

    return ticket;
  }
}

