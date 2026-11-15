import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import Ticket from '../models/ticket.model';
import Booking from '../models/booking.model';
import Timeslot from '../models/timeslot.model';
import { generateQRCode } from '../utils/generateQRCode';
import { MailService } from './mail.service';

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
   * Trích xuất token từ URL hoặc chuỗi thô
   */
  private static parseToken(raw: string): string {
    const trimmed = (raw || '').trim();
    const tokenMatch = trimmed.match(/[?&]token=([^&]+)/);
    if (tokenMatch && tokenMatch[1]) {
      return decodeURIComponent(tokenMatch[1]).trim();
    }
    return trimmed;
  }

  /**
   * Check-in bằng QR token / mã vé / URL
   */
  static async checkIn(rawInput: string, userId: string, userRole?: string) {
    const token = this.parseToken(rawInput);
    if (!token) throw new Error('Vui lòng cung cấp mã vé hoặc quét QR hợp lệ');

    // 1. Tìm Ticket bằng qrToken
    let ticket = await Ticket.findOne({ qrToken: token });

    // 2. Fallback: Nếu không tìm thấy, thử tìm bằng _id (nếu là ObjectId hợp lệ)
    if (!ticket && mongoose.Types.ObjectId.isValid(token)) {
      ticket = await Ticket.findById(token);
    }

    // 3. Fallback: Tìm Ticket bằng bookingId
    if (!ticket && mongoose.Types.ObjectId.isValid(token)) {
      ticket = await Ticket.findOne({ bookingId: token });
    }

    // 4. Fallback: Tìm booking theo _id hoặc bookingCode
    let booking: any = null;
    if (ticket) {
      booking = await Booking.findById(ticket.bookingId)
        .populate('touristId', 'fullName email phone')
        .populate('workshopId', 'title location hostId');
    } else {
      const isOid = mongoose.Types.ObjectId.isValid(token);
      booking = await Booking.findOne({
        $or: [
          ...(isOid ? [{ _id: token }] : []),
          { bookingCode: token },
        ],
      })
        .populate('touristId', 'fullName email phone')
        .populate('workshopId', 'title location hostId');

      if (booking) {
        // Tự động tạo ticket nếu chưa có
        ticket = await this.createTicket(booking._id.toString());
      }
    }

    if (!ticket || !booking) {
      throw new Error('Vé hoặc mã đặt chỗ không tồn tại trong hệ thống');
    }

    if (ticket.status === 'USED') {
      throw new Error('Vé này đã được check-in trước đó');
    }
    if (ticket.status === 'EXPIRED') {
      throw new Error('Vé đã hết hạn');
    }

    const validStatuses = ['PAID', 'CONFIRMED', 'COMPLETED', 'CHECKED_IN'];
    if (!validStatuses.includes(booking.bookingStatus)) {
      throw new Error(`Vé chưa thanh toán hoặc đang ở trạng thái "${booking.bookingStatus}"`);
    }

    const timeslot = await Timeslot.findById(ticket.timeslotId || booking.timeslotId);
    if (!timeslot) {
      throw new Error('Khung giờ trải nghiệm không tồn tại');
    }

    const now = new Date();
    const startTime = new Date(timeslot.startTime);
    const endTime = new Date(timeslot.endTime);

    // Chặn check-in nếu khung giờ đã kết thúc trong quá khứ
    if (now > endTime) {
      const endTimeStr = endTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      const endDateStr = endTime.toLocaleDateString('vi-VN');
      throw new Error(`Khung giờ này đã kết thúc vào lúc ${endTimeStr} ngày ${endDateStr}, không thể check-in nữa.`);
    }

    // Cho phép khách đến check-in sớm (trong cùng ngày diễn ra workshop hoặc trước giờ bắt đầu)
    const isSameDay =
      now.getFullYear() === startTime.getFullYear() &&
      now.getMonth() === startTime.getMonth() &&
      now.getDate() === startTime.getDate();

    if (!isSameDay && now < startTime) {
      const dateStr = startTime.toLocaleDateString('vi-VN');
      const timeStr = startTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      throw new Error(`Vé này dành cho ngày ${dateStr} (bắt đầu lúc ${timeStr}). Chưa đến ngày diễn ra workshop.`);
    }

    const isEarlyCheckIn = now < startTime;

    // Phân quyền: ADMIN -> Cho phép luôn; HOST -> Kiểm tra xưởng; TOUR_GUIDE -> Kiểm tra phân công
    const isAdmin = userRole === 'ADMIN';
    const isWorkshopHost =
      userRole === 'HOST' &&
      booking.workshopId &&
      booking.workshopId.hostId &&
      booking.workshopId.hostId.toString() === userId;
    const isAssignedGuide =
      timeslot.tourGuideId && timeslot.tourGuideId.toString() === userId;
    const isUnassignedTimeslot = !timeslot.tourGuideId;

    if (!isAdmin && !isWorkshopHost && !isAssignedGuide && !isUnassignedTimeslot) {
      throw new Error('Bạn không có quyền check-in cho khung giờ này');
    }

    // Đánh dấu đã check-in
    ticket.status = 'USED';
    ticket.usedAt = new Date();
    ticket.checkedBy = userId as any;
    await ticket.save();

    booking.bookingStatus = 'CHECKED_IN';
    booking.checkedInAt = new Date();
    booking.checkedInBy = userId;
    await booking.save();

    const touristName = booking.touristId?.fullName || booking.touristId?.email || 'Khách hàng';
    const workshopTitle = booking.workshopId?.title || 'Workshop thủ công';
    const timeslotLabel = timeslot.startTime
      ? `${new Date(timeslot.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - ${new Date(timeslot.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`
      : 'Khung giờ tiêu chuẩn';

    // Gửi email xác nhận check-in cho du khách (bất đồng bộ)
    if (booking.touristId?.email) {
      const checkedInTimeStr = `${ticket.usedAt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} ngày ${ticket.usedAt.toLocaleDateString('vi-VN')}`;
      MailService.sendCheckInConfirmationToTourist({
        touristEmail: booking.touristId.email,
        touristName,
        workshopTitle,
        checkedInTime: checkedInTimeStr,
        bookingCode: booking.bookingCode || String(booking._id),
      }).catch((err) => console.error('[Mail Error - Checkin Confirmation]', err.message));
    }

    return {
      ticket,
      bookingCode: booking.bookingCode || booking._id,
      touristName,
      workshopTitle,
      timeslot: timeslotLabel,
      guests: booking.guests || 1,
      checkedInAt: ticket.usedAt,
      isEarlyCheckIn,
      note: isEarlyCheckIn
        ? `Khách đã đến check-in sớm (Workshop sẽ bắt đầu lúc ${new Date(timeslot.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })})`
        : 'Check-in đúng giờ thành công',
    };
  }
}
