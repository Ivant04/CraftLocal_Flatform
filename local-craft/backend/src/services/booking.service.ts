import Timeslot from '../models/timeslot.model';
import Booking from '../models/booking.model';
import Workshop from '../models/workshop.model';
import { v4 as uuidv4 } from 'uuid';

export class BookingService {
  /**
   * Tạo booking: kiểm tra chỗ nhưng chưa trừ slot (trừ ở payment success)
   */
  static async createBooking(touristId: string, timeslotId: string, quantity: number) {
    const timeslot = await Timeslot.findById(timeslotId);
    if (!timeslot) {
      throw new Error('Khung giờ không tồn tại');
    }
    if (timeslot.status !== 'AVAILABLE') {
      throw new Error('Khung giờ không khả dụng');
    }
    if (timeslot.availableSlots < quantity) {
      throw new Error('Không đủ chỗ trống trong khung giờ này');
    }

    const workshop = await Workshop.findById(timeslot.workshopId);
    if (!workshop) throw new Error('Workshop không tồn tại');

    const bookingCode = `BK-${Date.now()}-${uuidv4().slice(0, 6).toUpperCase()}`;
    const unitPrice = timeslot.price;
    const totalPrice = unitPrice * quantity;

    const booking = await Booking.create({
      bookingCode,
      touristId,
      workshopId: timeslot.workshopId,
      timeslotId: timeslot._id,
      hostId: timeslot.hostId,
      quantity,
      unitPrice,
      totalPrice,
      bookingStatus: 'PENDING',
    });

    return booking;
  }
}

