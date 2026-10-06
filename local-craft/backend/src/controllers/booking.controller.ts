import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { BookingService } from '../services/booking.service';
import Booking from '../models/booking.model';
import Ticket from '../models/ticket.model';
import Timeslot from '../models/timeslot.model';

export const createBooking = asyncHandler(async (req: Request, res: Response) => {
  const { timeslotId, quantity } = req.body;
  const booking = await BookingService.createBooking(req.user!._id.toString(), timeslotId, quantity);
  sendSuccess(res, 'Đặt chỗ thành công! Vui lòng thanh toán để hoàn tất.', booking, 201);
});

export const getMyBookings = asyncHandler(async (req: Request, res: Response) => {
  const bookings = await Booking.find({ touristId: req.user!._id })
    .populate('workshopId', 'title images location')
    .populate('timeslotId', 'startTime endTime')
    .populate('hostId', 'fullName')
    .sort({ createdAt: -1 });
  sendSuccess(res, 'Lấy danh sách đặt chỗ', bookings);
});

export const getBookingById = asyncHandler(async (req: Request, res: Response) => {
  const booking = await Booking.findOne({ _id: req.params.id, touristId: req.user!._id })
    .populate('workshopId', 'title images')
    .populate('timeslotId', 'startTime endTime')
    .populate('hostId', 'fullName');
  if (!booking) return sendError(res, 'Booking không tồn tại', 404);
  sendSuccess(res, 'Lấy thông tin booking', booking);
});

export const getBookingTicket = asyncHandler(async (req: Request, res: Response) => {
  const booking = await Booking.findOne({ _id: req.params.id, touristId: req.user!._id })
    .populate('workshopId', 'title images');
  if (!booking) return sendError(res, 'Booking không tồn tại', 404);

  const ticket = await Ticket.findOne({ bookingId: booking._id });
  if (!ticket) return sendError(res, 'Vé chưa được tạo. Vui lòng hoàn tất thanh toán.', 404);

  // Return ticket with booking info merged
  sendSuccess(res, 'Lấy thông tin vé thành công', {
    ...ticket.toObject(),
    workshopId: booking.workshopId,
    bookingCode: booking.bookingCode,
    bookingStatus: booking.bookingStatus,
    quantity: booking.quantity,
  });
});

export const cancelBooking = asyncHandler(async (req: Request, res: Response) => {
  const booking = await Booking.findOne({ _id: req.params.id, touristId: req.user!._id });
  if (!booking) return sendError(res, 'Booking không tồn tại', 404);
  if (!['PENDING', 'PAID'].includes(booking.bookingStatus)) {
    return sendError(res, 'Không thể hủy booking ở trạng thái này');
  }

  const oldStatus = booking.bookingStatus;
  booking.bookingStatus = 'CANCELLED';
  booking.cancelReason = req.body.cancelReason || 'Khách hủy';
  await booking.save();

  // Chỉ hoàn trả chỗ trống nếu booking đã thanh toán (PAID) trước đó
  if (oldStatus === 'PAID') {
    const ts = await Timeslot.findById(booking.timeslotId);
    if (ts) {
      ts.bookedSlots = Math.max(0, ts.bookedSlots - booking.quantity);
      ts.availableSlots += booking.quantity;
      if (ts.availableSlots > 0 && ts.status === 'FULL') {
        ts.status = 'AVAILABLE';
      }
      await ts.save();
    }
  }

  sendSuccess(res, 'Hủy booking thành công', booking);
});

