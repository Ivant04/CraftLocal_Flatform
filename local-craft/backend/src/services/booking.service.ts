import Timeslot from '../models/timeslot.model';
import Booking from '../models/booking.model';
import Workshop from '../models/workshop.model';
import { randomUUID } from 'node:crypto';
import { calculateWorkshopPrice, WorkshopInputError } from '../../../shared/workshopPricing';

export class BookingService {
  /**
   * Tạo booking: kiểm tra chỗ nhưng chưa trừ slot (trừ ở payment success)
   */
  static async createBooking(touristId: string, timeslotId: string, quantity: number, couponCode = '') {
    if (!Number.isSafeInteger(quantity) || quantity < 1) throw new WorkshopInputError('Số khách không hợp lệ');
    const timeslot = await Timeslot.findById(timeslotId);
    if (!timeslot) {
      throw new WorkshopInputError('Khung giờ không tồn tại');
    }
    if (timeslot.status !== 'AVAILABLE' || timeslot.startTime <= new Date()) {
      throw new WorkshopInputError('Khung giờ không khả dụng');
    }
    if (timeslot.availableSlots < quantity) {
      throw new WorkshopInputError('Không đủ chỗ trống trong khung giờ này');
    }

    const workshop = await Workshop.findById(timeslot.workshopId);
    if (!workshop) throw new WorkshopInputError('Workshop không tồn tại');
    if (workshop.status !== 'ACTIVE') throw new WorkshopInputError('Workshop không khả dụng');
    if (quantity > workshop.maxGuestsPerSlot) throw new WorkshopInputError('Vượt quá số khách tối đa');

    const bookingCode = `BK-${Date.now()}-${randomUUID().slice(0, 6).toUpperCase()}`;
    const unitPrice = timeslot.price;
    const { totalPrice, discountAmount, couponCode: appliedCode } = calculateWorkshopPrice(unitPrice, quantity, workshop.promotion, couponCode);

    const booking = await Booking.create({
      bookingCode,
      touristId,
      workshopId: timeslot.workshopId,
      timeslotId: timeslot._id,
      hostId: timeslot.hostId,
      quantity,
      unitPrice,
      totalPrice,
      couponCode: appliedCode,
      discountAmount,
      bookingStatus: 'PENDING',
    });

    return booking;
  }
}

